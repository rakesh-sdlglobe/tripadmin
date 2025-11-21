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
    
    // Validate required parameters
    const { EndUserIp, TokenId, BusId, IsBaseCurrencyRequired } = req.body;
    
    if (!EndUserIp || !TokenId || !BusId) {
        console.error("Missing required parameters:", { EndUserIp, TokenId, BusId });
        return res.status(400).json({ 
            message: "Missing required parameters: EndUserIp, TokenId, and BusId are required" 
        });
    }
    
    // Prepare the request data
    const requestData = {
        EndUserIp,
        TokenId,
        BusId,
        IsBaseCurrencyRequired: IsBaseCurrencyRequired !== undefined ? IsBaseCurrencyRequired : false
    };
    
    console.log("Sending booking details request:", requestData);

    try {
        const apiResponse = await axios.post(
            'https://BusBE.tektravels.com/Busservice.svc/rest/GetBookingDetail',
            requestData,
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


exports.busBookingCancel=async(req,res)=>{
    
    console.log("1.Bus cancel is working... ");
    console.log("1.Request body is working... ", req.body);
    
    const { EndUserIp, TokenId, BusId, AgencyId, RequestType, Remarks  } = req.body;
    
    if (!EndUserIp || !TokenId || !BusId || !AgencyId || !RequestType || !Remarks) {
        console.error("Missing required parameters:", { EndUserIp, TokenId, BusId, AgencyId, RequestType, Remarks });
        return res.status(400).json({ 
            message: "Missing required parameters: EndUserIp, TokenId, BusId, AgencyId, RequestType, and Remarks are required" 
        });
    }
    try {
    // Prepare the request data
    const requestData = {
        EndUserIp,
        TokenId,
        BusId,
        AgencyId,
        RequestType,
        Remarks
    }       
    const apiResponse = await axios.post(
        'https://BusBE.tektravels.com/Busservice.svc/rest/SendChangeRequest',
        requestData,
        {
            headers: {
                'Content-Type': 'application/json'
            }
        }
    );
    console.log("Bus cancel API Response is working... ", apiResponse.data);
    res.status(200).json(apiResponse.data);
} catch (error) {
    console.error('Error in Bus cancel:', error);
    res.status(500).json({ message: error.message });
}
}

// Create bus booking in database
exports.createBusBooking = async (req, res) => {
    try {
        const {
            user_id,
            busBookingDetails, // Single object containing all booking details from GetBookingDetailResult
            payment_status, // Easebuzz payment status
            payment_transaction_id // Easebuzz transaction ID
        } = req.body;

        


        // Parse JSON string to object if it's a string
        const parsedBookingDetails = typeof busBookingDetails === 'string' 
            ? JSON.parse(busBookingDetails) 
            : busBookingDetails;

        // Extract Itinerary from GetBookingDetailResult structure
        const itinerary = parsedBookingDetails?.GetBookingDetailResult?.Itinerary || 
                         parsedBookingDetails?.Itinerary || 
                         parsedBookingDetails;

        if (!itinerary) {
            return res.status(400).json({ 
                message: 'Invalid booking details. Itinerary data is missing.',
                received: Object.keys(parsedBookingDetails || {})
            });
        }

        console.log('📥 Received busBookingDetails:', {
            user_id,
            hasGetBookingDetailResult: !!parsedBookingDetails?.GetBookingDetailResult,
            hasItinerary: !!itinerary,
            ticketNo: itinerary?.TicketNo,
            busId: itinerary?.BusId,
            passengerCount: itinerary?.Passenger?.length || 0
        });

        // Helper function to safely get values
        const safeValue = (value, defaultValue = null) => {
            return value !== undefined && value !== null ? value : defaultValue;
        };

        // Helper function to safely truncate passenger name
        const safePassengerName = (firstName, lastName, maxLength = 55) => {
            // Clean and normalize the input
            const cleanFirstName = String(firstName || '').replace(/[^\w\s]/g, '').trim();
            const cleanLastName = String(lastName || '').replace(/[^\w\s]/g, '').trim();
            const fullName = `${cleanFirstName} ${cleanLastName}`.trim();
            
            // Ensure we don't exceed the database limit
            if (fullName.length > maxLength) {
                return fullName.substring(0, maxLength).trim();
            }
            return fullName;
        };

        // Helper function to safely truncate any string field
        const safeTruncate = (value, maxLength = 255, defaultValue = '') => {
            if (!value) return defaultValue;
            const stringValue = String(value);
            return stringValue.length > maxLength ? stringValue.substring(0, maxLength).trim() : stringValue;
        };

        // Helper function to convert datetime format (preserves time without timezone conversion)
        const convertToMySQLDateTime = (dateTimeString) => {
            if (!dateTimeString) return null;
            
            try {
                // If already in MySQL format (YYYY-MM-DD HH:MM:SS), return as-is
                if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(dateTimeString)) {
                    return dateTimeString;
                }
                
                // Handle ISO format (YYYY-MM-DDTHH:MM:SS or YYYY-MM-DDTHH:MM:SS.sssZ)
                if (dateTimeString.includes('T')) {
                    // Remove timezone info and milliseconds, then replace T with space
                    const cleanDateTime = dateTimeString.replace(/Z$/, '').split('.')[0];
                    // Extract date and time parts without timezone conversion
                    const [datePart, timePart] = cleanDateTime.split('T');
                    if (datePart && timePart) {
                        return `${datePart} ${timePart}`;
                    }
                }
                
                // Handle MM/DD/YYYY HH:MM:SS format
                if (dateTimeString.includes('/')) {
                    const parts = dateTimeString.split(' ');
                    const dateParts = parts[0].split('/');
                    const timeParts = parts[1] ? parts[1].split(':') : ['00', '00', '00'];
                    
                    // Format as YYYY-MM-DD HH:MM:SS
                    const year = dateParts[2];
                    const month = dateParts[0].padStart(2, '0');
                    const day = dateParts[1].padStart(2, '0');
                    const hour = timeParts[0].padStart(2, '0');
                    const minute = timeParts[1].padStart(2, '0');
                    const second = timeParts[2] ? timeParts[2].padStart(2, '0') : '00';
                    
                    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
                }
                
                // Handle time-only format (HH:MM:SS or HH:MM) - combine with journey date
                if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(dateTimeString)) {
                    const journeyDate = itinerary?.DateOfJourney || itinerary?.DepartureTime;
                    if (journeyDate) {
                        let datePart;
                        if (journeyDate.includes('T')) {
                            datePart = journeyDate.split('T')[0];
                        } else if (journeyDate.includes(' ')) {
                            datePart = journeyDate.split(' ')[0];
                        } else if (journeyDate.includes('/')) {
                            const parts = journeyDate.split('/');
                            datePart = `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
                        } else {
                            datePart = journeyDate.split(' ')[0];
                        }
                        const timePart = dateTimeString.padEnd(8, ':00');
                        return `${datePart} ${timePart}`;
                    }
                }
                
                // Fallback: try parsing as Date and format manually
                // Note: For ISO strings with timezone, extract directly from string to preserve original time
                if (/^\d{4}-\d{2}-\d{2}/.test(dateTimeString)) {
                    // Looks like a date string, try to extract date and time parts directly
                    const match = dateTimeString.match(/^(\d{4}-\d{2}-\d{2})(?:T| )(\d{2}:\d{2}:\d{2})/);
                    if (match) {
                        return `${match[1]} ${match[2]}`;
                    }
                }
                
                // Last resort: use Date object (may have timezone issues)
                const date = new Date(dateTimeString);
                if (!isNaN(date.getTime())) {
                    // Use UTC components to preserve the time as stored (assuming UTC in database)
                    const year = date.getUTCFullYear();
                    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
                    const day = String(date.getUTCDate()).padStart(2, '0');
                    const hour = String(date.getUTCHours()).padStart(2, '0');
                    const minute = String(date.getUTCMinutes()).padStart(2, '0');
                    const second = String(date.getUTCSeconds()).padStart(2, '0');
                    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
                }
                
                console.warn('Invalid date format:', dateTimeString);
                return null;
            } catch (error) {
                console.error('Error converting datetime:', dateTimeString, error);
                return null;
            }
        };

        // STEP 1: Extract passenger details from itinerary (needed for user lookup)
        const passengers = itinerary?.Passenger || [];
        const numberOfPassengers = passengers.length || itinerary?.NoOfSeats || 0;
        
        // Get lead passenger (first passenger with LeadPassenger flag or first passenger)
        const leadPassengerData = passengers.find(p => p.LeadPassenger) || passengers[0] || null;
        
        let leadPassenger = null;
        if (leadPassengerData) {
            leadPassenger = {
                firstName: leadPassengerData.FirstName || '',
                lastName: leadPassengerData.LastName || '',
                age: leadPassengerData.Age || 0,
                gender: leadPassengerData.Gender === 1 ? 'Male' : leadPassengerData.Gender === 2 ? 'Female' : 'Other',
                phone: leadPassengerData.Phoneno || '',
                email: leadPassengerData.Email || '',
                title: leadPassengerData.Title || '',
                address: leadPassengerData.Address || '',
                city: leadPassengerData.City || '',
                state: leadPassengerData.State || ''
            };
        }

        console.log('👤 Lead passenger:', leadPassenger);
        console.log('👥 Number of passengers:', numberOfPassengers);

        // STEP 2: Get user_id from users table
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

        // Method 2: If no user_id or invalid, try to get from lead passenger email
        if (!finalUserId && leadPassenger?.email) {
            const userQuery = 'SELECT user_id, userName, firstName, lastName, email FROM users WHERE email = ?';
            const [users] = await connection.promise().execute(userQuery, [leadPassenger.email]);
            if (users.length > 0) {
                finalUserId = users[0].user_id;
                console.log('✅ Found user_id from email:', finalUserId, 'User:', users[0]);
            } else {
                console.log('❌ No user found with email:', leadPassenger.email);
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

        // STEP 3: Validate the final user_id exists
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

        // STEP 4: Extract origin and destination from itinerary
        const origin = itinerary?.Origin || '';
        const destination = itinerary?.Destination || '';

        // Validate that we have both origin and destination
        if (!origin) {
            console.log('❌ No origin found in itinerary');
            return res.status(400).json({ message: 'Origin city not found in booking data' });
        }
        if (!destination) {
            console.log('❌ No destination found in itinerary');
            return res.status(400).json({ message: 'Destination city not found in booking data' });
        }

        console.log('📍 Origin:', origin);
        console.log('📍 Destination:', destination);

        // STEP 5: Insert into bus table with all booking details from itinerary
        const busQuery = `
            INSERT INTO bus (
                user_id, origin, destination, journey_date,
                travel_name, bus_type, bus_id, departure_time, arrival_time,
                total_seats, available_seats, no_of_seats_booked,
                base_price, published_price, Offered_Price_RoundedOff, invoice_amount,
                boarding_point_location, boarding_point_time,
                dropping_point_location, dropping_point_time,
                booking_status, booking_reference,
                ticket_no, travel_operator_pnr, invoice_number,
                payment_status, payment_method, transaction_id,
                easebuzz_order_id, easebuzz_payment_id,
                contact_email, contact_mobile, address, city, state, pincode
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const bookingReference = `BUS${Date.now()}`;
        
        // Extract price information from itinerary
        const price = itinerary?.Price || {};
        const boardingPoint = itinerary?.BoardingPointdetails || {};
        const droppingPoint = itinerary?.DroppingPointdetails || {};
        
        // Use the collected user_id in bus table - EXACTLY 36 values
        const busValues = [
            finalUserId, // 1 - user_id
            origin, // 2 - origin
            destination, // 3 - destination
            safeValue(
                itinerary?.DateOfJourney ? new Date(itinerary.DateOfJourney).toISOString().split('T')[0] : 
                itinerary?.DepartureTime ? new Date(itinerary.DepartureTime).toISOString().split('T')[0] : 
                null
            ), // 4 - journey_date
            safeValue(itinerary?.TravelName, ''), // 5 - travel_name
            safeValue(itinerary?.BusType, ''), // 6 - bus_type
            safeValue(itinerary?.BusId, null), // 7 - bus_id
            convertToMySQLDateTime(itinerary?.DepartureTime), // 8 - departure_time
            convertToMySQLDateTime(itinerary?.ArrivalTime), // 9 - arrival_time
            safeValue(itinerary?.NoOfSeats || numberOfPassengers, 0), // 10 - total_seats
            safeValue(0, 0), // 11 - available_seats (not available in booking details)
            numberOfPassengers, // 12 - no_of_seats_booked
            safeValue(price?.BasePrice, 0), // 13 - base_price
            safeValue(price?.PublishedPriceRoundedOff || price?.PublishedPrice, 0), // 14 - published_price
            safeValue(price?.OfferedPriceRoundedOff || price?.OfferedPrice || price?.PublishedPriceRoundedOff || price?.PublishedPrice, 0), // 15 - total_amount
            safeValue(itinerary?.InvoiceAmount || price?.OfferedPriceRoundedOff || price?.OfferedPrice || price?.PublishedPriceRoundedOff || price?.PublishedPrice, 0), // 16 - invoice_amount
            safeValue(boardingPoint?.CityPointLocation || boardingPoint?.CityPointName, ''), // 17 - boarding_point_location
            convertToMySQLDateTime(boardingPoint?.CityPointTime || itinerary?.DepartureTime), // 18 - boarding_point_time
            safeValue(droppingPoint?.CityPointLocation || droppingPoint?.CityPointName || '', ''), // 19 - dropping_point_location
            convertToMySQLDateTime(droppingPoint?.CityPointTime || itinerary?.ArrivalTime), // 20 - dropping_point_time
            safeValue(itinerary?.Status === 2 ? 'Confirmed' : 'Pending', 'Pending'), // 21 - booking_status
            bookingReference, // 22 - booking_reference
            safeValue(itinerary?.TicketNo, null), // 23 - ticket_no
            safeValue(itinerary?.TravelOperatorPNR, null), // 24 - travel_operator_pnr
            safeValue(itinerary?.InvoiceNumber, null), // 25 - invoice_number
            safeValue(payment_status, 'Pending'), // 26 - payment_status
            safeValue(payment_status === 'Completed' ? 'Easebuzz' : null, null), // 27 - payment_method
            safeValue(payment_transaction_id, null), // 28 - transaction_id
            null, // 29 - razorpay_order_id
            null, // 30 - razorpay_payment_id
            safeValue(leadPassenger?.email, ''), // 31 - contact_email
            safeValue(leadPassenger?.phone, ''), // 32 - contact_mobile
            safeValue(leadPassenger?.address, null), // 33 - address
            safeValue(leadPassenger?.city, null), // 34 - city
            safeValue(leadPassenger?.state, null), // 35 - state
            null // 36 - pincode (not available in itinerary structure)
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

        // STEP 6: Insert all passengers in passengers table from itinerary
        const passengerQuery = `
            INSERT INTO passengers (
                user_id, booking_id, passengerName, passengerAge, passengerGender,
                passengerCardType, passengerCardNumber, passengerMobileNumber,
                seat_name, seat_fare, is_lead_passenger, title,
                contact_email, contact_mobile, address
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        for (let i = 0; i < passengers.length; i++) {
            const passenger = passengers[i];
            const isLeadPassenger = passenger?.LeadPassenger || i === 0;

            // Format gender - convert numeric to single character
            let formattedGender = 'M'; // default
            if (passenger?.Gender !== undefined && passenger?.Gender !== null) {
                if (passenger.Gender === 1) {
                    formattedGender = 'M';
                } else if (passenger.Gender === 2) {
                    formattedGender = 'F';
                } else {
                    formattedGender = 'M'; // default
                }
            }

            // Extract seat information
            const seat = passenger?.Seat || {};
            const seatName = seat?.SeatName || '';
            const seatFare = seat?.SeatFare || seat?.Price?.PublishedPriceRoundedOff || seat?.Price?.PublishedPrice || 0;

            const passengerValues = [
                finalUserId, // Same user_id from users table
                booking_id,
                safePassengerName(passenger?.FirstName, passenger?.LastName),
                safeValue(passenger?.Age, 0),
                formattedGender,
                safeTruncate(passenger?.IdType, 50),
                safeTruncate(passenger?.IdNumber, 50),
                safeValue(passenger?.Phoneno, ''),
                seatName,
                safeValue(seatFare, 0),
                isLeadPassenger,
                safeTruncate(passenger?.Title, 20, ''),
                isLeadPassenger ? safeTruncate(passenger?.Email, 100) : null,
                isLeadPassenger ? safeTruncate(passenger?.Phoneno, 20) : null,
                isLeadPassenger ? safeTruncate(passenger?.Address, 500) : null
            ];

            console.log('👤 Passenger', i + 1, 'values with user_id:', finalUserId);
            console.log('👤 Passenger name:', `"${passengerValues[2]}"`);
            console.log('👤 Passenger name length:', passengerValues[2]?.length || 0, 'characters');
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
            booking_status: itinerary?.Status === 2 ? 'Confirmed' : safeValue(payment_status, 'Pending') === 'Completed' ? 'Confirmed' : 'Pending',
            payment_status: safeValue(payment_status, 'Pending'),
            origin: origin,
            destination: destination,
            ticket_no: itinerary?.TicketNo || null,
            travel_operator_pnr: itinerary?.TravelOperatorPNR || null
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
        
        console.log("Fetching bus bookings for user_id:", user_id);
        
        if (!user_id) {
            return res.status(400).json({ 
                success: false,
                message: 'User ID is required' 
            });
        }
        
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
        
        console.log(`Found ${bookings.length} bookings for user_id: ${user_id}`);
        
        res.status(200).json({
            success: true,
            bookings: bookings
        });
        
    } catch (error) {
        console.error('Error getting user bus bookings:', error);
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
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
        const { 
            booking_status, 
            payment_status, 
            payment_method,
            ticket_no, 
            travel_operator_pnr,
            payment_transaction_id,
            easebuzz_payment_id
        } = req.body;
        
        console.log('🔄 Updating bus booking status:', {
            booking_id,
            booking_status,
            payment_status,
            payment_method,
            ticket_no,
            travel_operator_pnr,
            payment_transaction_id,
            easebuzz_payment_id
        });
        
        const updateQuery = `
            UPDATE bus 
            SET booking_status = ?, 
                payment_status = ?, 
                payment_method = COALESCE(?, payment_method),
                ticket_no = ?, 
                travel_operator_pnr = ?,
                transaction_id = COALESCE(?, transaction_id),
                easebuzz_payment_id = COALESCE(?, easebuzz_payment_id),
                updated_at = CURRENT_TIMESTAMP
            WHERE booking_id = ?
        `;
        
        await connection.promise().execute(updateQuery, [
            booking_status, 
            payment_status,
            payment_method || null,
            ticket_no, 
            travel_operator_pnr,
            payment_transaction_id || null,
            easebuzz_payment_id || null,
            booking_id
        ]);
        
        console.log('✅ Bus booking status updated successfully');
        
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
