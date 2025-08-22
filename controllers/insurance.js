const { default: axios } = require('axios');
const os = require('os');

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

exports.authenticateInsuranceAPI = async (req, res) => {
    console.log("Yes, calling the insurance API");
    
    const data = {
        "UserName": process.env.INSURANCE_API_USERNAME,
        "Password": process.env.INSURANCE_API_PASSWORD,
        "ClientId": process.env.INSURANCE_API_CLIENT_ID,
        "EndUserIp": getLocalIP()
    }
    
    // console.log("Data is working... ", data);
    
    try {
        const apiResponse = await axios.post(
            'http://sharedapi.tektravels.com/SharedData.svc/rest/Authenticate',
            data,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        // console.log("API Response is working... ", apiResponse.data);

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

exports.GetInsuranceList = async (req, res) => {
    console.log("Yes, calling the insurance API");
    console.log(req.body);
    
    const { 
        PlanCategory, 
        PlanType, 
        PlanCoverage, 
        TravelStartDate,
        EndDate,
        NoOfPax, 
        PaxAge,
        EndUserIp,
        TokenId
    } = req.body;

    // Quick validation - fail fast approach
    if (!TravelStartDate || !NoOfPax || !PaxAge || !TokenId || !EndUserIp) {
        return res.status(400).json({ 
            message: "Missing required parameters: TravelStartDate, NoOfPax, PaxAge, TokenId, and EndUserIp are required" 
        });
    }

    // Validate PaxAge array and NoOfPax match
    if (!Array.isArray(PaxAge) || PaxAge.length === 0 || NoOfPax !== PaxAge.length) {
        return res.status(400).json({ 
            message: "Invalid PaxAge array or NoOfPax mismatch" 
        });
    }

    // Prepare data object efficiently
    const data = {
        "PlanCategory": PlanCategory || 2,
        "PlanType": PlanType || 1,
        "PlanCoverage": PlanCoverage || 1,
        "TravelStartDate": TravelStartDate,
        "EndDate": EndDate,
        "NoOfPax": NoOfPax,
        "PaxAge": PaxAge,
        "EndUserIp": EndUserIp,
        "TokenId": TokenId
    };

    console.log("Insurance search data:", data);

    try {
        // Optimized axios request with timeout and performance settings
        const apiResponse = await axios.post(
            'https://InsuranceBE.tektravels.com/InsuranceService.svc/rest/Search',
            data,
            {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 15000, // 15 second timeout
                maxRedirects: 3,
                maxContentLength: 50 * 1024 * 1024, // 50MB max
                validateStatus: function (status) {
                    return status >= 200 && status < 300; // Accept only 2xx status codes
                }
            }
        );

        console.log("Insurance search API response received");
        
        // Fast response validation
        const response = apiResponse.data?.Response;
        if (!response) {
            return res.status(500).json({ 
                message: 'Invalid response structure from insurance API'
            });
        }
        
        // Check response status efficiently
        if (response.ResponseStatus === 1 && 
            (!response.Error || response.Error.ErrorCode === 0)) {
            
            console.log(`Insurance search successful. Found ${response.Results?.length || 0} plans`);
            return res.status(200).json(apiResponse.data);
        }
        
        // Handle API errors efficiently
        const error = response.Error;
        console.error('Insurance search API error:', error?.ErrorMessage || 'Unknown error', 'Code:', error?.ErrorCode);
        
        return res.status(400).json({
            message: error?.ErrorMessage || 'Insurance search failed',
            errorCode: error?.ErrorCode || 'Unknown',
            traceId: response.TraceId
        });

    } catch (error) {
        console.error('Error in GetInsuranceList:', error.message);
        
        // Handle specific API errors efficiently
        if (error.response?.data?.Response?.Error) {
            const errorData = error.response.data.Response.Error;
            return res.status(400).json({ 
                message: errorData.ErrorMessage || 'Insurance search failed',
                errorCode: errorData.ErrorCode,
                traceId: error.response.data.Response.TraceId
            });
        }
        
        // Handle timeout and network errors
        if (error.code === 'ECONNABORTED') {
            return res.status(408).json({ 
                message: 'Request timeout - insurance service is taking too long to respond' 
            });
        }
        
        if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
            return res.status(503).json({ 
                message: 'Insurance service is currently unavailable' 
            });
        }
        
        return res.status(500).json({ 
            message: 'Internal server error while processing insurance request' 
        });
    }
}
