const { default: axios } = require('axios');
const os = require('os');
const connection = require('../utils/database');

// Performance optimizations
const base_url = "https://TransferBE.tektravels.com/TransferService.svc/rest/";
const base_url_shared = " http://sharedapi.tektravels.com/SharedData.svc/rest/";
const base_url_transfer = "http://sharedapi.tektravels.com/staticdata.svc/rest/";

// Cache IP address to avoid repeated network interface scanning
let cachedIP = null;
function getLocalIP() {
    if (cachedIP) return cachedIP;
    
    const interfaces = os.networkInterfaces();
    for (const name in interfaces) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                cachedIP = iface.address;
                return cachedIP;
            }
        }
    }
    cachedIP = '127.0.0.1';
    return cachedIP;
}


// Reusable enhancement function for better performance
function enhancePickUpDropOff(result) {
    // Process PickUp object
    if (result.PickUp) {
        const pickUp = result.PickUp;
        if (!pickUp.Description) {
            pickUp.Description = "AI-2846";
        }
        if (!pickUp.Time && pickUp.PickUpTime) {
            pickUp.Time = pickUp.PickUpTime;
            delete pickUp.PickUpTime;
        } else if (!pickUp.Time) {
            pickUp.Time = "0000";
        }
    }
    
    // Process DropOff object
    if (result.DropOff) {
        const dropOff = result.DropOff;
        if (!dropOff.Description) {
            dropOff.Description = "AI-2846";
        }
    }
    
    return result;
}



exports.authenticateTransferAPI = async (req, res) => {
    try {
        const data = {
            "UserName": process.env.TRANSFER_API_USERNAME,
            "Password": process.env.TRANSFER_API_PASSWORD,
            "ClientId": process.env.TRANSFER_API_CLIENT_ID,
            "EndUserIp": getLocalIP()
        };
        
        const apiResponse = await axios.post(
            `${base_url_shared}Authenticate`,
            data,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        res.status(200).json({
            TokenId: apiResponse?.data?.TokenId,
            AgencyId: apiResponse?.data?.Member?.AgencyId,
            EndUserIp: getLocalIP(),
            message: "Transfer API authenticated successfully"
        });
    } catch (error) {
        console.error('Error authenticating transfer API:', error.message);
        res.status(500).json({ message: error.message });
    }
}

exports.getTransferCountryList = async (req, res) => {
    try {
        const {TokenId, EndUserIp} = req.body;

        if (!TokenId || !EndUserIp) {
            return res.status(400).json({
                success: false,
                message: "TokenId and EndUserIp are required"
            });
        }

        const data = {
            "ClientId": process.env.TRANSFER_API_CLIENT_ID,
            "TokenId": TokenId,
            "EndUserIp": EndUserIp
        };

        const apiResponse = await axios.post(
            `${base_url_shared}CountryList`,
            data,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        res.status(200).json(apiResponse.data);
    } catch (error) {
        console.error('Error getting country list:', error.message);
        res.status(500).json({ message: error.message });
    }
}

exports.GetDestinationSearch = async (req, res) => {
    try {
        const {TokenId, EndUserIp, CountryCode} = req.body;
        
        if (!TokenId || !EndUserIp || !CountryCode) {
            return res.status(400).json({
                success: false,
                message: "TokenId, EndUserIp and CountryCode are required"
            });
        }
        
        const data = {
            "TokenId": TokenId,
            "EndUserIp": EndUserIp,
            "CountryCode": CountryCode
        };

        const apiResponse = await axios.post(
            `${base_url_transfer}GetDestinationSearchStaticData`,
            data,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        // Transform the response to the desired format
        if (apiResponse.data?.Destinations) {
            const transformedDestinations = apiResponse.data.Destinations.map(destination => ({
                CityId: destination.DestinationId,
                CityNamewithCountry: `${destination.CityName},${destination.CountryName}`,
                CountryCode: destination.CountryCode
            }));
            
            res.status(200).json({
                success: true,
                destinations: transformedDestinations
            });
        } else {
            res.status(200).json(apiResponse.data);
        }
    } catch (error) {
        console.error('Error getting destination search:', error.message);
        res.status(500).json({ message: error.message });
    }
}  
exports.GetTransferStaticData = async (req, res) => {
    console.log("Yes, calling the transfer API");
    console.log("Request body is working... ", req.body);
    try {
        const {TokenId, EndUserIp, CityId, TransferCategoryType} = req.body;
        
        if (!TokenId || !EndUserIp || !CityId || !TransferCategoryType) {
            return res.status(400).json({
                success: false,
                message: "TokenId, EndUserIp, CityId and TransferCategoryType are required"
            });
        }
        
        const data = {
            "TokenId": TokenId,
            "EndUserIp": EndUserIp,
            "CityId": CityId,
            "TransferCategoryType": TransferCategoryType,
            "ClientId": process.env.TRANSFER_API_CLIENT_ID
        };
        

        const apiResponse = await axios.post(
            `${base_url_transfer}GetTransferStaticData`,
            data,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        
        let processedResponse = apiResponse.data;
        
        // Enhance PickUp and DropOff objects in static data if present
        if (processedResponse?.TransferSearchResult?.TransferSearchResults) {
            processedResponse.TransferSearchResult.TransferSearchResults = 
                processedResponse.TransferSearchResult.TransferSearchResults.map(enhancePickUpDropOff);
        }

        res.status(200).json(processedResponse);
    } catch (error) {
        console.error('Error getting transfer static data:', error.message);
        res.status(500).json({ message: error.message });
    }
}
exports.GetSearchTransfer = async (req, res) => {
    try {
        const requiredFields = [
            'TokenId', 'EndUserIp', 'CountryCode', 'CityId', 
            'PickUpCode', 'PickUpPointCode', 'DropOffCode', 'DropOffPointCode',
            'TransferTime', 'TransferDate', 'AdultCount'
        ];
        
        const missingFields = requiredFields.filter(field => !req.body[field]);
        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        const { user_id, ...searchParams } = req.body;
        
        const data = {
            ...searchParams,
            "PreferredCurrency": "INR",
            "IsBaseCurrencyRequired": true
        };
        
        const apiResponse = await axios.post(
            `${base_url}Search`,
            data,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        let processedResponse = apiResponse.data;
        
        // Enhance PickUp and DropOff objects in search results
        if (processedResponse?.TransferSearchResult?.TransferSearchResults) {
            processedResponse.TransferSearchResult.TransferSearchResults = 
                processedResponse.TransferSearchResult.TransferSearchResults.map(enhancePickUpDropOff);
        }

        res.status(200).json(processedResponse);
    } catch (error) {
        console.error('Error searching transfers:', error.message);
        res.status(500).json({ message: error.message });
    }
}
