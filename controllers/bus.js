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
    // console.log("1.Book is working... ");
    // console.log("1.Request body is working... ", JSON.stringify(req.body, null, 2)); // Better logging
    console.log("1.Request body is working... ", req.body);
    
    try {
        // Validate required fields for booking
        const requiredFields = ['EndUserIp', 'ResultIndex', 'TraceId', 'TokenId', 'BoardingPointId', 'DroppingPointId', 'Passenger'];
        for (const field of requiredFields) {
            if (!req.body[field]) {
                return res.status(400).json({ 
                    message: `Missing required field: ${field}` 
                });
            }
        }

        // Validate passenger data
        if (!Array.isArray(req.body.Passenger) || req.body.Passenger.length === 0) {
            return res.status(400).json({ 
                message: 'Passenger array is required and must not be empty' 
            });
        }

        // Validate each passenger
        req.body.Passenger.forEach((passenger, index) => {
            if (!passenger.FirstName || !passenger.LastName || !passenger.Gender || !passenger.Age) {
                throw new Error(`Passenger ${index} is missing required fields (FirstName, LastName, Gender, Age)`);
            }
            
            if (!passenger.Seat || !passenger.Seat.SeatIndex) {
                throw new Error(`Passenger ${index} is missing seat information`);
            }
        });

        console.log("Sending book request:", req.body);

        const apiResponse = await axios.post(
            'https://BusBE.tektravels.com/Busservice.svc/rest/Book',
            req.body,
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
                // console.log("Booking successful with BusId:", bookResult.BusId);
                // console.log("Booking status:", bookResult.BusBookingStatus);
                res.status(200).json(apiResponse.data);
            } else {
                //          console.error("Booking failed:", bookResult.Error);
                res.status(400).json({
                    message: bookResult.Error?.ErrorMessage || 'Booking failed',
                    errorCode: bookResult.Error?.ErrorCode
                });
            }
        } else {
            res.status(500).json({ message: 'Invalid response from booking API' });
        }
        
    } catch (error) {
        // console.error('Error booking bus:', error);
        
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
