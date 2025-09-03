const { default: axios } = require('axios');
const os = require('os');


 const base_url = "https://InsuranceBE.tektravels.com/InsuranceService.svc/rest";
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
    // console.log("Yes, calling the insurance API");
    
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
    // console.log("Yes, calling the insurance API");
    // console.log(req.body);
    
    const { 
        PlanCategory, 
        PlanType, 
        PlanCoverage, 
        TravelStartDate,
        TravelEndDate,
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
        "TravelEndDate": TravelEndDate,
        "NoOfPax": NoOfPax,
        "PaxAge": PaxAge,
        "EndUserIp": EndUserIp,
        "TokenId": TokenId
    };

    console.log("Insurance search data:", data);

    try {
        // Optimized axios request with timeout and performance settings
        const apiResponse = await axios.post(
            `${base_url}/Search`,
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

exports.GetInsuranceBook = async (req, res) => {
    // console.log("Yes, calling the insurance API");
    // console.log(req.body);
    // const  GenerateInsurancePolicy=true
    const { 
        EndUserIp,
        TokenId,
        TraceId,
        ResultIndex,
        Passenger,
        PlanType, 
        PlanCoverage, 
        TravelStartDate,            
    } = req.body;

    // Validate required fields
    if (!EndUserIp || !TokenId || !TraceId || !ResultIndex || !Passenger) {
        return res.status(400).json({
            success: false,
            message: "Missing required fields: EndUserIp, TokenId, TraceId, ResultIndex, Passenger are mandatory"
        });
    }

    // Validate Passenger array structure
    if (!Array.isArray(Passenger) || Passenger.length === 0) {
        return res.status(400).json({
            success: false,
            message: "Passenger must be a non-empty array"
        });
    }

    // Validate each passenger has required fields
    for (let i = 0; i < Passenger.length; i++) {
        const passenger = Passenger[i];
        const requiredFields = [
            'Title', 'FirstName', 'LastName', 'BeneficiaryTitle', 'BeneficiaryName', 
            'RelationShipToInsured', 'RelationToBeneficiary', 'Gender', 'Sex', 'DOB', 
            'PassportCountry', 'PhoneNumber', 'EmailId', 'AddressLine1', 
            'AddressLine2', 'CityCode', 'CountryCode', 'MajorDestination', 'PinCode'
        ];
        
        const missingFields = requiredFields.filter(field => !passenger[field]);
        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Passenger ${i + 1} is missing required fields: ${missingFields.join(', ')}`
            });
        }
    }

    const data = {
        EndUserIp,
        TokenId,
        TraceId,
        GenerateInsurancePolicy: true,
        ResultIndex,
        Passenger
    }

    console.log("Insurance book data:", data);

    try {
        const apiResponse = await axios.post(
            `${base_url}/Book`,
            data,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log("Insurance book API response received");

        return res.status(200).json(apiResponse.data);
    } catch (error) {
        console.error('Error in GetInsuranceBook:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Error booking insurance',
            error: error.message
        });
    }
}   



exports.GetInsurancePolicy = async (req, res) => {
    // console.log("Yes, calling the insurance policy API");
    // console.log(req.body);
    
    const { 
        TokenId,
        EndUserIp,
        BookingId
    } = req.body;

    // Validate required fields
    if (!TokenId || !EndUserIp || !BookingId) {
        return res.status(400).json({
            success: false,
            message: "Missing required fields: TokenId, EndUserIp, and BookingId are mandatory"
        });
    }

    const data = {
        TokenId,
        EndUserIp,
        BookingId
    }

    console.log("Insurance policy data:", data);

    try {
        const apiResponse = await axios.post(
            `${base_url}/GeneratePolicy`,
            data,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log("Insurance policy API response received");

        return res.status(200).json(apiResponse.data);
    } catch (error) {
        console.error('Error in GetInsurancePolicy:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Error retrieving insurance policy',
            error: error.message
        });
    }
}

exports.GetInsuranceBookingDetails = async (req, res) => {
    console.log("Yes, calling the insurance booking details API");
    
    const { 
        TokenId,
        EndUserIp,
        BookingId
    } = req.body;

    // Validate required fields
    if (!TokenId || !EndUserIp || !BookingId) {
        return res.status(400).json({
            success: false,
            message: "Missing required fields: TokenId, EndUserIp, and BookingId are mandatory"
        });
    }

    const data = {
        TokenId,
        EndUserIp,
        BookingId
    }

    console.log("Insurance booking details data:", data);
    
    try {
        const apiResponse = await axios.post(
            `${base_url}/GetBookingDetail`,
            data,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log("Insurance booking details API response received");

        return res.status(200).json(apiResponse.data);
    } catch (error) {
        console.error('Error in GetInsuranceBookingDetails:', error.message);
        
        // Handle 404 errors specifically
        if (error.response && error.response.status === 404) {
            return res.status(404).json({
                success: false,
                message: 'Insurance booking details not found',
                error: 'The requested booking details could not be found'
            });
        }
        
        return res.status(500).json({
            success: false,
            message: 'Error retrieving insurance booking details',
            error: error.message
        });
    }
}







exports.CancelInsuranceBooking = async (req, res) => {
    console.log("Yes, calling the insurance cancel booking API");
    
    const { 
        TokenId,
        EndUserIp,
        BookingId,
        RequestType,
        Remarks
    } = req.body;

    // Validate required fields
    if (!TokenId || !EndUserIp || !BookingId || !RequestType) {
        return res.status(400).json({
            success: false,
            message: "Missing required fields: TokenId, EndUserIp, BookingId, and RequestType are mandatory"
        });
    }

    const data = {
        TokenId,
        EndUserIp,
        BookingId,
        RequestType,
        Remarks: Remarks || ""
    }

    console.log("Insurance cancel booking data:", data);
    
    try {
        const apiResponse = await axios.post(
            `${base_url}/SendChangeRequest`,
            data,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log("Insurance cancel booking API response received");

        return res.status(200).json(apiResponse.data);
    } catch (error) {
        console.error('Error in InsuraceCancelBooking:', error.message);
        
        // Handle specific error cases
        if (error.response && error.response.status === 404) {
            return res.status(404).json({
                success: false,
                message: 'Insurance booking not found',
                error: 'The requested booking could not be found for cancellation'
            });
        }
        
        if (error.response && error.response.status === 400) {
            return res.status(400).json({
                success: false,
                message: 'Invalid cancellation request',
                error: error.response.data || 'The cancellation request is invalid'
            });
        }
        
        return res.status(500).json({
            success: false,
            message: 'Error cancelling insurance booking',
            error: error.message
        });
    }
}       
