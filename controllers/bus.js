const connection = require('../utils/database');
const moment = require('moment');
const { default: axios } = require('axios');
const { response } = require('express');
const os = require('os');
const { log } = require('console');

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

exports.authenticateBusAPI = async (req, res) => {
    // console.log("Yes, calling the bus ");
    

    const data = {
        "UserName": process.env.BUS_API_USERNAME,
        "Password": process.env.BUS_API_PASSWORD,
        "ClientId": process.env.BUS_API_CLIENT_ID,
        "EndUserIp": getLocalIP()
    }
    // console.log("DAta is working... ",data);
    
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
        // console.log("API Response is working... ",apiResponse.data);

        res.status(200).json({TokenId:apiResponse.data.TokenId,
            TokenAgencyId:apiResponse.data.Member.AgencyId,TokenMemberId:apiResponse.data.Member.MemberId,
            EndUserIp:getLocalIP(),message:"Bus API authenticated successfully"});
    } catch (error) {
        // console.error('Error fetching bus cities:', error);
        res.status(500).json({ message: error.message });
    }
}

exports.GetBusCityList = async (req, res) => {
    const { TokenId, IpAddress } = req.body;
    // console.log("TokenId is working... ", TokenId, IpAddress);

    if (!TokenId || !IpAddress) {
        return res.status(400).json({ message: "TokenId and IpAddress are required in the request body." });
    }

    const data = {
        "TokenId": TokenId,
        "IpAddress": IpAddress,
        "ClientId": process.env.BUS_API_CLIENT_ID
    };
    // console.log("Data is working... ", data);

    try {
        const apiResponse = await axios.post(
            'https://Sharedapi.tektravels.com/StaticData.svc/rest/GetBusCityList',
            data,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        // console.log("API Response is working... ", apiResponse.data);
        res.status(200).json(apiResponse.data);
    } catch (error) {
        // console.error('Error fetching bus cities:', error);
        res.status(500).json({ message: error.message });
    }
}

exports.BusSearch=async(req,res)=>{
    const {DateOfJourney,DestinationId,EndUserIp,OriginId,TokenId} = req.body
        const PreferredCurrency= "INR"
    const data = {
        "DateOfJourney":DateOfJourney,
        "DestinationId":DestinationId,
        "EndUserIp":EndUserIp,
        "OriginId":OriginId,
        // "BookingMode":BookingMode,
        "TokenId":TokenId,
        "PreferredCurrency":PreferredCurrency,
    }
    try {
        const apiResponse = await axios.post('https://busbe.tektravels.com/Busservice.svc/rest/Search',data,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        )
        // console.log("API Response is working... ",apiResponse.data);
        res.status(200).json(apiResponse.data);
    } catch (error) {
        // console.error('Error fetching bus search:', error);
        res.status(500).json({ message: error.message });
    }
}

exports.GetBusSeatLayOut=async(req,res)=>{
    // console.log(req.body);
    
    const {IpAddress,ResultIndex,TraceId,TokenId}=req.body
    const data={
        "EndUserIp":IpAddress,
        "ResultIndex":ResultIndex,
        "TraceId":TraceId,
        "TokenId":TokenId
    }
    // console.log("Data is working... ",data.EndUserIp);
    
    // console.log("Data is working... ",data);
    
        try {
            const apiResponse = await axios.post('https://busbe.tektravels.com/Busservice.svc/rest/GetBusSeatLayOut',data,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            )
            // console.log("API Response is working... ",apiResponse.data);
            res.status(200).json(apiResponse.data);
        } catch (error) {
            // console.error('Error fetching bus seat lay out:', error);
            res.status(500).json({ message: error.message });
        }
}

exports.GetBoardingPintDetails=async(req,res)=>{
    // console.log("Boarding point details is working... ",req.body);
    
    const {IpAddress,ResultIndex,TraceId,TokenId}=req.body
    const data={
        "EndUserIp":IpAddress,
        "ResultIndex":ResultIndex,
        "TraceId":TraceId,
        "TokenId":TokenId
    }
    try {
        const apiResponse = await axios.post('https://BusBE.tektravels.com/Busservice.svc/rest/GetBoardingPointDetails',data,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        )
        // console.log("API Response is working... ",apiResponse.data);
        res.status(200).json(apiResponse.data);
    } catch (error) {
        // console.error('Error fetching boarding point details:', error);
        res.status(500).json({ message: error.message });
    }
}


exports.GetBlock=async(req,res)=>{
    console.log("1.Block is working... ");
    console.log("1.Request body is working... ", req.body);
  
    // Validate request structure
    if (!req.body.Passenger || !Array.isArray(req.body.Passenger) || req.body.Passenger.length === 0) {
        return res.status(400).json({ 
            message: 'Passenger array is required and must not be empty' 
        }); 
    }
    
    // Validate required fields for seat layout
    if (!req.body.TokenId || !req.body.TraceId || !req.body.EndUserIp || !req.body.ResultIndex) {
        return res.status(400).json({ 
            message: 'Missing required fields: TokenId, TraceId, EndUserIp, ResultIndex' 
        });
    }
    
    try {
        // First, get the current seat layout to ensure we have the latest seat details
        const seatLayoutData = {
            "EndUserIp": req.body.EndUserIp,
            "ResultIndex": req.body.ResultIndex,
            "TraceId": req.body.TraceId,
            "TokenId": req.body.TokenId
        };
        
        console.log("Getting seat layout first...", seatLayoutData);
        
        const seatLayoutResponse = await axios.post(
            'https://busbe.tektravels.com/Busservice.svc/rest/GetBusSeatLayOut',
            seatLayoutData,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log("Seat layout response:", seatLayoutResponse.data);
        
        // Now proceed with the block request using the validated seat data
        const requestData = JSON.parse(JSON.stringify(req.body));
        
        // Validate each passenger's seat data
        requestData.Passenger.forEach((passenger, index) => {
            console.log(`Validating passenger ${index}:`, passenger);
            
            // Validate required passenger fields
            if (!passenger.FirstName || !passenger.LastName || !passenger.Age || !passenger.Gender || !passenger.Phoneno || !passenger.Email) {
                throw new Error(`Passenger ${index + 1} is missing required fields: FirstName, LastName, Age, Gender, Phoneno, Email`);
            }
            
            // ID fields are now optional - only validate if both are provided
            if ((passenger.IdType && !passenger.IdNumber) || (passenger.IdNumber && !passenger.IdType)) {
                throw new Error(`Passenger ${index + 1}: If ID information is provided, both IdType and IdNumber are required`);
            }
            
            if (!passenger.Seat) {
                throw new Error(`Passenger ${index} is missing Seat data`);
            }
            
            const seat = passenger.Seat;
            
            // Check for required seat fields
            const requiredFields = ['SeatIndex', 'SeatName', 'SeatType', 'SeatStatus'];
            for (const field of requiredFields) {
                if (seat[field] === undefined || seat[field] === null) {
                    throw new Error(`Passenger ${index} seat is missing required field: ${field}`);
                }
            }
            
            // Enhanced pricing validation
            if (!seat.PublishedPrice && !seat.SeatFare) {
                throw new Error(`Passenger ${index} seat is missing pricing information (PublishedPrice or SeatFare)`);
            }
            
            // Validate price format and values
            if (seat.PublishedPrice) {
                const price = parseFloat(seat.PublishedPrice);
                if (isNaN(price) || price <= 0) {
                    throw new Error(`Passenger ${index} has invalid PublishedPrice: ${seat.PublishedPrice}`);
                }
                // Ensure price is a positive number
                seat.PublishedPrice = Math.abs(price);
            }
            
            if (seat.SeatFare) {
                const fare = parseFloat(seat.SeatFare);
                console.log("Fare is working... ", fare);
                
                if (isNaN(fare) || fare <= 0) {
                    throw new Error(`Passenger ${index} has invalid SeatFare: ${seat.SeatFare}`);
                }
                // Ensure fare is a positive number
                seat.SeatFare = Math.abs(fare);
            }
            
            console.log(`Passenger ${index} seat validation passed`);
        });
        
        // Convert SeatIndex from string to integer if it exists
        if (requestData.Passenger && Array.isArray(requestData.Passenger)) {
            requestData.Passenger.forEach(passenger => {
                console.log("Passenger is working... ", passenger);
                if (passenger.Seat && passenger.Seat.SeatIndex) {
                    // Handle different seat index formats
                    const seatIndex = passenger.Seat.SeatIndex;
                    
                    if (typeof seatIndex === 'string') {
                        if (seatIndex.includes('-')) {
                            // Format like "2-1" - convert to unique integer
                            const parts = seatIndex.split('-');
                            if (parts.length === 2) {
                                // Use a more reliable conversion method
                                passenger.Seat.SeatIndex = parseInt(parts[0]) * 1000 + parseInt(parts[1]);
                            } else {
                                // Fallback to simple integer conversion
                                passenger.Seat.SeatIndex = parseInt(seatIndex);
                            }
                        } else {
                            // Direct integer conversion
                            passenger.Seat.SeatIndex = parseInt(seatIndex);
                        }
                    } else if (typeof seatIndex === 'number') {
                        // Already a number, ensure it's integer
                        passenger.Seat.SeatIndex = Math.floor(seatIndex);
                    }
                    
                    // Ensure SeatIndex is a valid positive integer
                    if (isNaN(passenger.Seat.SeatIndex) || passenger.Seat.SeatIndex <= 0) {
                        console.error('Invalid SeatIndex:', seatIndex);
                        throw new Error('Invalid SeatIndex format. Expected format like "2-1" or integer.');
                    }
                }
            });
        }
        
        // Validate boarding and dropping point IDs
        if (!requestData.BoardingPointId || !requestData.DroppingPointId) {
            throw new Error('Missing required fields: BoardingPointId, DroppingPointId');
        }
        
        console.log("Sending block request:", requestData);
        
        const apiResponse = await axios.post(
            'https://BusBE.tektravels.com/Busservice.svc/rest/Block', 
            requestData,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log("API Response is working... ", apiResponse.data);
        res.status(200).json(apiResponse.data);
        
    } catch (error) {
        console.error('Error in GetBlock:', error);
        
        // Handle specific API errors
        if (error.response && error.response.data) {
            const errorData = error.response.data;
            if (errorData.BlockResult && errorData.BlockResult.Error) {
                return res.status(400).json({ 
                    message: errorData.BlockResult.Error.ErrorMessage,
                    errorCode: errorData.BlockResult.Error.ErrorCode
                });
            }
        }
        
        res.status(500).json({ message: error.message });
    }
}


exports.GetBook = async (req, res) => {
    console.log("1.Book is working... ");
    console.log("1.Request body is working... ", req.body);
  
    // Validate request structure
    if (!req.body.Passenger || !Array.isArray(req.body.Passenger) || req.body.Passenger.length === 0) {
        return res.status(400).json({ 
            message: 'Passenger array is required and must not be empty' 
        }); 
    }
    
    // Validate required fields for booking
    if (!req.body.TokenId || !req.body.TraceId || !req.body.EndUserIp || !req.body.ResultIndex) {
        return res.status(400).json({ 
            message: 'Missing required fields: TokenId, TraceId, EndUserIp, ResultIndex' 
        });
    }
    
    try {
        // Prepare the booking request data
        const requestData = JSON.parse(JSON.stringify(req.body));
        
        // Validate each passenger's data
        requestData.Passenger.forEach((passenger, index) => {
            console.log(`Validating passenger ${index}:`, passenger);
            
            // Validate required passenger fields
            if (!passenger.FirstName || !passenger.LastName || !passenger.Age || !passenger.Gender || !passenger.Phoneno || !passenger.Email) {
                throw new Error(`Passenger ${index + 1} is missing required fields: FirstName, LastName, Age, Gender, Phoneno, Email`);
            }
            
            // ID fields are optional - only validate if both are provided
            if ((passenger.IdType && !passenger.IdNumber) || (passenger.IdNumber && !passenger.IdType)) {
                throw new Error(`Passenger ${index + 1}: If ID information is provided, both IdType and IdNumber are required`);
            }
            
            if (!passenger.Seat) {
                throw new Error(`Passenger ${index} is missing Seat data`);
            }
            
            const seat = passenger.Seat;
            
            // Check for required seat fields
            const requiredFields = ['SeatIndex', 'SeatName', 'SeatType', 'SeatStatus'];
            for (const field of requiredFields) {
                if (seat[field] === undefined || seat[field] === null) {
                    throw new Error(`Passenger ${index} seat is missing required field: ${field}`);
                }
            }
            
            // Enhanced pricing validation
            if (!seat.PublishedPrice && !seat.SeatFare) {
                throw new Error(`Passenger ${index} seat is missing pricing information (PublishedPrice or SeatFare)`);
            }
            
            // Validate price format and values
            if (seat.PublishedPrice) {
                const price = parseFloat(seat.PublishedPrice);
                if (isNaN(price) || price <= 0) {
                    throw new Error(`Passenger ${index} has invalid PublishedPrice: ${seat.PublishedPrice}`);
                }
                seat.PublishedPrice = Math.abs(price);
            }
            
            if (seat.SeatFare) {
                const fare = parseFloat(seat.SeatFare);
                console.log("Fare is working... ", fare);
                
                if (isNaN(fare) || fare <= 0) {
                    throw new Error(`Passenger ${index} has invalid SeatFare: ${seat.SeatFare}`);
                }
                seat.SeatFare = Math.abs(fare);
            }
            
            console.log(`Passenger ${index} validation passed`);
        });
        
        // Convert SeatIndex from string to integer if it exists
        if (requestData.Passenger && Array.isArray(requestData.Passenger)) {
            requestData.Passenger.forEach(passenger => {
                console.log("Passenger is working... ", passenger);
                if (passenger.Seat && passenger.Seat.SeatIndex) {
                    // Handle different seat index formats
                    const seatIndex = passenger.Seat.SeatIndex;
                    
                    if (typeof seatIndex === 'string') {
                        if (seatIndex.includes('-')) {
                            // Format like "2-1" - convert to unique integer
                            const parts = seatIndex.split('-');
                            if (parts.length === 2) {
                                passenger.Seat.SeatIndex = parseInt(parts[0]) * 1000 + parseInt(parts[1]);
                            } else {
                                passenger.Seat.SeatIndex = parseInt(seatIndex);
                            }
                        } else {
                            // Direct integer conversion
                            passenger.Seat.SeatIndex = parseInt(seatIndex);
                        }
                    } else if (typeof seatIndex === 'number') {
                        // Already a number, ensure it's integer
                        passenger.Seat.SeatIndex = Math.floor(seatIndex);
                    }
                    
                    // Ensure SeatIndex is a valid positive integer
                    if (isNaN(passenger.Seat.SeatIndex) || passenger.Seat.SeatIndex <= 0) {
                        console.error('Invalid SeatIndex:', seatIndex);
                        throw new Error('Invalid SeatIndex format. Expected format like "2-1" or integer.');
                    }
                }
            });
        }
        
        // Validate boarding and dropping point IDs
        if (!requestData.BoardingPointId || !requestData.DroppingPointId) {
            throw new Error('Missing required fields: BoardingPointId, DroppingPointId');
        }
        
        console.log("Sending book request:", requestData);
        
        const apiResponse = await axios.post(
            'https://BusBE.tektravels.com/Busservice.svc/rest/Book', 
            requestData,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log("Book API Response is working... ", apiResponse.data);
        
        // Validate the response
        if (apiResponse.data && apiResponse.data.BookResult) {
            const bookResult = apiResponse.data.BookResult;
            
            // Check if booking was successful (ResponseStatus === 1 and no error)
            if (bookResult.ResponseStatus === 1 && 
                (!bookResult.Error || bookResult.Error.ErrorCode === 0 || bookResult.Error.ErrorCode === undefined)) {
                console.log("Booking successful with BusId:", bookResult.BusId);
                console.log("Booking status:", bookResult.BusBookingStatus);
                res.status(200).json(apiResponse.data);
            } else {
                console.error("Booking failed:", bookResult.Error);
                res.status(400).json({
                    message: bookResult.Error?.ErrorMessage || 'Booking failed',
                    errorCode: bookResult.Error?.ErrorCode
                });
            }
        } else {
            res.status(500).json({ message: 'Invalid response from booking API' });
        }
        
    } catch (error) {
        console.error('Error in GetBook:', error);
        
        // Handle specific API errors
        if (error.response && error.response.data) {
            const errorData = error.response.data;
            if (errorData.BookResult && errorData.BookResult.Error) {
                return res.status(400).json({ 
                    message: errorData.BookResult.Error.ErrorMessage,
                    errorCode: errorData.BookResult.Error.ErrorCode
                });
            }
        }
        
        res.status(500).json({ message: error.message });
    }
}



exports.GetBookingDetails = async (req, res) => {
    console.log("1.Get booking details is working... ");
    console.log("1.Request body is working... ", req.body); // Better logging
  
    
    
   
    

    console.log("Sending booking details request:", req.body);

    try {
        const apiResponse = await axios.post(
            'https://BusBE.tektravels.com/Busservice.svc/rest/GetBookingDetail',
            req.body,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        console.log("Booking Details API Response is working... ", apiResponse.data);
        res.status(200).json(apiResponse.data);
    } catch (error) {
        console.error('Error getting booking details:', error);
        
        // Handle specific API errors
        if (error.response && error.response.data) {
            const errorData = error.response.data;
            if (errorData.BookingDetailsResult && errorData.BookingDetailsResult.Error) {
                return res.status(400).json({ 
                    message: errorData.BookingDetailsResult.Error.ErrorMessage,
                    errorCode: errorData.BookingDetailsResult.Error.ErrorCode
                });
            }
        }
        
        res.status(500).json({ message: error.message });
    }
}

// Create bus booking in database
exports.createBusBooking = async (req, res) => {
    try {
        const {
            user_id,
            busData,
            blockData,
            contactDetails,
            addressDetails,
            travelerDetails,
            fareDetails,
            searchResponse // Add this to get the search response data
        } = req.body;

        // Parse JSON strings to objects if they are strings
        const parsedBusData = typeof busData === 'string' ? JSON.parse(busData) : busData;
        const parsedBlockData = typeof blockData === 'string' ? JSON.parse(blockData) : blockData;
        const parsedContactDetails = typeof contactDetails === 'string' ? JSON.parse(contactDetails) : contactDetails;
        const parsedAddressDetails = typeof addressDetails === 'string' ? JSON.parse(addressDetails) : addressDetails;
        const parsedTravelerDetails = typeof travelerDetails === 'string' ? JSON.parse(travelerDetails) : travelerDetails;
        const parsedFareDetails = typeof fareDetails === 'string' ? JSON.parse(fareDetails) : fareDetails;
        const parsedSearchResponse = typeof searchResponse === 'string' ? JSON.parse(searchResponse) : searchResponse;

        console.log('📥 Received booking data:', {
            user_id,
            busData: parsedBusData ? 'Present' : 'Missing',
            blockData: parsedBlockData ? 'Present' : 'Missing',
            contactDetails: parsedContactDetails ? 'Present' : 'Missing',
            addressDetails: parsedAddressDetails ? 'Present' : 'Missing',
            travelerDetails: parsedTravelerDetails ? Object.keys(parsedTravelerDetails).length + ' travelers' : 'Missing',
            fareDetails: parsedFareDetails ? 'Present' : 'Missing',
            searchResponse: parsedSearchResponse ? 'Present' : 'Missing'
        });

        // Helper function to safely get values
        const safeValue = (value, defaultValue = null) => {
            return value !== undefined && value !== null ? value : defaultValue;
        };

        // Helper function to convert datetime format
        const convertToMySQLDateTime = (dateTimeString) => {
            if (!dateTimeString) return null;
            
            try {
                // Handle different date formats
                let date;
                if (dateTimeString.includes('/')) {
                    // Format: MM/DD/YYYY HH:MM:SS
                    const parts = dateTimeString.split(' ');
                    const dateParts = parts[0].split('/');
                    const timeParts = parts[1] ? parts[1].split(':') : ['00', '00', '00'];
                    
                    date = new Date(
                        parseInt(dateParts[2]), // year
                        parseInt(dateParts[0]) - 1, // month (0-indexed)
                        parseInt(dateParts[1]), // day
                        parseInt(timeParts[0]), // hour
                        parseInt(timeParts[1]), // minute
                        parseInt(timeParts[2]) // second
                    );
                } else {
                    // Try parsing as ISO string or other formats
                    date = new Date(dateTimeString);
                }
                
                if (isNaN(date.getTime())) {
                    console.warn('Invalid date:', dateTimeString);
                    return null;
                }
                
                return date.toISOString().slice(0, 19).replace('T', ' ');
            } catch (error) {
                console.error('Error converting datetime:', dateTimeString, error);
                return null;
            }
        };

        // STEP 1: Get user_id from users table
        let finalUserId = null;

        // Method 1: If user_id is provided in request, validate it exists
        if (user_id) {
            const userCheckQuery = 'SELECT user_id, userName, firstName, lastName, email FROM users WHERE user_id = ?';
            const [userCheck] = await connection.promise().execute(userCheckQuery, [user_id]);
            if (userCheck.length > 0) {
                finalUserId = user_id;
                console.log('✅ Using provided user_id:', finalUserId, 'User:', userCheck[0]);
            } else {
                console.log('❌ Provided user_id not found:', user_id);
            }
        }

        // Method 2: If no user_id or invalid, try to get from email
        if (!finalUserId && contactDetails?.email) {
            const userQuery = 'SELECT user_id, userName, firstName, lastName, email FROM users WHERE email = ?';
            const [users] = await connection.promise().execute(userQuery, [contactDetails.email]);
            if (users.length > 0) {
                finalUserId = users[0].user_id;
                console.log('✅ Found user_id from email:', finalUserId, 'User:', users[0]);
            } else {
                console.log('❌ No user found with email:', contactDetails.email);
            }
        }

        // Method 3: If still no user_id, get the first available user
        if (!finalUserId) {
            const defaultUserQuery = 'SELECT user_id, userName, firstName, lastName, email FROM users ORDER BY user_id ASC LIMIT 1';
            const [defaultUsers] = await connection.promise().execute(defaultUserQuery);
            if (defaultUsers.length > 0) {
                finalUserId = defaultUsers[0].user_id;
                console.log('✅ Using first available user_id:', finalUserId, 'User:', defaultUsers[0]);
            } else {
                return res.status(400).json({ 
                    message: 'No users found in database. Please create a user first.',
                    suggestion: 'Create a user account before making bus bookings.'
                });
            }
        }

        // STEP 2: Validate the final user_id exists
        const userValidationQuery = 'SELECT user_id, userName, firstName, lastName, email FROM users WHERE user_id = ?';
        const [userValidation] = await connection.promise().execute(userValidationQuery, [finalUserId]);
        
        if (userValidation.length === 0) {
            return res.status(400).json({ 
                message: 'Invalid user_id. User does not exist in the database.',
                user_id: finalUserId,
                suggestion: 'Please ensure you are logged in with a valid account.'
            });
        }

        console.log('✅ Final user for booking:', userValidation[0]);

        // STEP 3: Get lead passenger details (first traveler)
        const travelerKeys = Object.keys(parsedTravelerDetails || {});
        const leadPassenger = travelerKeys.length > 0 ? parsedTravelerDetails[travelerKeys[0]] : null;
        const numberOfPassengers = travelerKeys.length;

        console.log('👤 Lead passenger:', leadPassenger);
        console.log('👥 Number of passengers:', numberOfPassengers);

        // STEP 4: Extract origin and destination from search response
        let origin = '';
        let destination = '';

        // First priority: Get from search response (this contains the actual city names)
        if (parsedSearchResponse?.BusSearchResult?.Origin) {
            origin = parsedSearchResponse.BusSearchResult.Origin;
            console.log('📍 Found origin from search response:', origin);
        }

        if (parsedSearchResponse?.BusSearchResult?.Destination) {
            destination = parsedSearchResponse.BusSearchResult.Destination;
            console.log('📍 Found destination from search response:', destination);
        }

        // Second priority: Get from contactDetails (if passed from frontend)
        if (!origin && parsedContactDetails?.fromCityName) {
            origin = parsedContactDetails.fromCityName;
            console.log('📍 Found origin from contactDetails (fromCityName):', origin);
        } else if (!origin && parsedContactDetails?.origin) {
            origin = parsedContactDetails.origin;
            console.log('📍 Found origin from contactDetails (origin):', origin);
        }

        if (!destination && parsedContactDetails?.toCityName) {
            destination = parsedContactDetails.toCityName;
            console.log('📍 Found destination from contactDetails (toCityName):', destination);
        } else if (!destination && parsedContactDetails?.destination) {
            destination = parsedContactDetails.destination;
            console.log('📍 Found destination from contactDetails (destination):', destination);
        }

        // Third priority: Get from busData (API response data)
        if (!origin && parsedBusData?.Origin) {
            origin = parsedBusData.Origin;
            console.log('📍 Found origin from busData.Origin:', origin);
        } else if (!origin && parsedBusData?.OriginName) {
            origin = parsedBusData.OriginName;
            console.log('📍 Found origin from busData.OriginName:', origin);
        }

        if (!destination && parsedBusData?.Destination) {
            destination = parsedBusData.Destination;
            console.log('📍 Found destination from busData.Destination:', destination);
        } else if (!destination && parsedBusData?.DestinationName) {
            destination = parsedBusData.DestinationName;
            console.log('📍 Found destination from busData.DestinationName:', destination);
        }

        // Fourth priority: Get from blockData
        if (!origin && parsedBlockData?.Origin) {
            origin = parsedBlockData.Origin;
            console.log('📍 Found origin from blockData.Origin:', origin);
        }

        if (!destination && parsedBlockData?.Destination) {
            destination = parsedBlockData.Destination;
            console.log('📍 Found destination from blockData.Destination:', destination);
        }

        // Fifth priority: Use boarding/dropping points as fallback
        if (!origin && parsedBlockData?.BoardingPointdetails?.CityPointName) {
            origin = parsedBlockData.BoardingPointdetails.CityPointName;
            console.log('📍 Using boarding point as origin fallback:', origin);
        }

        if (!destination && parsedBlockData?.DroppingPointdetails?.CityPointName) {
            destination = parsedBlockData.DroppingPointdetails.CityPointName;
            console.log('📍 Using dropping point as destination fallback:', destination);
        }

        // Sixth priority: Try from busData boarding/dropping points
        if (!origin && parsedBusData?.BoardingPointsDetails && parsedBusData.BoardingPointsDetails.length > 0) {
            origin = parsedBusData.BoardingPointsDetails[0].CityPointName || '';
            console.log('📍 Using busData boarding point as origin fallback:', origin);
        }

        if (!destination && parsedBusData?.DroppingPointsDetails && parsedBusData.DroppingPointsDetails.length > 0) {
            destination = parsedBusData.DroppingPointsDetails[0].CityPointName || '';
            console.log('📍 Using busData dropping point as destination fallback:', destination);
        }

        // Validate that we have both origin and destination
        if (!origin) {
            console.log('❌ No origin found in any data source');
            console.log('🔍 Debug - searchResponse keys:', Object.keys(parsedSearchResponse || {}));
            console.log('🔍 Debug - contactDetails keys:', Object.keys(parsedContactDetails || {}));
            console.log('🔍 Debug - busData keys:', Object.keys(parsedBusData || {}));
            console.log('🔍 Debug - blockData keys:', Object.keys(parsedBlockData || {}));
            return res.status(400).json({ message: 'Origin city not found in booking data' });
        }
        if (!destination) {
            console.log('❌ No destination found in any data source');
            return res.status(400).json({ message: 'Destination city not found in booking data' });
        }

        console.log('📍 Final extracted origin (city):', origin);
        console.log('📍 Final extracted destination (city):', destination);

        // STEP 5: Insert into bus table with lead passenger details and passenger count
        const busQuery = `
            INSERT INTO bus (
                user_id, origin, destination, journey_date,
                travel_name, bus_type, bus_id, departure_time, arrival_time,
                total_seats, available_seats, no_of_seats_booked,
                base_price, published_price, total_amount, invoice_amount,
                boarding_point_location, boarding_point_time,
                dropping_point_location, dropping_point_time,
                booking_status, booking_reference,
                ticket_no, travel_operator_pnr, invoice_number,
                payment_status, payment_method, transaction_id,
                razorpay_order_id, razorpay_payment_id,
                contact_email, contact_mobile, address, city, state, pincode
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const bookingReference = `BUS${Date.now()}`;
        
        // Use the collected user_id in bus table - EXACTLY 39 values
        const busValues = [
            finalUserId, // 1 - user_id
            origin, // 2 - origin (city name like "Bangalore", "Chennai")
            destination, // 3 - destination (city name like "Hyderabad", "Mumbai")
            safeValue(parsedBlockData?.DepartureTime ? new Date(parsedBlockData.DepartureTime).toISOString().split('T')[0] : null), // 4 - journey_date
            safeValue(parsedBlockData?.TravelName || parsedBusData?.TravelName, ''), // 5 - travel_name
            safeValue(parsedBlockData?.BusType || parsedBusData?.BusType, ''), // 6 - bus_type
            safeValue(parsedBusData?.bus_id || null), // 7 - bus_id
            convertToMySQLDateTime(parsedBlockData?.DepartureTime), // 8 - departure_time
            convertToMySQLDateTime(parsedBlockData?.ArrivalTime), // 9 - arrival_time
            safeValue(parsedBusData?.total_seats || parsedBusData?.AvailableSeats || 0), // 10 - total_seats
            safeValue(parsedBusData?.AvailableSeats || 0), // 11 - available_seats
            numberOfPassengers, // 12 - no_of_seats_booked (number of passengers)
            safeValue(parsedFareDetails?.baseFare, 0), // 13 - base_price
            safeValue(parsedFareDetails?.baseFare, 0), // 14 - published_price
            safeValue(parsedFareDetails?.total, 0), // 15 - total_amount
            safeValue(parsedFareDetails?.total, 0), // 16 - invoice_amount
            safeValue(parsedBlockData?.BoardingPointdetails?.CityPointLocation || 
                     parsedBusData?.BoardingPointsDetails?.[0]?.CityPointLocation || 
                     ''), // 17 - boarding_point_location
            convertToMySQLDateTime(parsedBlockData?.BoardingPointdetails?.CityPointTime), // 18 - boarding_point_time
            safeValue(parsedBlockData?.DroppingPointdetails?.CityPointLocation || 
                     parsedBusData?.DroppingPointsDetails?.[0]?.CityPointLocation || 
                     ''), // 19 - dropping_point_location
            convertToMySQLDateTime(parsedBlockData?.DroppingPointdetails?.CityPointTime || 
                                 parsedBusData?.DroppingPointsDetails?.[0]?.CityPointTime || 
                                 parsedBlockData?.ArrivalTime), // 20 - dropping_point_time
            'Pending', // 21 - booking_status (pending until payment)
            bookingReference, // 22 - booking_reference
            null, // 23 - ticket_no (null until confirmed)
            null, // 24 - travel_operator_pnr (null until confirmed)
            null, // 25 - invoice_number (null until confirmed)
            'Pending', // 26 - payment_status (pending until payment completed)
            null, // 27 - payment_method (null until payment)
            null, // 28 - transaction_id (null until payment)
            null, // 29 - razorpay_order_id (null until payment)
            null, // 30 - razorpay_payment_id (null until payment)
            safeValue(parsedContactDetails?.email, ''), // 31 - contact_email (lead passenger)
            safeValue(parsedContactDetails?.mobile, ''), // 32 - contact_mobile (lead passenger)
            safeValue(parsedAddressDetails?.address), // 33 - address (lead passenger)
            safeValue(parsedAddressDetails?.city), // 34 - city (lead passenger)
            safeValue(parsedAddressDetails?.state), // 35 - state (lead passenger)
            safeValue(parsedAddressDetails?.pincode) // 36 - pincode (lead passenger)
        ];

        console.log('🚌 Bus values to insert with user_id:', finalUserId);
        console.log('📊 Number of values:', busValues.length);
        console.log('📊 Number of placeholders in query:', (busQuery.match(/\?/g) || []).length);
        console.log('👥 Number of passengers:', numberOfPassengers);
        console.log('📍 Origin (City):', origin);
        console.log('📍 Destination (City):', destination);

        const [busResult] = await connection.promise().execute(busQuery, busValues);
        const booking_id = busResult.insertId;
        console.log('✅ Bus booking created with booking_id:', booking_id);

        // STEP 6: Insert all passengers in passengers table
        const passengerQuery = `
            INSERT INTO passengers (
                user_id, booking_id, passengerName, passengerAge, passengerGender,
                passengerCardType, passengerCardNumber, passengerMobileNumber,
                seat_name, seat_fare, is_lead_passenger, title,
                contact_email, contact_mobile, address
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        for (let i = 0; i < travelerKeys.length; i++) {
            const seatLabel = travelerKeys[i];
            const traveler = parsedTravelerDetails[seatLabel];
            const isLeadPassenger = i === 0;

            // Fix gender formatting - ensure it's a single character
            let formattedGender = 'M'; // default
            if (traveler?.gender) {
                const gender = traveler.gender.toString().toUpperCase();
                if (gender === 'MALE' || gender === 'M') {
                    formattedGender = 'M';
                } else if (gender === 'FEMALE' || gender === 'F') {
                    formattedGender = 'F';
                } else {
                    formattedGender = 'M'; // default
                }
            }

            const passengerValues = [
                finalUserId, // Same user_id from users table
                booking_id,
                safeValue(`${traveler?.firstName || ''} ${traveler?.lastName || ''}`.trim(), ''),
                safeValue(traveler?.age, 0),
                formattedGender, // Fixed: Use formatted gender (single character)
                safeValue(traveler?.idType),
                safeValue(traveler?.idNumber),
                safeValue(parsedContactDetails?.mobile, ''),
                seatLabel,
                safeValue(parsedFareDetails?.baseFare ? parsedFareDetails.baseFare / travelerKeys.length : 0),
                isLeadPassenger,
                safeValue(traveler?.title, ''),
                isLeadPassenger ? safeValue(parsedContactDetails?.email) : null,
                isLeadPassenger ? safeValue(parsedContactDetails?.mobile) : null,
                isLeadPassenger ? safeValue(parsedAddressDetails?.address) : null
            ];

            console.log(' Passenger', i + 1, 'values with user_id:', finalUserId);
            await connection.promise().execute(passengerQuery, passengerValues);
        }

        console.log('🎉 All passengers created successfully');

        res.status(200).json({
            success: true,
            booking_id,
            booking_reference: bookingReference,
            message: 'Bus booking created successfully',
            user_id: finalUserId,
            user: userValidation[0],
            passenger_count: numberOfPassengers,
            booking_status: 'Pending',
            payment_status: 'Pending',
            origin: origin,
            destination: destination
        });

    } catch (error) {
        console.error('❌ Error creating bus booking:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get current user's ID from token (for debugging) - NO AUTH
exports.getCurrentUserId = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: 'No authentication required',
            user_id: 1
        });
    } catch (error) {
        console.error('Error getting current user:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get user by email (for debugging) - NO AUTH
exports.getUserByEmail = async (req, res) => {
    try {
        const { email } = req.params;
        
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const userQuery = 'SELECT user_id, userName, firstName, lastName, email FROM users WHERE email = ?';
        const [users] = await connection.promise().execute(userQuery, [email]);
        
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            user: users[0]
        });

    } catch (error) {
        console.error('Error getting user by email:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get all bus bookings for a user
exports.getUserBusBookings = async (req, res) => {
    try {
        const { user_id } = req.params;
        
        const query = `
            SELECT b.*, 
                   COUNT(p.passengerId) as passenger_count
            FROM bus b
            LEFT JOIN passengers p ON b.booking_id = p.booking_id
            WHERE b.user_id = ?
            GROUP BY b.booking_id
            ORDER BY b.created_at DESC
        `;
        
        const [bookings] = await connection.promise().execute(query, [user_id]);
        
        res.status(200).json({
            success: true,
            bookings: bookings
        });
        
    } catch (error) {
        console.error('Error getting user bus bookings:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get specific bus booking with passengers
exports.getBusBookingDetails = async (req, res) => {
    try {
        const { booking_id } = req.params;
        
        // Get booking details
        const bookingQuery = `
            SELECT * FROM bus WHERE booking_id = ?
        `;
        
        const [bookings] = await connection.promise().execute(bookingQuery, [booking_id]);
        
        if (bookings.length === 0) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        
        // Get passenger details
        const passengerQuery = `
            SELECT * FROM passengers WHERE booking_id = ?
        `;
        
        const [passengers] = await connection.promise().execute(passengerQuery, [booking_id]);
        
        res.status(200).json({
            success: true,
            booking: bookings[0],
            passengers: passengers
        });
        
    } catch (error) {
        console.error('Error getting bus booking details:', error);
        res.status(500).json({ message: error.message });
    }
};

// Update bus booking status
exports.updateBusBookingStatus = async (req, res) => {
    try {
        const { booking_id } = req.params;
        const { booking_status, payment_status, ticket_no, travel_operator_pnr } = req.body;
        
        const updateQuery = `
            UPDATE bus 
            SET booking_status = ?, 
                payment_status = ?, 
                ticket_no = ?, 
                travel_operator_pnr = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE booking_id = ?
        `;
        
        await connection.promise().execute(updateQuery, [
            booking_status, 
            payment_status, 
            ticket_no, 
            travel_operator_pnr, 
            booking_id
        ]);
        
        res.status(200).json({
            success: true,
            message: 'Booking status updated successfully'
        });
        
    } catch (error) {
        console.error('Error updating bus booking status:', error);
        res.status(500).json({ message: error.message });
    }
};

// Cancel bus booking
exports.cancelBusBooking = async (req, res) => {
    try {
        const { booking_id } = req.params;
        
        const updateQuery = `
            UPDATE bus 
            SET booking_status = 'Cancelled',
                updated_at = CURRENT_TIMESTAMP
            WHERE booking_id = ?
        `;
        
        await connection.promise().execute(updateQuery, [booking_id]);
        
        res.status(200).json({
            success: true,
            message: 'Booking cancelled successfully'
        });
        
    } catch (error) {
        console.error('Error cancelling bus booking:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get bus booking statistics
exports.getBusBookingStats = async (req, res) => {
    try {
        const { user_id } = req.params;
        
        const statsQuery = `
            SELECT 
                COUNT(*) as total_bookings,
                SUM(CASE WHEN booking_status = 'Confirmed' THEN 1 ELSE 0 END) as confirmed_bookings,
                SUM(CASE WHEN booking_status = 'Pending' THEN 1 ELSE 0 END) as pending_bookings,
                SUM(CASE WHEN booking_status = 'Cancelled' THEN 1 ELSE 0 END) as cancelled_bookings,
                SUM(total_amount) as total_spent
            FROM bus 
            WHERE user_id = ?
        `;
        
        const [stats] = await connection.promise().execute(statsQuery, [user_id]);
        
        res.status(200).json({
            success: true,
            stats: stats[0]
        });
        
    } catch (error) {
        console.error('Error getting bus booking stats:', error);
        res.status(500).json({ message: error.message });
    }
};
