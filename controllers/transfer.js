const { default: axios } = require('axios');
const os = require('os');


 const base_url = "https://TransferBE.tektravels.com/TransferService.svc/rest/";
 const base_url_shared = " http://sharedapi.tektravels.com/SharedData.svc/rest/";
 const base_url_transfer = "http://sharedapi.tektravels.com/staticdata.svc/rest/";
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name in interfaces) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return '127.0.0.1';
}



exports.authenticateTransferAPI = async (req, res) => {
    console.log("Yes, calling the transfer API");
    
    const data = {
        "UserName": process.env.TRANSFER_API_USERNAME,
        "Password": process.env.TRANSFER_API_PASSWORD,
        "ClientId": process.env.TRANSFER_API_CLIENT_ID,
        "EndUserIp": getLocalIP()
    }   
    
    console.log("Data is working... ", data);
    
    try {
        const apiResponse = await axios.post(
            `${base_url_shared}Authenticate`,
            data,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log("API Response is working... ", apiResponse.data);

        res.status(200).json({
            TokenId: apiResponse.data.TokenId,
            // TokenAgencyId: apiResponse.data.Member.AgencyId,
            // TokenMemberId: apiResponse.data.Member.MemberId,
            EndUserIp: getLocalIP(),
            message: "Insurance API authenticated successfully"
        });
    } catch (error) {
        // console.error('Error authenticating insurance API:', error);
        res.status(500).json({ message: error.message });
    }
}

exports.getTransferCountryList = async (req, res) => {
    console.log("Yes, calling the transfer API");
    let {TokenId, EndUserIp} = req.body;

    if(!TokenId || !EndUserIp){
        return res.status(400).json({
            success: false,
            message: "TokenId and EndUserIp are required"
        });
    }

    const data = {
        "ClientId": process.env.TRANSFER_API_CLIENT_ID,
        "TokenId": TokenId,
        "EndUserIp": EndUserIp
    }
    try {
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
        res.status(500).json({ message: error.message });
    }
}


exports.GetDestinationSearch = async (req, res) => {
    console.log("req.body",req.body);
    console.log("Yes, calling the transfer API");
    let {TokenId,EndUserIp,CountryCode}=req.body;
    if(!TokenId || !EndUserIp || !CountryCode){
        return res.status(400).json({
            success: false,
            message: "TokenId, EndUserIp and CountryCode are required"
        });
    }
    
    const data = {
        "TokenId": TokenId,
        "EndUserIp": EndUserIp,
        "CountryCode": CountryCode,
    }
    try {
        const apiResponse = await axios.post(
            `${base_url_transfer}GetDestinationSearchStaticData`,
            data,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log("apiResponse",apiResponse.data);
        // Transform the response to the desired format
        if (apiResponse.data?.Destinations) {
            const destinations = apiResponse.data.Destinations;
                        
            const transformedDestinations = destinations.map(destination => ({
                CityId: destination.DestinationId,
                CityNamewithCountry: `${destination.CityName},${destination.CountryName}`,
                CountryCode: destination.CountryCode
            }));
            console.log("transformedDestinations",transformedDestinations);
            res.status(200).json({
                success: true,
                destinations: transformedDestinations
            });
        }  
    } catch (error) {
        res.status(500).json({ message: error.message });
        
    }
}

exports.GetTransferStaticData= async (req, res) => {
    console.log("Yes, calling the transfer API");
    let {TokenId,EndUserIp,CityId,TransferCategoryType}=req.body;
    if(!TokenId || !EndUserIp || !CityId || !TransferCategoryType){
        return res.status(400).json({
            success: false,
            message: `${TokenId}, ${EndUserIp}, ${CityId}, ${TransferCategoryType} are required`
        });
    }
    
    const data = {
        "TokenId": TokenId,
        "EndUserIp": EndUserIp,
        "CItyId": CityId,
        "TransferCategoryType":TransferCategoryType,
        "ClientId":process.env.TRANSFER_API_CLIENT_ID
    }
    try {
        const apiResponse = await axios.post(
            `${base_url_transfer}GetTransferStaticData`,
            data,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        res.status(200).json(apiResponse.data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}