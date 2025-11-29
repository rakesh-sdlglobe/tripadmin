const { default: axios } = require('axios');
const os = require('os');
const connection = require('../utils/database');
const nodemailer = require('nodemailer');

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
    const data = {
        "UserName": process.env.INSURANCE_API_USERNAME,
        "Password": process.env.INSURANCE_API_PASSWORD,
        "ClientId": process.env.INSURANCE_API_CLIENT_ID,
        "EndUserIp": getLocalIP()
    }
    
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

        res.status(200).json({
            TokenId: apiResponse.data.TokenId,
            EndUserIp: getLocalIP(),
            message: "Insurance API authenticated successfully"
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.GetInsuranceList = async (req, res) => {
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
            return res.status(200).json(apiResponse.data);
        }
        
        // Handle API errors efficiently
        const error = response.Error;
        
        return res.status(400).json({
            message: error?.ErrorMessage || 'Insurance search failed',
            errorCode: error?.ErrorCode || 'Unknown',
            traceId: response.TraceId
        });

    } catch (error) {
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
    console.log("🛡️ GetInsuranceBook called at:", new Date().toISOString());
    console.log("🛡️ GetInsuranceBook called with data:", JSON.stringify(req.body, null, 2));
    
    
    const { 
        EndUserIp,
        TokenId,
        TraceId,
        GenerateInsurancePolicy,
        ResultIndex,
        Passenger,
        user_id // This should be provided in the request
    } = req.body;

    // Validate required fields
    if (!EndUserIp || !TokenId || !TraceId || !ResultIndex || !Passenger) {
        console.log("❌ Validation failed - Missing required fields:", {
            EndUserIp: !!EndUserIp,
            TokenId: !!TokenId,
            TraceId: !!TraceId,
            ResultIndex: !!ResultIndex,
            Passenger: !!Passenger
        });
        return res.status(400).json({
            success: false,
            message: "Missing required fields: EndUserIp, TokenId, TraceId, ResultIndex, Passenger are mandatory"
        });
    }

    // Validate Passenger array structure
    if (!Array.isArray(Passenger) || Passenger.length === 0) {
        console.log("❌ Validation failed - Invalid Passenger array:", {
            isArray: Array.isArray(Passenger),
            length: Passenger?.length,
            Passenger: Passenger
        });
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
            'PassportNo', 'PassportCountry', 'PhoneNumber', 'EmailId', 'AddressLine1', 
            'CityCode', 'CountryCode', 'State', 'MajorDestination', 'PinCode'
        ];
        
        const missingFields = requiredFields.filter(field => !passenger[field]);
        if (missingFields.length > 0) {
            console.log(`❌ Validation failed - Passenger ${i + 1} missing fields:`, {
                passenger: passenger,
                missingFields: missingFields
            });
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
        GenerateInsurancePolicy: GenerateInsurancePolicy || true,
        ResultIndex,
        Passenger
    }

    console.log("📤 Sending data to insurance API:", JSON.stringify(data, null, 2));

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

        console.log("📥 Insurance API response:", JSON.stringify(apiResponse.data, null, 2));


        // If API call is successful, store data in database
        if (apiResponse.data?.Response?.ResponseStatus === 1) {
            console.log("✅ Insurance API call successful, storing in database...");
            try {
                // Get user_id from request or find by email
                let finalUserId = user_id;
                console.log("🔍 User ID from request:", finalUserId);
                
                // If no user_id in body, try to get from email
                if (!finalUserId && Passenger.length > 0) {
                    const leadPassenger = Passenger[0];
                    if (leadPassenger?.EmailId) {
                        try {
                            const userQuery = 'SELECT user_id, firstName, lastName, email FROM users WHERE email = ?';
                            const [users] = await connection.promise().execute(userQuery, [leadPassenger.EmailId]);
                            if (users.length > 0) {
                                finalUserId = users[0].user_id;
                                console.log("✅ Found user by email:", finalUserId, users[0]);
                            } else {
                                console.log("❌ No user found with email:", leadPassenger.EmailId);
                            }
                        } catch (error) {
                            // Error looking up user by email
                        }
                    }
                }
                
                if (finalUserId) {
                    console.log("🔍 Validating user_id:", finalUserId);
                    // Validate user exists
                    const userValidationQuery = 'SELECT user_id, firstName, lastName, email FROM users WHERE user_id = ?';
                    const [userValidation] = await connection.promise().execute(userValidationQuery, [finalUserId]);
                    
                    if (userValidation.length === 0) {
                        console.log("❌ User validation failed - user not found:", finalUserId);
                        return res.status(400).json({
                            success: false,
                            message: 'Invalid user_id. User does not exist in the database.'
                        });
                    }
                    console.log("✅ User validated:", userValidation[0]);

                    // Extract data from API response for database storage
                    const itinerary = apiResponse.data?.Response?.Itinerary;
                    const leadPassenger = Passenger[0]; // Use the passenger data from request
                    
                    if (itinerary?.BookingId) {
                        console.log("📝 Preparing to insert insurance booking with BookingId:", itinerary.BookingId);
                        // Insert into insurance table with all your specified fields
                        const insuranceQuery = `
                            INSERT INTO insurance (
                                booking_id, user_id, plan_category, plan_type, plan_coverage,
                                travel_start_date, travel_end_date, destination, no_of_pax,
                                total_premium, base_premium, booking_status, booking_reference,
                                policy_number, insurance_company, insurance_name, plan_name, 
                                coverage_amount, payment_status, payment_method, transaction_id, 
                                easebuzz_order_id, easebuzz_payment_id, contact_email, contact_mobile, 
                                address, BeneficiaryName, RelationShipToInsured, RelationToBeneficiary,
                                DOB, PassportNo, PassportCountry, city, state, pincode
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        `;
                        

                        const bookingReference = `INS${Date.now()}`;
                        const numberOfPassengers = Passenger.length;
                        
                        // Calculate age from DOB
                        const dob = new Date(leadPassenger.DOB);
                        const age = Math.floor((new Date() - dob) / (365.25 * 24 * 60 * 60 * 1000));

                        const insuranceValues = [
                            itinerary.BookingId, // booking_id from API
                            finalUserId, // user_id
                            itinerary.PlanCategory || 2, // plan_category
                            itinerary.PlanType || 1, // plan_type
                            itinerary.PlanCoverage || 1, // plan_coverage
                            itinerary.PolicyStartDate ? (() => {
                                try {
                                    const dateStr = itinerary.PolicyStartDate;
                                    // Check if already in YYYY-MM-DD format
                                    if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
                                        return dateStr.split('T')[0].split(' ')[0];
                                    }
                                    // Check if in YYYY/MM/DD format (from API)
                                    const slashMatch = String(dateStr).match(/^(\d{4})\/(\d{2})\/(\d{2})/);
                                    if (slashMatch) {
                                        return `${slashMatch[1]}-${slashMatch[2]}-${slashMatch[3]}`;
                                    }
                                    // Parse as date and use UTC to avoid timezone shifts
                                    const date = new Date(dateStr);
                                    if (isNaN(date.getTime())) return null;
                                    const year = date.getUTCFullYear();
                                    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
                                    const day = String(date.getUTCDate()).padStart(2, '0');
                                    return `${year}-${month}-${day}`;
                                } catch {
                                    return null;
                                }
                            })() : null, // travel_start_date
                            itinerary.PolicyEndDate ? (() => {
                                try {
                                    const dateStr = itinerary.PolicyEndDate;
                                    // Check if already in YYYY-MM-DD format
                                    if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
                                        return dateStr.split('T')[0].split(' ')[0];
                                    }
                                    // Check if in YYYY/MM/DD format (from API)
                                    const slashMatch = String(dateStr).match(/^(\d{4})\/(\d{2})\/(\d{2})/);
                                    if (slashMatch) {
                                        return `${slashMatch[1]}-${slashMatch[2]}-${slashMatch[3]}`;
                                    }
                                    // Parse as date and use UTC to avoid timezone shifts
                                    const date = new Date(dateStr);
                                    if (isNaN(date.getTime())) return null;
                                    const year = date.getUTCFullYear();
                                    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
                                    const day = String(date.getUTCDate()).padStart(2, '0');
                                    return `${year}-${month}-${day}`;
                                } catch {
                                    return null;
                                }
                            })() : null, // travel_end_date
                            leadPassenger.MajorDestination || 'India', // destination
                            numberOfPassengers, // no_of_pax
                            itinerary.Price?.OfferedPriceRoundedOff || itinerary.Price?.PublishedPriceRoundedOff || 0, // total_premium
                            itinerary.Price?.PublishedPriceRoundedOff || 0, // base_premium
                            'Pending', // booking_status
                            bookingReference, // booking_reference
                            itinerary.PolicyNo || '', // policy_number
                            itinerary.SupplierName || 'Insurance Provider', // insurance_company
                            `${leadPassenger.Title} ${leadPassenger.FirstName} ${leadPassenger.LastName}`.trim(), // insurance_name (user's full name)
                            itinerary.PlanName || 'Travel Insurance Plan', // plan_name
                            itinerary.Price?.PublishedPriceRoundedOff || 0, // coverage_amount
                            'Pending', // payment_status
                            null, // payment_method
                            null, // transaction_id
                            null, // easebuzz_order_id
                            null, // easebuzz_payment_id
                            leadPassenger.EmailId || '', // contact_email
                            leadPassenger.PhoneNumber || '', // contact_mobile
                            leadPassenger.AddressLine1 || '', // address
                            leadPassenger.BeneficiaryName || '', // BeneficiaryName
                            leadPassenger.RelationShipToInsured || '', // RelationShipToInsured
                            leadPassenger.RelationToBeneficiary || '', // RelationToBeneficiary
                            new Date(leadPassenger.DOB).toISOString().slice(0, 10), // DOB
                            leadPassenger.PassportNo || '', // PassportNo
                            leadPassenger.PassportCountry || 'IND', // PassportCountry
                            leadPassenger.CityCode || '', // city
                            leadPassenger.State || leadPassenger.CountryCode || 'IND', // state
                            leadPassenger.PinCode || '' // pincode
                        ];
                        
                        console.log("💾 Executing database insert with values:", insuranceValues);
                        await connection.promise().execute(insuranceQuery, insuranceValues);
                        console.log("✅ Insurance booking successfully stored in database!");

                        // If GenerateInsurancePolicy is true, update the booking status
                        if (GenerateInsurancePolicy === 'true' || GenerateInsurancePolicy === true) {
                            const policyNumber = itinerary.PolicyNo || `POL${Date.now()}`;
                            
                            // Update insurance booking with policy number
                            await connection.promise().execute(`
                                UPDATE insurance 
                                SET booking_status = 'Confirmed',
                                    payment_status = 'Paid',
                                    policy_number = ?,
                                    updated_at = NOW()
                                WHERE booking_id = ?
                            `, [policyNumber, itinerary.BookingId]);

                            // No passenger updates needed

                        }

                        // Get updated booking details to return
                        const [updatedBooking] = await connection.promise().execute(`
                            SELECT 
                                i.*,
                                u.firstName,
                                u.lastName,
                                u.email as user_email
                            FROM insurance i
                            JOIN users u ON i.user_id = u.user_id
                            WHERE i.booking_id = ?
                        `, [itinerary.BookingId]);

                        // Add insurance_name to the response (user's full name)
                        const responseData = { ...apiResponse.data };
                        if (responseData.Response && responseData.Response.Itinerary) {
                            const leadPassenger = Passenger[0];
                            responseData.Response.Itinerary.insurance_name = `${leadPassenger.Title} ${leadPassenger.FirstName} ${leadPassenger.LastName}`.trim();
                        }
                        
                        // Return only the API response structure (clean response) with insurance_name
                        return res.status(200).json(responseData);
                    }
                } else {
                    console.log("⚠️ No user_id found - skipping database storage");
                }
            } catch (dbError) {
                console.error("❌ Database storage error:", dbError.message);
                // Don't fail the API response if database storage fails
            }
        }

        // Add insurance_name to the response even when user is not found or database storage fails (user's full name)
        const responseData = { ...apiResponse.data };
        if (responseData.Response && responseData.Response.Itinerary && Passenger && Passenger.length > 0) {
            const leadPassenger = Passenger[0];
            responseData.Response.Itinerary.insurance_name = `${leadPassenger.Title} ${leadPassenger.FirstName} ${leadPassenger.LastName}`.trim();
        }
        
        console.log("📤 Returning response to client");
        return res.status(200).json(responseData);
    } catch (error) {
        console.error("❌ GetInsuranceBook error:", error.message);
        return res.status(500).json({
            success: false,
            message: 'Error booking insurance',
            error: error.message
        });
    }
}   



exports.GetInsurancePolicy = async (req, res) => {
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


        // If policy generation is successful and user is logged in, update database
        if (apiResponse.data?.Response?.ResponseStatus === 1) {
            try {
                // Check if user is logged in (has user_id in request)
                // Use same approach as bus controller - get user_id from request body
                let userId = req.body?.user_id;
                
                
                if (userId) {
                    const itinerary = apiResponse.data?.Response?.Itinerary;
                    const leadPassenger = itinerary?.PassengerInfo?.[0];
                    
                    if (leadPassenger?.PolicyNo) {
                        // Update insurance booking with policy number and confirmed status
                        const updateQuery = `
                            UPDATE insurance 
                            SET booking_status = 'Confirmed',
                                payment_status = 'Paid',
                                policy_number = ?,
                                updated_at = NOW()
                            WHERE booking_id = ?
                        `;
                        
                        await connection.promise().execute(updateQuery, [
                            leadPassenger.PolicyNo,
                            BookingId
                        ]);

                        // No passenger updates needed

                    }
                } else {
                    // User not logged in - skipping database update
                }
            } catch (dbError) {
                // Don't fail the API response if database update fails
            }
        }

        // Add insurance_name to the policy response (user's full name from passenger info)
        const responseData = { ...apiResponse.data };
        if (responseData.Response && responseData.Response.Itinerary && responseData.Response.Itinerary.PaxInfo && responseData.Response.Itinerary.PaxInfo.length > 0) {
            const leadPassenger = responseData.Response.Itinerary.PaxInfo[0];
            responseData.Response.Itinerary.insurance_name = `${leadPassenger.Title} ${leadPassenger.FirstName} ${leadPassenger.LastName}`.trim();
        }
        
        return res.status(200).json(responseData);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error retrieving insurance policy',
            error: error.message
        });
    }
}

exports.GetInsuranceBookingDetails = async (req, res) => {
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


        // Add insurance_name to the booking details response (user's full name from passenger info)
        const responseData = { ...apiResponse.data };
        if (responseData.Response && responseData.Response.Itinerary && responseData.Response.Itinerary.PaxInfo && responseData.Response.Itinerary.PaxInfo.length > 0) {
            const leadPassenger = responseData.Response.Itinerary.PaxInfo[0];
            responseData.Response.Itinerary.insurance_name = `${leadPassenger.Title} ${leadPassenger.FirstName} ${leadPassenger.LastName}`.trim();
        }
        
        return res.status(200).json(responseData);
    } catch (error) {
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
    console.log("🔄 Cancelling insurance booking:", req.body);
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


        return res.status(200).json(apiResponse.data);
    } catch (error) {
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

// Create insurance booking in database (simplified version without bus logic)
exports.createInsuranceBooking = async (req, res) => {
    try {
        const {
            user_id,
            insuranceData,
            passengerData,
            contactDetails,
            addressDetails,
            fareDetails
        } = req.body;

        // Parse JSON strings to objects if they are strings
        const parsedInsuranceData = typeof insuranceData === 'string' ? JSON.parse(insuranceData) : insuranceData;
        const parsedPassengerData = typeof passengerData === 'string' ? JSON.parse(passengerData) : passengerData;
        const parsedContactDetails = typeof contactDetails === 'string' ? JSON.parse(contactDetails) : contactDetails;
        const parsedAddressDetails = typeof addressDetails === 'string' ? JSON.parse(addressDetails) : addressDetails;
        const parsedFareDetails = typeof fareDetails === 'string' ? JSON.parse(fareDetails) : fareDetails;


        // Helper function to safely get values
        const safeValue = (value, defaultValue = null) => {
            return value !== undefined && value !== null ? value : defaultValue;
        };

        // Get user_id from users table
        let finalUserId = null;

        // Method 1: If user_id is provided in request, validate it exists
        if (user_id) {
            const userCheckQuery = 'SELECT user_id, firstName, lastName, email FROM users WHERE user_id = ?';
            const [userCheck] = await connection.promise().execute(userCheckQuery, [user_id]);
            if (userCheck.length > 0) {
                finalUserId = user_id;
            }
        }

        // Method 2: If no user_id or invalid, try to get from email
        if (!finalUserId && parsedContactDetails?.email) {
            const userQuery = 'SELECT user_id, firstName, lastName, email FROM users WHERE email = ?';
            const [users] = await connection.promise().execute(userQuery, [parsedContactDetails.email]);
            if (users.length > 0) {
                finalUserId = users[0].user_id;
            }
        }

        // Method 3: If still no user_id, get the first available user
        if (!finalUserId) {
            const defaultUserQuery = 'SELECT user_id, firstName, lastName, email FROM users ORDER BY user_id ASC LIMIT 1';
            const [defaultUsers] = await connection.promise().execute(defaultUserQuery);
            if (defaultUsers.length > 0) {
                finalUserId = defaultUsers[0].user_id;
            } else {
                return res.status(400).json({ 
                    message: 'No users found in database. Please create a user first.',
                    suggestion: 'Create a user account before making insurance bookings.'
                });
            }
        }

        // Validate the final user_id exists
        const userValidationQuery = 'SELECT user_id, firstName, lastName, email FROM users WHERE user_id = ?';
        const [userValidation] = await connection.promise().execute(userValidationQuery, [finalUserId]);
        
        if (userValidation.length === 0) {
            return res.status(400).json({ 
                message: 'Invalid user_id. User does not exist in the database.',
                user_id: finalUserId,
                suggestion: 'Please ensure you are logged in with a valid account.'
            });
        }


        // Extract insurance details
        const leadPassenger = parsedPassengerData && parsedPassengerData.length > 0 ? parsedPassengerData[0] : null;
        const numberOfPassengers = parsedPassengerData ? parsedPassengerData.length : 1;


        // Extract destination
        let destination = parsedContactDetails?.destination || parsedInsuranceData?.destination || 'India';

        // Insert into insurance table
        const insuranceQuery = `
            INSERT INTO insurance (
                booking_id, user_id, plan_category, plan_type, plan_coverage,
                travel_start_date, travel_end_date, destination, no_of_pax,
                total_premium, base_premium, booking_status, booking_reference,
                policy_number, insurance_company, insurance_name, plan_name, 
                coverage_amount, payment_status, payment_method, transaction_id, 
                easebuzz_order_id, easebuzz_payment_id, contact_email, contact_mobile, 
                address, BeneficiaryName, RelationShipToInsured, RelationToBeneficiary,
                DOB, PassportNo, PassportCountry, city, state, pincode
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const bookingReference = `INS${Date.now()}`;
        
        // Helper function to format date properly (avoid timezone issues)
        const formatDateForDB = (dateValue) => {
            if (!dateValue) return null;
            
            // If it's already a string in YYYY-MM-DD format, return as is
            if (typeof dateValue === 'string') {
                // Check if it's already in YYYY-MM-DD format
                const dateOnlyMatch = dateValue.match(/^(\d{4})-(\d{2})-(\d{2})/);
                if (dateOnlyMatch) {
                    return dateOnlyMatch[0]; // Return YYYY-MM-DD
                }
                
                // Check if it's in YYYY/MM/DD format (from API)
                const slashDateMatch = dateValue.match(/^(\d{4})\/(\d{2})\/(\d{2})/);
                if (slashDateMatch) {
                    return `${slashDateMatch[1]}-${slashDateMatch[2]}-${slashDateMatch[3]}`;
                }
            }
            
            // If it's a Date object or ISO string, parse it carefully
            try {
                const date = new Date(dateValue);
                if (isNaN(date.getTime())) return null;
                
                // Use UTC methods to prevent timezone conversion issues
                // This ensures the date stays as entered regardless of server timezone
                const year = date.getUTCFullYear();
                const month = String(date.getUTCMonth() + 1).padStart(2, '0');
                const day = String(date.getUTCDate()).padStart(2, '0');
                
                return `${year}-${month}-${day}`;
            } catch (error) {
                console.error('Error formatting date:', error);
                return null;
            }
        };
        
        const insuranceValues = [
            null, // booking_id (will be generated by API)
            finalUserId, // user_id
            safeValue(parsedInsuranceData?.plan_category, 1), // plan_category
            safeValue(parsedInsuranceData?.plan_type, 1), // plan_type
            safeValue(parsedInsuranceData?.plan_coverage, 1), // plan_coverage
            formatDateForDB(parsedInsuranceData?.travel_start_date), // travel_start_date
            formatDateForDB(parsedInsuranceData?.travel_end_date), // travel_end_date
            destination, // destination
            numberOfPassengers, // no_of_pax
            safeValue(parsedFareDetails?.total_premium, 0), // total_premium
            safeValue(parsedFareDetails?.base_premium, 0), // base_premium
            'Pending', // booking_status
            bookingReference, // booking_reference
            null, // policy_number (null until policy generated)
            safeValue(parsedInsuranceData?.insurance_company, ''), // insurance_company
            leadPassenger ? `${leadPassenger.BeneficiaryTitle || ''} ${leadPassenger.BeneficiaryFirstName || ''} ${leadPassenger.BeneficiaryLastName || ''}`.trim() : 'User', // insurance_name (user's full name)
            safeValue(parsedInsuranceData?.plan_name, ''), // plan_name
            safeValue(parsedInsuranceData?.coverage_amount, 0), // coverage_amount
            'Pending', // payment_status
            null, // payment_method
            null, // transaction_id
            null, // easebuzz_order_id
            null, // easebuzz_payment_id
            safeValue(parsedContactDetails?.email, ''), // contact_email
            safeValue(parsedContactDetails?.mobile, ''), // contact_mobile
            safeValue(parsedAddressDetails?.address), // address
            safeValue(leadPassenger?.BeneficiaryName, ''), // BeneficiaryName
            safeValue(leadPassenger?.RelationShipToInsured, ''), // RelationShipToInsured
            safeValue(leadPassenger?.RelationToBeneficiary, ''), // RelationToBeneficiary
            safeValue(leadPassenger?.DOB), // DOB
            safeValue(leadPassenger?.PassportNo, ''), // PassportNo
            safeValue(leadPassenger?.PassportCountry, 'IND'), // PassportCountry
            safeValue(parsedAddressDetails?.city), // city
            safeValue(parsedAddressDetails?.state), // state
            safeValue(parsedAddressDetails?.pincode) // pincode
        ];

        const [insuranceResult] = await connection.promise().execute(insuranceQuery, insuranceValues);
        const booking_id = insuranceResult.insertId;

        res.status(200).json({
            success: true,
            booking_id,
            booking_reference: bookingReference,
            message: 'Insurance booking created successfully',
            user_id: finalUserId,
            user: userValidation[0],
            passenger_count: numberOfPassengers,
            booking_status: 'Pending',
            payment_status: 'Pending',
            destination: destination
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all insurance bookings for a user
exports.getUserInsuranceBookings = async (req, res) => {
    try {
        const { user_id } = req.params;
        
        const query = `
            SELECT i.*
            FROM insurance i
            WHERE i.user_id = ?
            ORDER BY i.created_at DESC
        `;
        
        const [bookings] = await connection.promise().execute(query, [user_id]);
        
        res.status(200).json({
            success: true,
            bookings: bookings
        });
        
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get specific insurance booking with passengers
exports.getInsuranceBookingDetails = async (req, res) => {
    try {
        const { booking_id } = req.params;
        
        // Get booking details
        const bookingQuery = `
            SELECT * FROM insurance WHERE booking_id = ?
        `;
        
        const [bookings] = await connection.promise().execute(bookingQuery, [booking_id]);
        
        if (bookings.length === 0) {
            return res.status(404).json({ message: 'Insurance booking not found' });
        }
        
        res.status(200).json({
            success: true,
            booking: bookings[0]
        });
        
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update insurance booking status
exports.updateInsuranceBookingStatus = async (req, res) => {
    try {
        const { booking_id } = req.params;
        const { booking_status, payment_status, policy_number, transaction_id, payment_method, easebuzz_payment_id, total_premium, base_premium } = req.body;
        
        console.log("🔄 Updating insurance booking status:", {
            booking_id,
            booking_status,
            payment_status,
            policy_number,
            transaction_id,
            payment_method,
            easebuzz_payment_id,
            total_premium,
            base_premium
        });
        
        const updateQuery = `
            UPDATE insurance 
            SET booking_status = ?, 
                payment_status = ?, 
                policy_number = ?, 
                transaction_id = ?,
                payment_method = ?,
                easebuzz_payment_id = ?,
                total_premium = ?,
                base_premium = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE booking_id = ?
        `;
        
        await connection.promise().execute(updateQuery, [
            booking_status, 
            payment_status, 
            policy_number, 
            transaction_id,
            payment_method || null,
            easebuzz_payment_id || null,
            total_premium || null,
            base_premium || null,
            booking_id
        ]);
        
        console.log("✅ Insurance booking status updated successfully");
        
        res.status(200).json({
            success: true,
            message: 'Insurance booking status updated successfully'
        });
        
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Cancel insurance booking
exports.cancelInsuranceBooking = async (req, res) => {
    try {
        const { booking_id } = req.params;
        const { cancel_charges, refund_amount, cancellation_reason } = req.body;
        
        console.log("🔄 Cancelling insurance booking:", {
            booking_id,
            cancel_charges,
            refund_amount,
            cancellation_reason
        });
        
        // First, get the current booking details to calculate refund if not provided
        const getBookingQuery = `
            SELECT total_premium, base_premium, booking_status, payment_status 
            FROM insurance 
            WHERE booking_id = ?
        `;
        
        const [bookingDetails] = await connection.promise().execute(getBookingQuery, [booking_id]);
        
        if (bookingDetails.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Insurance booking not found'
            });
        }
        
        const booking = bookingDetails[0];
        let finalCancelCharges = cancel_charges || '0.00';
        let finalRefundAmount = refund_amount;
        
        // If refund_amount is not provided, calculate it
        if (!finalRefundAmount && booking.payment_status === 'Paid') {
            const totalPremium = parseFloat(booking.total_premium) || 0;
            const cancelCharges = parseFloat(finalCancelCharges) || 0;
            finalRefundAmount = (totalPremium - cancelCharges).toFixed(2);
        }
        
        const updateQuery = `
            UPDATE insurance 
            SET booking_status = 'Cancelled',
                cancel_charges = ?,
                refund_amount = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE booking_id = ?
        `;
        
        const [result] = await connection.promise().execute(updateQuery, [
            finalCancelCharges,
            finalRefundAmount,
            booking_id
        ]);
        
        console.log("✅ Insurance booking cancelled successfully:", {
            booking_id,
            cancel_charges: finalCancelCharges,
            refund_amount: finalRefundAmount,
            affectedRows: result.affectedRows
        });
        
        // Log the updated booking details for verification
        const verifyQuery = `
            SELECT booking_id, booking_status, cancel_charges, refund_amount, updated_at 
            FROM insurance 
            WHERE booking_id = ?
        `;
        const [updatedBooking] = await connection.promise().execute(verifyQuery, [booking_id]);
        console.log("🔍 Verification - Updated booking details:", updatedBooking[0]);
        
        res.status(200).json({
            success: true,
            message: 'Insurance booking cancelled successfully',
            booking_id: booking_id,
            cancel_charges: finalCancelCharges,
            refund_amount: finalRefundAmount,
            affectedRows: result.affectedRows
        });
        
    } catch (error) {
        console.error("❌ Error cancelling insurance booking:", error.message);
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};

// Get insurance booking statistics
exports.getInsuranceBookingStats = async (req, res) => {
    try {
        const { user_id } = req.params;
        
        const statsQuery = `
            SELECT 
                COUNT(*) as total_bookings,
                SUM(CASE WHEN booking_status = 'Confirmed' THEN 1 ELSE 0 END) as confirmed_bookings,
                SUM(CASE WHEN booking_status = 'Pending' THEN 1 ELSE 0 END) as pending_bookings,
                SUM(CASE WHEN booking_status = 'Cancelled' THEN 1 ELSE 0 END) as cancelled_bookings,
                SUM(total_premium) as total_spent
            FROM insurance 
            WHERE user_id = ?
        `;
        
        const [stats] = await connection.promise().execute(statsQuery, [user_id]);
        
        res.status(200).json({
            success: true,
            stats: stats[0]
        });
        
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Send selected insurance quotes via email
exports.sendSelectedQuotes = async (req, res) => {
    try {
        const { user_id, selectedPlans, searchCriteria, emailData } = req.body;

        // Validate required fields
        if (!user_id || !selectedPlans || !Array.isArray(selectedPlans) || selectedPlans.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'User ID and selected plans are required'
            });
        }

        // Validate email data
        if (!emailData || !emailData.toEmail) {
            return res.status(400).json({
                success: false,
                message: 'Email address is required'
            });
        }

        // Get user details
        const userQuery = 'SELECT firstName, lastName, email FROM users WHERE user_id = ?';
        const [users] = await connection.promise().execute(userQuery, [user_id]);
        
        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = users[0];

        // Configure Nodemailer transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // Verify transporter configuration
        try {
            await transporter.verify();
            console.log('Email transporter verified successfully');
        } catch (verifyError) {
            console.error('Email transporter verification failed:', verifyError);
            return res.status(500).json({
                success: false,
                message: 'Email service configuration error',
                error: verifyError.message
            });
        }

        // Create HTML email content
        const createEmailHTML = (plans, searchCriteria, userName) => {
            const planTypeText = searchCriteria.planType === 1 ? 'Single Trip' : 'Annual Multi Trip';
            const coverageText = searchCriteria.planCoverage === 1 ? 'US' :
                               searchCriteria.planCoverage === 2 ? 'Non-US' :
                               searchCriteria.planCoverage === 3 ? 'WorldWide' :
                               searchCriteria.planCoverage === 4 ? 'India' :
                               searchCriteria.planCoverage === 5 ? 'Asia' :
                               searchCriteria.planCoverage === 6 ? 'Canada' :
                               searchCriteria.planCoverage === 7 ? 'Australia' :
                               searchCriteria.planCoverage === 8 ? 'Schenegen Countries' : 'Unknown';

            let plansHTML = '';
            plans.forEach((plan, index) => {
                const price = plan.Price?.OfferedPriceRoundedOff || plan.Price?.OfferedPrice || 'N/A';
                plansHTML += `
                    <div class="plan-card">
                        <h3 class="plan-title">${plan.PlanName}</h3>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                            <div>
                                <p style="margin: 8px 0; color: #666; font-size: 16px;"><strong><i class="fas fa-file-alt"></i> ${planTypeText}</strong> • <i class="fas fa-globe"></i> ${coverageText} Coverage</p>
                                <p style="margin: 8px 0; color: #666; font-size: 14px;"><i class="fas fa-calendar-alt"></i> Duration: ${searchCriteria.duration || 1} Day(s)</p>
                                <p style="margin: 8px 0; color: #666; font-size: 14px;"><i class="fas fa-users"></i> Passengers: ${searchCriteria.passengerCount || 1}</p>
                            </div>
                            <div style="text-align: right;">
                                <div class="price-highlight"><i class="fas fa-rupee-sign"></i>${price}</div>
                                <div style="color: #28a745; font-size: 14px; font-weight: 600;"><i class="fas fa-star"></i> Best Price</div>
                            </div>
                        </div>
                        <div style="border-top: 2px solid #e9ecef; padding-top: 15px; text-align: center; background-color: #f8f9fa; border-radius: 6px; padding: 15px;">
                            <p style="color: #dc3545; margin: 0; font-size: 14px; font-weight: 500;">
                                <i class="fas fa-info-circle"></i> For detailed coverage information, price breakdown, and policy documents, 
                                please visit our website and search for this plan again.
                            </p>
                        </div>
                    </div>
                `;
            });

            return `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <title>Selected Insurance Quotes - SeeMyTrip</title>
                    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                        .container { max-width: 800px; margin: 0 auto; padding: 0; }
                        table { border-collapse: collapse; }
                        .logo-container { display: table; margin: 0 auto; }
                        .suitcase, .logo-text { display: table-cell; vertical-align: middle; }
                        .header { 
                            background-color: white; 
                            color: white; 
                            padding: 30px 20px; 
                            text-align: center;
                            border-radius: 8px 8px 0 0;
                        }
                        .logo-section {
                            margin-bottom: 20px;
                        }
                        .logo-container {
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            gap: 6px;
                            margin-bottom: 10px;
                        }
                        .suitcase {
                            background-color: white;
                            color: white;
                            padding: 15px 20px;
                            border-radius: 8px;
                            font-weight: bold;
                            font-size: 40px;
                            position: relative;
                            display: inline-block;
                            line-height: 1;
                            text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
                            border: 2px solid #ffffff;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                        }
                        .suitcase::before {
                            content: '';
                            position: absolute;
                            top: -5px;
                            left: 50%;
                            transform: translateX(-50%);
                            width: 20px;
                            height: 5px;
                            background-color: #dc3545;
                            border-radius: 3px;
                        }
                        .logo-text {
                            font-size: 48px;
                            font-weight: bold;
                            margin: 0;
                            color: black;
                            line-height: 1;
                            text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
                        }
                        .airplane-dot {
                            position: relative;
                            display: inline-block;
                            margin: 0 1px;
                            vertical-align: middle;
                        }
                        .airplane-dot::before {
                            content: '✈';
                            color: white;
                            font-size: 32px;
                            line-height: 1;
                            display: inline-block;
                        }
                        .airplane-dot::after {
                            content: '';
                            position: absolute;
                            top: -6px;
                            right: 0px;
                            width: 10px;
                            height: 10px;
                            background-color: #28a745;
                            border-radius: 50%;
                        }
                        .tagline {
                            font-size: 16px;
                            margin: 8px 0 0 0;
                            opacity: 0.9;
                        }
                        .content { background-color: white; padding: 30px; border: 1px solid #dee2e6; }
                        .footer { 
                            background-color:white; 
                            padding: 25px 20px; 
                            border-radius: 0 0 8px 8px; 
                            text-align: center; 
                            color: black; 
                            border-top: 3px solid #c82333;
                        }
                        .search-summary { 
                            background: white; 
                            padding: 20px; 
                            border-radius: 8px; 
                            margin-bottom: 25px; 
                            border-left: 4px solid #dc3545;
                        }
                        .plan-card {
                            border: 2px solid #dc3545; 
                            border-radius: 12px; 
                            padding: 25px; 
                            margin-bottom: 20px; 
                            background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
                            box-shadow: 0 4px 6px rgba(220,53,69,0.1);
                        }
                        .plan-title {
                            color: #dc3545; 
                            margin-top: 0; 
                            font-size: 22px;
                            font-weight: bold;
                        }
                        .price-highlight {
                            font-size: 28px; 
                            font-weight: bold; 
                            color: #28a745;
                            text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
                        }
                        .next-steps {
                            background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
                            border: 1px solid #c3e6cb; 
                            border-radius: 8px; 
                            padding: 20px; 
                            margin-top: 25px;
                        }
                        .company-info {
                            margin-top: 15px;
                            padding-top: 15px;
                            border-top: 1px solid #dee2e6;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="logo-section">
                               
                                <div style="margin: 15px 0; text-align: center;">
                                    <img src="cid:train-image" alt="SeeMyTrip Train" style="max-width: 250px; height: 120px; opacity: 0.9;">
                                </div>
                                <p class="tagline"><i class="fas fa-handshake"></i> Your Trusted Travel Partner</p>
                            </div>
                            <h2 style="margin: 20px 0 10px 0; font-size: 24px; font-weight: 600; text-align: center;"><i class="fas fa-shield-alt"></i> Your Selected Insurance Quotes</h2>
                            <p style="margin: 0; font-size: 16px; opacity: 0.9; text-align: center;"><i class="fas fa-umbrella"></i> Travel Insurance Solutions</p>
                        </div>
                        
                        <div class="content">
                            <p>Dear ${userName},</p>
                            
                            <p>Thank you for using SeeMyTrip! Here are your selected insurance quotes as requested:</p>
                            
                            <div class="search-summary">
                                <h3 style="margin-top: 0; color: #dc3545; font-size: 20px; font-weight: bold;"><i class="fas fa-search"></i> Search Summary</h3>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 15px;">
                                    <p style="margin: 8px 0; color: #333;"><strong><i class="fas fa-file-alt"></i> Plan Type:</strong> ${planTypeText}</p>
                                    <p style="margin: 8px 0; color: #333;"><strong><i class="fas fa-globe"></i> Coverage:</strong> ${coverageText}</p>
                                    <p style="margin: 8px 0; color: #333;"><strong><i class="fas fa-calendar-alt"></i> Travel Dates:</strong> ${searchCriteria.departDate ? new Date(searchCriteria.departDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'} - ${searchCriteria.returnDate ? new Date(searchCriteria.returnDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}</p>
                                    <p style="margin: 8px 0; color: #333;"><strong><i class="fas fa-clock"></i> Duration:</strong> ${searchCriteria.duration || 1} Day(s)</p>
                                    <p style="margin: 8px 0; color: #333;"><strong><i class="fas fa-users"></i> Passengers:</strong> ${searchCriteria.passengerCount || 1}</p>
                                    <p style="margin: 8px 0; color: #333;"><strong><i class="fas fa-birthday-cake"></i> Ages:</strong> ${searchCriteria.passengerAges?.join(', ') || '25'} Years Old</p>
                                </div>
                            </div>
                            
                            <h3 style="color: #dc3545; font-size: 22px; margin-bottom: 20px;"><i class="fas fa-shield-alt"></i> Selected Insurance Plans (${plans.length})</h3>
                            ${plansHTML}
                            
                            <div class="next-steps">
                                <h4 style="color: #155724; margin-top: 0; font-size: 18px; font-weight: bold;">📋 Next Steps</h4>
                                <ul style="color: #155724; margin-bottom: 0; padding-left: 20px;">
                                    <li style="margin-bottom: 8px;">Review the selected insurance plans above</li>
                                    <li style="margin-bottom: 8px;">Visit our website to see detailed coverage information</li>
                                    <li style="margin-bottom: 8px;">Compare prices and benefits to choose the best plan</li>
                                    <li style="margin-bottom: 8px;">Contact us if you need any assistance</li>
                                </ul>
                            </div>
                        </div>
                        
                        <div class="footer">
                            <div style="margin-bottom: 15px;">
                                
                                <div style="margin: 10px 0; text-align: center;">
                                    <img src="cid:train-image" alt="SeeMyTrip Train" style="max-width: 200px; height: 120px; opacity: 0.9;">
                                </div>
                                <p style="margin: 0; font-size: 16px; font-weight: 600; color: white; text-align: center;">Your Trusted Travel Partner</p>
                            </div>
                            <div class="company-info">
                                <p style="margin: 8px 0; color: white; font-size: 14px;">📧 For any queries, contact us at <strong>support@seemytrip.com</strong></p>
                                <p style="margin: 8px 0; color: white; font-size: 14px;">🌐 Visit us at <strong>www.seemytrip.com</strong></p>
                                <p style="margin: 8px 0; color: rgba(255,255,255,0.8); font-size: 12px;">This email was sent because you requested insurance quotes on our platform.</p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `;
        };

        // Create email content
        const emailHTML = createEmailHTML(selectedPlans, searchCriteria, `${user.firstName} ${user.lastName}`);

        // Use the email address from UI, fallback to user's email
        const recipientEmail = emailData.toEmail || user.email;
        const emailSubject = emailData.subject || `Your Selected Insurance Quotes - SeeMyTrip (${selectedPlans.length} Plans)`;
        const additionalMessage = emailData.message ? `\n\nAdditional Message:\n${emailData.message}\n` : '';

        // Email options
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: recipientEmail,
            subject: emailSubject,
            html: emailHTML,
            text: `Dear ${user.firstName},\n\nThank you for using SeeMyTrip! Here are your selected insurance quotes:\n\n${selectedPlans.map(plan => `${plan.PlanName} - ₹${plan.Price?.OfferedPriceRoundedOff || plan.Price?.OfferedPrice || 'N/A'}`).join('\n')}${additionalMessage}\n\nPlease visit our website to view detailed information and proceed with booking.\n\nBest regards,\nSeeMyTrip Team`,
            attachments: [
                {
                    filename: 'train-4.png',
                    path: './uploads/train-4 (1).png',
                    cid: 'train-image'
                }
            ]
        };

        // Send email with error handling
        try {
            await transporter.sendMail(mailOptions);
            
            res.status(200).json({
                success: true,
                message: `Selected insurance quotes sent successfully to ${recipientEmail}`,
                plansCount: selectedPlans.length,
                recipientEmail: recipientEmail
            });
        } catch (emailError) {
            console.error('Detailed email error:', emailError);
            
            res.status(500).json({
                success: false,
                message: 'Failed to send email. Please try again later.',
                error: emailError.message,
                plansCount: selectedPlans.length,
                recipientEmail: recipientEmail
            });
        }

    } catch (error) {
        console.error('Error sending insurance quotes email:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending email',
            error: error.message
        });
    }
};


