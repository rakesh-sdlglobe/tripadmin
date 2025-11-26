// const connection = require("../utils/database");
// const moment = require("moment");
// const { default: axios } = require("axios");
// const { response } = require("express");
// const express = require("express");
// const Razorpay = require("razorpay");
// const cors = require("cors");
// const crypto = require("crypto");
// const e = require("express");

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
// });
// const base_url = "https://sandboxentityapi.trateq.com/";
// const credentials = {
//   Type: "C",
//   Module: "X",
//   Domain: process.env.DOMAIN,
//   LoginID: process.env.LOGIN_ID,
//   Password: process.env.PASSWORD,
//   LanguageLocale: process.env.LANGUAGE,
//   IpAddress: "8.8.8.8",
// };

// exports.getHotelCities = async (req, res) => {
//   const { input } = req.body;
//   try {
//     const response = await axios.post(
//   `${base_url}/SIGNIX/B2B/StaticData/AC`,
//   {
//     Credential: credentials,
//     AcType: "CityHotel",
//     SearchText: input || "",
//     AllData: input ? true : false,
//   },
// );


//     res.status(200).json(response.data);
//   } catch (error) {
//     console.error("Error fetching hotel cities:", error.response?.data || error.message);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

// exports.getHotelsList = async (req, res) => {
//   const {
//     cityId,
//     checkInDate,
//     checkOutDate,
//     Rooms,
//     PageNo,
//     SessionID,
//     Filter,
//     Sort,
//   } = req.body;

//   if (!cityId || !checkInDate || !checkOutDate || !Rooms) {
//     return res.status(400).json({ error: "Missing required fields" });
//   }

//   try {
//     const response = await axios.post(
//       `${base_url}/SIGNIX/B2B/Hotel/CacheSearch`,
//       {
//         Credential: credentials,
//         CheckInDate: checkInDate,
//         CheckOutDate: checkOutDate,
//         Currency: "INR",
//         showDetail: true,
//         Rooms: Rooms,
//         CityId: cityId,
//         PageNo: PageNo,
//         PageSize: 1000,
//         HotelID: null,
//         SessionID: SessionID,
//         TravellerNationality: "IN",
//         CheckInDate: checkInDate,
//         CheckOutDate: checkOutDate,
//         Currency: "INR",
//         //"Rooms": Rooms,
//         ShowDetail: true,
//         Filter: Filter,
//         RoomCriteria: "A",
//         SortCriteria: Sort || { SortBy: "StarRating", SortOrder: "Desc" },
//         SearchProviders: null,
//       }
//     );
//     // console.log("Response:", response.data);
//     res.status(200).json(response.data);
//   } catch (error) {
//     console.error("Error fetching hotels:", error.message);
//     res.status(500).json({ error: error.message });
//   }
// };

// exports.getHotelDetails = async (req, res) => {
//   const {
//     CityId,
//     HotelId,
//     SessionID = null,
//     TravellerNationality = "IN",
//     CheckInDate,
//     CheckOutDate,
//     Currency = "INR",
//     PageNo = 1,
//     PageSize = 100,
//     showDetail = true,
//     Rooms,
//     Filter = {
//       MinPrice: 1,
//       MaxPrice: 99999999,
//       MealPlans: "",
//       StarRatings: "",
//       Hotels: "",
//       Favorite: "",
//     },
//     RoomCriteria = "A",
//     SortCriteria = { SortBy: "StarRating", SortOrder: "Desc" },
//   } = req.body;

//   // console.log("Received request to get hotel details with body:", req.body);

//   // 3) Build the full payload
//   const payload = {
//     Credential: credentials,
//     HotelId,
//     SessionID,
//     CityId,
//     TravellerNationality,
//     CheckInDate,
//     CheckOutDate,
//     Currency,
//     PageNo,
//     PageSize,
//     ShowDetail: showDetail,
//     Rooms,
//     Filter,
//     RoomCriteria,
//     SortCriteria,
//   };

//   console.log("Calling /Hotel/DetailWithPrice with payload:", payload);

//   // 4) Make the request
//   try {
//     const response = await axios.post(
//       `${base_url}/SIGNIX/B2B/Hotel/DetailWithPrice`,
//       payload
//     );
//     // console.log("====> Response from getHotelDetails:", response.data);
//     return res.status(200).json(response.data);
//   } catch (err) {
//     console.error("Error fetching hotel details:", err.message);
//     return res.status(500).json({ error: err.message });
//   }
// };

// exports.getPriceValidation = async (req, res) => {
//   // 1) Destructure everything (with defaults)
//   const request = req.body;
//   request.Credential = credentials;
//   // console.log("Received request to get hotel details with body:", req.body);

//   // 3) Build the full payload
//   const payload = request;

//   console.log("Calling SIGNIX/B2B/PriceValidation with payload:", payload);

//   // 4) Make the request
//   try {
//     const response = await axios.post(
//       `${base_url}/SIGNIX/B2B/PriceValidation`,
//       payload
//     );
//     // console.log("====> Response from getHotelDetails:", response.data);
//     return res.status(200).json(response.data);
//   } catch (err) {
//     console.error("Error fetching PriceValidation:", err.message);
//     return res.status(500).json({ error: err.message });
//   }
// };

// exports.getHotelServiceTax = async (req, res) => {
//   const request = req.body;
//   request.Credential = credentials;
//   const payload = request;
//   try {
//     const response = await axios.post(
//       `${base_url}/SIGNIX/B2B/ServiceTax`,
//       payload
//     );
//     return res.status(200).json(response.data);
//   } catch (err) {
//     console.error("Error fetching PriceValidation:", err.message);
//     return res.status(500).json({ error: err.message });
//   }
// };

// exports.getHotelPrebook = async (req, res) => {
//   const PreBookRequest = req.body;
//   PreBookRequest.Credential = credentials;
//   try {
//     const response = await axios.post(
//       `${base_url}/SIGNIX/B2B/PreBook`,
//       PreBookRequest
//     );
//     res.status(200).json(response.data);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // get hotel pics
// exports.getHotelImages = async (req, res) => {
//   const { HotelProviderSearchId } = req.body;
//   // console.log('Hotels provider id ', HotelProviderSearchId)

//   try {
//     const response = await axios.post(`${base_url}/SIGNIX/B2B/Hotel/Media`, {
//       HotelProviderSearchId,
//       Credential: credentials,
//     });
//     // console.log("====> Response from the get hotels pics are: ", response.data);
//     res.status(200).json(response.data);
//   } catch (error) {
//     // console.log("Error came while fetching the hotel pics ", error.message);
//     res.status(500).json({ error: error.message });
//   }
// };

// exports.processPayment = async (req, res) => {
//   const { amount, currency, receipt } = req.body;

//   try {
//     const options = {
//       amount: amount * 100, // amount in paise
//       currency: currency,
//       receipt: receipt,
//     };

//     const order = await razorpay.orders.create(options);
//     return res.status(200).json(order);
//   } catch (error) {
//     console.error("Error creating Razorpay order:", error.message);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// };

// exports.getHotelBooked = async (req, res) => {
//   const BookRequest = req.body;
//   BookRequest.Credential = credentials;
//   try {
//     const response = await axios.post(
//       `${base_url}/SIGNIX/B2B/BookComplete`,
//       BookRequest
//     );
//     res.status(200).json(response.data);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// exports.getHotelBookedDetails = async (req, res) => {
//   const BookedDetailsRequest = req.body;
//   BookedDetailsRequest.Credential = credentials;
//   try {
//     const response = await axios.post(
//       `${base_url}SIGNIX/B2B/ReservationDetail`,
//       BookedDetailsRequest
//     );
//     res.status(200).json(response.data);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
// exports.getHotelsGeoList = async (req, res) => {
//   const { SessionId } = req.body;
//   console.log("getHotelsGeoList - Request body:", req.body);
//   console.log("getHotelsGeoList - SessionId:", SessionId);

//   try {
//       const payload = {
//           SessionId,
//           "Credential": credentials
//       };
//       console.log("getHotelsGeoList - Payload to external API:", payload);
      
//       const response = await axios.post(`${base_url}/SIGNIX/B2B/Hotel/GpsCoordinateList`, payload);
//       console.log("getHotelsGeoList - Full response from external API:", JSON.stringify(response.data, null, 2));
//       console.log("getHotelsGeoList - Response keys:", Object.keys(response.data || {}));

//       res.status(200).json(response.data);
//   } catch (error) {
//       console.error("getHotelsGeoList - Error:", error.message);
//       console.error("getHotelsGeoList - Error response:", error.response?.data);
//       res.status(500).json({ "error": error.message });
//   }
// }







const connection = require("../utils/database");
const moment = require("moment");
const { default: axios } = require("axios");
const { response } = require("express");
const express = require("express");
const Razorpay = require("razorpay");
const cors = require("cors");
const crypto = require("crypto");
const e = require("express");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
const base_url = "https://sandboxentityapi.trateq.com/";
const axiosInstance = axios.create({
  baseURL: base_url,
  headers: {
    "Content-Type": "application/json",
    "User-Agent": "Tripadmin/1.0",
    Accept: "application/json, text/plain, */*",
  },
});
const credentials = {
  Type: "C",
  Module: "X",
  Domain: process.env.DOMAIN,
  LoginID: process.env.LOGIN_ID,
  Password: process.env.PASSWORD,
  LanguageLocale: process.env.LANGUAGE,
  IpAddress: "8.8.8.8",
};

exports.getHotelCities = async (req, res) => {
  const { input } = req.body;
  try {
    const response = await axiosInstance.post("/SIGNIX/B2B/StaticData/AC", {
      Credential: credentials,
      AcType: "CityHotel",
      SearchText: input || "",
      AllData: Boolean(input),
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error fetching hotel cities:", error.response?.data || error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getHotelsList = async (req, res) => {
  const {
    cityId,
    checkInDate,
    checkOutDate,
    Rooms,
    PageNo,
    SessionID,
    Filter,
    Sort,
  } = req.body;

  if (!cityId || !checkInDate || !checkOutDate || !Rooms) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const response = await axiosInstance.post(
      "/SIGNIX/B2B/Hotel/CacheSearch",
      {
        Credential: credentials,
        CheckInDate: checkInDate,
        CheckOutDate: checkOutDate,
        Currency: "INR",
        showDetail: true,
        Rooms: Rooms,
        CityId: cityId,
        PageNo: PageNo,
        PageSize: 1000,
        HotelID: null,
        SessionID: SessionID,
        TravellerNationality: "IN",
        CheckInDate: checkInDate,
        CheckOutDate: checkOutDate,
        Currency: "INR",
        //"Rooms": Rooms,
        ShowDetail: true,
        Filter: Filter,
        RoomCriteria: "A",
        SortCriteria: Sort || { SortBy: "StarRating", SortOrder: "Desc" },
        SearchProviders: null,
      }
    );
    // console.log("Response:", response.data);
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error fetching hotels:", error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.getHotelDetails = async (req, res) => {
  const {
    CityId,
    HotelId,
    SessionID = null,
    TravellerNationality = "IN",
    CheckInDate,
    CheckOutDate,
    Currency = "INR",
    PageNo = 1,
    PageSize = 100,
    showDetail = true,
    Rooms,
    Filter = {
      MinPrice: 1,
      MaxPrice: 99999999,
      MealPlans: "",
      StarRatings: "",
      Hotels: "",
      Favorite: "",
    },
    RoomCriteria = "A",
    SortCriteria = { SortBy: "StarRating", SortOrder: "Desc" },
  } = req.body;

  // console.log("Received request to get hotel details with body:", req.body);

  // 3) Build the full payload
  const payload = {
    Credential: credentials,
    HotelId,
    SessionID,
    CityId,
    TravellerNationality,
    CheckInDate,
    CheckOutDate,
    Currency,
    PageNo,
    PageSize,
    ShowDetail: showDetail,
    Rooms,
    Filter,
    RoomCriteria,
    SortCriteria,
  };

  console.log("Calling /Hotel/DetailWithPrice with payload:", payload);

  // 4) Make the request
  try {
    const response = await axiosInstance.post(
      "/SIGNIX/B2B/Hotel/DetailWithPrice",
      payload
    );
    // console.log("====> Response from getHotelDetails:", response.data);
    return res.status(200).json(response.data);
  } catch (err) {
    console.error("Error fetching hotel details:", err.message);
    return res.status(500).json({ error: err.message });
  }
};

exports.getPriceValidation = async (req, res) => {
  // 1) Destructure everything (with defaults)
  const request = req.body;
  request.Credential = credentials;
  // console.log("Received request to get hotel details with body:", req.body);

  // 3) Build the full payload
  const payload = request;

  console.log("Calling SIGNIX/B2B/PriceValidation with payload:", payload);

  // 4) Make the request
  try {
    const response = await axiosInstance.post(
      "/SIGNIX/B2B/PriceValidation",
      payload
    );
    // console.log("====> Response from getHotelDetails:", response.data);
    return res.status(200).json(response.data);
  } catch (err) {
    console.error("Error fetching PriceValidation:", err.message);
    return res.status(500).json({ error: err.message });
  }
};

exports.getHotelServiceTax = async (req, res) => {
  const request = req.body;
  request.Credential = credentials;
  const payload = request;
  try {
    const response = await axiosInstance.post(
      "/SIGNIX/B2B/ServiceTax",
      payload
    );
    return res.status(200).json(response.data);
  } catch (err) {
    console.error("Error fetching PriceValidation:", err.message);
    return res.status(500).json({ error: err.message });
  }
};

exports.getHotelPrebook = async (req, res) => {
  try {
    const prebookRequest = {
      Credential: credentials,
      ReservationName: req.body.ReservationName,
      ReservationArrivalDate: req.body.ReservationArrivalDate,
      ReservationCurrency: req.body.ReservationCurrency,
      ReservationAmount: req.body.ReservationAmount,
      ReservationClientReference: req.body.ReservationClientReference,
      ReservationRemarks: req.body.ReservationRemarks,
      BookingDetails: req.body.BookingDetails.map(booking => ({
        SearchType: booking.SearchType,
        UniqueReferencekey: booking.UniqueReferencekey,
        HotelServiceDetail: {
          UniqueReferencekey: booking.HotelServiceDetail.UniqueReferencekey,
          ProviderName: booking.HotelServiceDetail.ProviderName,
          ServiceIdentifer: booking.HotelServiceDetail.ServiceIdentifer,
          ServiceBookPrice: booking.HotelServiceDetail.ServiceBookPrice,
          OptionalToken: booking.HotelServiceDetail.OptionalToken,
          ServiceCheckInTime: booking.HotelServiceDetail.ServiceCheckInTime,
          Image: booking.HotelServiceDetail.Image,
          HotelName: booking.HotelServiceDetail.HotelName,
          FromDate: booking.HotelServiceDetail.FromDate,
          ToDate: booking.HotelServiceDetail.ToDate,
          ServiceName: booking.HotelServiceDetail.ServiceName,
          MealCode: booking.HotelServiceDetail.MealCode,
          PaxDetail: booking.HotelServiceDetail.PaxDetail,
          BookCurrency: booking.HotelServiceDetail.BookCurrency,
          RoomDetails: booking.HotelServiceDetail.RoomDetails.map(room => ({
            RoomId: room.RoomId,
            Adults: room.Adults,
            Teens: room.Teens || 0,
            Children: room.Children || 0,
            Infants: room.Infants || 0,
            RoomName: room.RoomName,
            RoomType: room.RoomType,
            ConfirmationNumber: room.ConfirmationNumber || null,
            Paxs: room.Paxs.map(pax => ({
              LeadPax: pax.LeadPax,
              PaxId: pax.PaxId,
              Title: pax.Title,
              Forename: pax.Forename,
              Surname: pax.Surname,
              PaxType: pax.PaxType,
              Age: pax.Age,
              DOB: pax.DOB,
              AddPax: pax.AddPax,
              PaxEmail: pax.PaxEmail,
              PaxMobile: pax.PaxMobile,
              PaxMobilePrefix: pax.PaxMobilePrefix,
              PaxDocuments: pax.PaxDocuments || null
            })),
            ExtraBed: room.ExtraBed || 0
          }))
        }
      }))
    };

    console.log('Prebook Request:', JSON.stringify(prebookRequest, null, 2));
    
    const response = await axiosInstance.post(
      "/SIGNIX/B2B/PreBook",
      prebookRequest
    );
    
    console.log('Prebook Response:', JSON.stringify(response.data, null, 2));
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error in prebooking:', error.response?.data || error.message);
    res.status(500).json({ 
      error: error.response?.data?.message || error.message,
      details: error.response?.data?.details || null
    });
  }
};

// get hotel pics
exports.getHotelImages = async (req, res) => {
  const { HotelProviderSearchId } = req.body;
  // console.log('Hotels provider id ', HotelProviderSearchId)

  try {
    const response = await axiosInstance.post("/SIGNIX/B2B/Hotel/Media", {
      HotelProviderSearchId,
      Credential: credentials,
    });
    // console.log("====> Response from the get hotels pics are: ", response.data);
    res.status(200).json(response.data);
  } catch (error) {
    // console.log("Error came while fetching the hotel pics ", error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.processPayment = async (req, res) => {
  const { amount, currency, receipt } = req.body;

  try {
    const options = {
      amount: amount * 100, // amount in paise
      currency: currency,
      receipt: receipt,
    };

    const order = await razorpay.orders.create(options);
    return res.status(200).json(order);
  } catch (error) {
    console.error("Error creating Razorpay order:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};
exports.saveHotelBooking = async (req, res) => {
  try {
    // Log incoming request data
    console.log('=== INCOMING REQUEST DATA ===');
    console.log('Request Body:', JSON.stringify(req.body, null, 2));
    console.log('Request Body Keys:', Object.keys(req.body || {}));
    console.log('Request Body Type:', typeof req.body);
    console.log('Is Array?', Array.isArray(req.body));
    
    // Handle case where data might be nested
    let bookingData = req.body;
    if (req.body.data) {
      console.log('⚠️ Data found in req.body.data, using that instead');
      bookingData = req.body.data;
    } else if (req.body.bookingData) {
      console.log('⚠️ Data found in req.body.bookingData, using that instead');
      bookingData = req.body.bookingData;
    }
    
    // Convert camelCase to snake_case if needed (for common fields)
    const fieldMapping = {
      'bookingId': 'booking_id',
      'reservationId': 'reservation_id',
      'internalBookingId': 'internal_booking_id',
      'userId': 'user_id',
      'userName': 'user_name',
      'userEmail': 'user_email',
      'userPhone': 'user_phone',
      'hotelId': 'hotel_id',
      'hotelName': 'hotel_name',
      'hotelAddress': 'hotel_address',
      'hotelCity': 'hotel_city',
      'hotelCountry': 'hotel_country',
      'hotelRating': 'hotel_rating',
      'hotelImageUrl': 'hotel_image_url',
      'hotelProvider': 'hotel_provider',
      'roomName': 'room_name',
      'roomType': 'room_type',
      'numberOfRooms': 'number_of_rooms',
      'mealCode': 'meal_code',
      'serviceIdentifier': 'service_identifier',
      'uniqueReferenceKey': 'unique_reference_key',
      'checkInDate': 'check_in_date',
      'checkOutDate': 'check_out_date',
      'checkInTime': 'check_in_time',
      'numberOfAdults': 'number_of_adults',
      'numberOfChildren': 'number_of_children',
      'numberOfInfants': 'number_of_infants',
      'roomPrice': 'room_price',
      'serviceBookPrice': 'service_book_price',
      'totalAmount': 'total_amount',
      'bookingStatus': 'booking_status',
      'paymentStatus': 'payment_status',
      'paymentId': 'payment_id',
      'paymentMethod': 'payment_method',
      'paymentDate': 'payment_date',
      'confirmationNumber': 'confirmation_number',
      'specialRequests': 'special_requests',
      'cancellationPolicy': 'cancellation_policy',
      'bookingRemarks': 'booking_remarks',
      'primaryGuestDetails': 'primary_guest_details',
      'travellerDetails': 'traveller_details',
      'roomDetails': 'room_details',
      'prebookResponse': 'prebook_response',
      'bookCompleteResponse': 'book_complete_response',
      'optionalToken': 'optional_token',
      'bookingDate': 'booking_date'
    };
    
    // Convert camelCase fields to snake_case
    const normalizedData = { ...bookingData };
    Object.keys(fieldMapping).forEach(camelKey => {
      if (normalizedData[camelKey] !== undefined && normalizedData[fieldMapping[camelKey]] === undefined) {
        console.log(`⚠️ Converting ${camelKey} to ${fieldMapping[camelKey]}`);
        normalizedData[fieldMapping[camelKey]] = normalizedData[camelKey];
        delete normalizedData[camelKey];
      }
    });
    
    bookingData = normalizedData;
    console.log('Normalized Data Keys:', Object.keys(bookingData));
    
    // Validate required fields
    const requiredFields = [
      'booking_id', 'reservation_id', 'internal_booking_id',
      'user_id', 'user_name', 'user_email', 'user_phone',
      'hotel_id', 'hotel_name', 'hotel_image_url', 'hotel_provider',
      'room_name', 'meal_code',
      'check_in_date', 'check_out_date',
      'number_of_adults', 'number_of_children', 'number_of_infants',
      'room_price', 'service_book_price', 'total_amount', 'currency',
      'primary_guest_details', 'traveller_details', 'room_details'
    ];
    
    const missingFields = requiredFields.filter(field => {
      const value = bookingData[field];
      return value === undefined || value === null || value === '';
    });
    
    if (missingFields.length > 0) {
      console.error('❌ Missing required fields:', missingFields);
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        missingFields: missingFields,
        receivedFields: Object.keys(bookingData || {})
      });
    }
    
    // Validate date format
    if (!bookingData.check_in_date || !bookingData.check_out_date) {
      return res.status(400).json({
        success: false,
        message: 'check_in_date and check_out_date are required',
        check_in_date: bookingData.check_in_date,
        check_out_date: bookingData.check_out_date
      });
    }
    
    // Calculate number of nights and total guests
    const checkInDate = new Date(bookingData.check_in_date);
    const checkOutDate = new Date(bookingData.check_out_date);
    
    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD format',
        check_in_date: bookingData.check_in_date,
        check_out_date: bookingData.check_out_date
      });
    }
    
    const number_of_nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const total_guests = (bookingData.number_of_adults || 2) + (bookingData.number_of_children || 0) + (bookingData.number_of_infants || 0);
    
    console.log('✅ Validation passed');
    console.log('Calculated number_of_nights:', number_of_nights);
    console.log('Calculated total_guests:', total_guests);
    
    // Define columns array to ensure query and values match
    // Note: number_of_nights and total_guests are GENERATED COLUMNS in MySQL, so they're excluded from INSERT
    const columns = [
      'booking_id', 'reservation_id', 'internal_booking_id', 'user_id', 'user_name', 'user_email', 'user_phone',
      'hotel_id', 'hotel_name', 'hotel_address', 'hotel_city', 'hotel_country', 'hotel_rating', 'hotel_image_url', 'hotel_provider',
      'room_name', 'room_type', 'number_of_rooms', 'meal_code', 'service_identifier', 'unique_reference_key',
      'check_in_date', 'check_out_date', 'check_in_time', 'number_of_adults', 'number_of_children', 'number_of_infants',
      'room_price', 'taxes', 'service_book_price', 'total_amount', 'currency', 'booking_status', 'payment_status',
      'payment_id', 'payment_method', 'payment_date', 'confirmation_number', 'special_requests', 'cancellation_policy', 'booking_remarks',
      'primary_guest_details', 'traveller_details', 'room_details', 'prebook_response', 'book_complete_response', 'optional_token',
      'created_at', 'updated_at', 'booking_date'
    ];
    
    // Build query dynamically to ensure column and placeholder counts match
    const placeholders = columns.map(() => '?').join(', ');
    const query = `INSERT INTO hotel_bookings (${columns.join(', ')}) VALUES (${placeholders})`;

    try {
      const values = [
        bookingData.booking_id,
        bookingData.reservation_id,
        bookingData.internal_booking_id,
        bookingData.user_id,
        bookingData.user_name,
        bookingData.user_email,
        bookingData.user_phone,
        bookingData.hotel_id,
        bookingData.hotel_name,
        bookingData.hotel_address,
        bookingData.hotel_city,
        bookingData.hotel_country,
        bookingData.hotel_rating,
        bookingData.hotel_image_url,
        bookingData.hotel_provider,
        bookingData.room_name,
        bookingData.room_type,
        bookingData.number_of_rooms || 1,
        bookingData.meal_code,
        bookingData.service_identifier,
        bookingData.unique_reference_key,
        bookingData.check_in_date,
        bookingData.check_out_date,
        bookingData.check_in_time,
        // number_of_nights is a GENERATED COLUMN - calculated automatically by MySQL
        bookingData.number_of_adults || 2,
        bookingData.number_of_children || 0,
        bookingData.number_of_infants || 0,
        // total_guests is a GENERATED COLUMN - calculated automatically by MySQL
        bookingData.room_price,
        bookingData.taxes || 0,
        bookingData.service_book_price,
        bookingData.total_amount,
        bookingData.currency || 'AED',
        bookingData.booking_status || 'pending',
        bookingData.payment_status || 'pending',
        bookingData.payment_id,
        bookingData.payment_method,
        bookingData.payment_date,
        bookingData.confirmation_number,
        bookingData.special_requests,
        bookingData.cancellation_policy,
        bookingData.booking_remarks,
        JSON.stringify(bookingData.primary_guest_details || {}),
        JSON.stringify(bookingData.traveller_details || []),
        JSON.stringify(bookingData.room_details || {}),
        JSON.stringify(bookingData.prebook_response || {}),
        JSON.stringify(bookingData.book_complete_response || {}),
        bookingData.optional_token,
        new Date(),
        new Date(),
        bookingData.booking_date || bookingData.check_in_date
      ];
      
      // Log values for debugging
      console.log('=== PREPARED VALUES ===');
      console.log('Values count:', values.length);
      console.log('Placeholders count:', (query.match(/\?/g) || []).length);
      console.log('Values preview (first 10):', values.slice(0, 10));
      console.log('Values preview (last 10):', values.slice(-10));
      
      // Check for undefined values
      const undefinedIndices = [];
      values.forEach((val, index) => {
        if (val === undefined) {
          undefinedIndices.push({ index, column: columns[index] });
        }
      });
      
      if (undefinedIndices.length > 0) {
        console.error('❌ Undefined values found:', undefinedIndices);
        return res.status(400).json({
          success: false,
          message: 'Some required fields are undefined',
          undefinedFields: undefinedIndices
        });
      }
      
      console.log('=== EXECUTING QUERY ===');
      const [result] = await connection.promise().query(query, values);
      
      console.log('Query executed successfully');
      console.log('Insert ID:', result.insertId);
      
      res.status(200).json({ 
        success: true, 
        message: 'Booking saved successfully',
        bookingId: result.insertId 
      });
    } catch (error) {
      console.error('❌ Database error in saveHotelBooking:', error);
      console.error('Error code:', error.code);
      console.error('Error errno:', error.errno);
      console.error('Error SQL:', error.sql);
      console.error('Error SQL State:', error.sqlState);
      console.error('Error SQL Message:', error.sqlMessage);
      
      // Provide more detailed error information
      let errorMessage = error.message;
      if (error.code === 'ER_NON_DEFAULT_VALUE_FOR_GENERATED_COLUMN') {
        errorMessage = 'Cannot insert into generated column. Make sure you are NOT sending number_of_nights, created_at, or updated_at fields.';
      } else if (error.code === 'ER_PARSE_ERROR') {
        errorMessage = `SQL Syntax Error: ${error.sqlMessage}. Check that all field names match the database schema.`;
      } else if (error.code === 'ER_BAD_NULL_ERROR') {
        errorMessage = `Null value error: ${error.sqlMessage}. Some required fields may be null.`;
      }
      
      res.status(500).json({ 
        success: false, 
        message: 'Failed to save booking',
        error: errorMessage,
        errorCode: error.code,
        errorDetails: {
          code: error.code,
          errno: error.errno,
          sqlState: error.sqlState,
          sqlMessage: error.sqlMessage
        }
      });
    }
  } catch (error) {
    console.error('❌ Error in saveHotelBooking (outer catch):', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to save booking',
      error: error.message,
      errorType: error.constructor.name
    });
  }
};

exports.getHotelBooked = async (req, res) => {
  try {
    const bookRequest = {
      Credential: credentials,
      ReservationId: req.body.ReservationId,
      ReservationName: req.body.ReservationName,
      ReservationArrivalDate: req.body.ReservationArrivalDate,
      ReservationCurrency: req.body.ReservationCurrency,
      ReservationAmount: req.body.ReservationAmount,
      ReservationClientReference: req.body.ReservationClientReference,
      ReservationRemarks: req.body.ReservationRemarks,
      BookingDetails: req.body.BookingDetails.map(booking => ({
        BookingId: booking.BookingId,
        SearchType: booking.SearchType,
        UniqueReferencekey: booking.UniqueReferencekey,
        HotelServiceDetail: {
          UniqueReferencekey: booking.HotelServiceDetail.UniqueReferencekey,
          ProviderName: booking.HotelServiceDetail.ProviderName,
          ServiceIdentifer: booking.HotelServiceDetail.ServiceIdentifer,
          ServiceBookPrice: booking.HotelServiceDetail.ServiceBookPrice,
          OptionalToken: booking.HotelServiceDetail.OptionalToken,
          ServiceCheckInTime: booking.HotelServiceDetail.ServiceCheckInTime,
          Image: booking.HotelServiceDetail.Image,
          HotelName: booking.HotelServiceDetail.HotelName,
          FromDate: booking.HotelServiceDetail.FromDate,
          ToDate: booking.HotelServiceDetail.ToDate,
          ServiceName: booking.HotelServiceDetail.ServiceName,
          MealCode: booking.HotelServiceDetail.MealCode,
          PaxDetail: booking.HotelServiceDetail.PaxDetail,
          BookCurrency: booking.HotelServiceDetail.BookCurrency,
          RoomDetails: booking.HotelServiceDetail.RoomDetails.map(room => ({
            RoomId: room.RoomId,
            Adults: room.Adults,
            Teens: room.Teens || 0,
            Children: room.Children || 0,
            Infants: room.Infants || 0,
            RoomName: room.RoomName,
            RoomType: room.RoomType,
            ConfirmationNumber: room.ConfirmationNumber || null,
            Paxs: room.Paxs.map(pax => ({
              LeadPax: pax.LeadPax,
              PaxId: pax.PaxId,
              Title: pax.Title,
              Forename: pax.Forename,
              Midname: pax.Midname || null,
              Surname: pax.Surname,
              PaxType: pax.PaxType,
              Age: pax.Age,
              DOB: pax.DOB,
              AddPax: pax.AddPax,
              PaxEmail: pax.PaxEmail,
              PaxMobile: pax.PaxMobile,
              PaxMobilePrefix: pax.PaxMobilePrefix,
              PaxDocuments: pax.PaxDocuments || null
            })),
            ExtraBed: room.ExtraBed || 0
          }))
        }
      }))
    };

    console.log('Book Complete Request:', JSON.stringify(bookRequest, null, 2));
    
    const response = await axiosInstance.post(
      "/SIGNIX/B2B/BookComplete",
      bookRequest
    );
    
    console.log('Book Complete Response:', JSON.stringify(response.data, null, 2));
    
    // Prepare booking data
    const bookingData = {
      // Booking Identifiers
      booking_id: response.data.BookingId || `HOTEL-${Date.now()}`,
      reservation_id: response.data.ReservationId || req.body.ReservationId,
      internal_booking_id: `INT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      
      // User Information (update with actual user data from your auth system)
      user_id: req.user?.id || 1,
      user_name: req.user?.name || 'Guest User',
      user_email: req.user?.email || 'guest@example.com',
      user_phone: req.user?.phone || '',
      
      // Hotel Information
      hotel_id: req.body.BookingDetails?.[0]?.HotelServiceDetail?.HotelId,
      hotel_name: req.body.BookingDetails?.[0]?.HotelServiceDetail?.HotelName,
      hotel_address: req.body.BookingDetails?.[0]?.HotelServiceDetail?.Address,
      hotel_city: req.body.BookingDetails?.[0]?.HotelServiceDetail?.City,
      hotel_country: req.body.BookingDetails?.[0]?.HotelServiceDetail?.Country,
      hotel_rating: req.body.BookingDetails?.[0]?.HotelServiceDetail?.Rating,
      hotel_image_url: req.body.BookingDetails?.[0]?.HotelServiceDetail?.Image,
      hotel_provider: req.body.BookingDetails?.[0]?.HotelServiceDetail?.ProviderName,
      
      // Room Information
      room_name: req.body.BookingDetails?.[0]?.HotelServiceDetail?.RoomDetails?.[0]?.RoomName,
      room_type: req.body.BookingDetails?.[0]?.HotelServiceDetail?.RoomDetails?.[0]?.RoomType,
      number_of_rooms: req.body.BookingDetails?.[0]?.HotelServiceDetail?.RoomDetails?.length || 1,
      meal_code: req.body.BookingDetails?.[0]?.HotelServiceDetail?.MealCode,
      service_identifier: req.body.BookingDetails?.[0]?.HotelServiceDetail?.ServiceIdentifer,
      unique_reference_key: req.body.BookingDetails?.[0]?.UniqueReferencekey,
      
      // Dates
      check_in_date: req.body.BookingDetails?.[0]?.HotelServiceDetail?.FromDate,
      check_out_date: req.body.BookingDetails?.[0]?.HotelServiceDetail?.ToDate,
      check_in_time: req.body.BookingDetails?.[0]?.HotelServiceDetail?.ServiceCheckInTime,
      
      // Guest Information
      number_of_adults: req.body.BookingDetails?.[0]?.HotelServiceDetail?.RoomDetails?.[0]?.Adults || 2,
      number_of_children: req.body.BookingDetails?.[0]?.HotelServiceDetail?.RoomDetails?.[0]?.Children || 0,
      number_of_infants: req.body.BookingDetails?.[0]?.HotelServiceDetail?.RoomDetails?.[0]?.Infants || 0,
      
      // Pricing
      room_price: req.body.BookingDetails?.[0]?.HotelServiceDetail?.ServiceBookPrice,
      taxes: 0, // Calculate based on your requirements
      service_book_price: req.body.BookingDetails?.[0]?.HotelServiceDetail?.ServiceBookPrice,
      total_amount: req.body.ReservationAmount,
      currency: req.body.ReservationCurrency || 'AED',
      
      // Status
      booking_status: 'confirmed',
      payment_status: 'pending', // Update based on actual payment status
      
      // JSON Fields
      primary_guest_details: req.body.BookingDetails?.[0]?.HotelServiceDetail?.RoomDetails?.[0]?.Paxs?.[0],
      traveller_details: req.body.BookingDetails?.[0]?.HotelServiceDetail?.RoomDetails?.[0]?.Paxs,
      room_details: req.body.BookingDetails?.[0]?.HotelServiceDetail?.RoomDetails,
      prebook_response: req.body.prebookResponse, // If available
      book_complete_response: response.data,
      optional_token: req.body.BookingDetails?.[0]?.HotelServiceDetail?.OptionalToken
    };

    // Save booking to database
    try {
      const saveResult = await this.saveHotelBooking({ body: bookingData }, { status: () => ({ json: (data) => data }) });
      if (saveResult && !saveResult.success) {
        console.error('Failed to save booking to database:', saveResult.error);
        // Don't fail the request, just log the error
      }
    } catch (saveError) {
      console.error('Error saving booking to database:', saveError);
      // Continue with the response even if save fails
    }

    res.status(200).json({
      ...response.data,
      internal_booking_id: bookingData.internal_booking_id
    });
  } catch (error) {
    console.error('Error in book complete:', error.response?.data || error.message);
    res.status(500).json({ 
      error: error.response?.data?.message || error.message,
      details: error.response?.data?.details || null
    });
  }
};

exports.getHotelBookedDetails = async (req, res) => {
  const BookedDetailsRequest = req.body;
  BookedDetailsRequest.Credential = credentials;
  try {
    const response = await axiosInstance.post(
      "/SIGNIX/B2B/ReservationDetail",
      BookedDetailsRequest
    );
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.getHotelsGeoList = async (req, res) => {
  const { SessionId } = req.body;
  console.log("getHotelsGeoList - Request body:", req.body);
  console.log("getHotelsGeoList - SessionId:", SessionId);

  try {
      const payload = {
          SessionId,
          "Credential": credentials
      };
      console.log("getHotelsGeoList - Payload to external API:", payload);
      
      const response = await axiosInstance.post("/SIGNIX/B2B/Hotel/GpsCoordinateList", payload);
      console.log("getHotelsGeoList - Full response from external API:", JSON.stringify(response.data, null, 2));
      console.log("getHotelsGeoList - Response keys:", Object.keys(response.data || {}));

      res.status(200).json(response.data);
  } catch (error) {
      console.error("getHotelsGeoList - Error:", error.message);
      console.error("getHotelsGeoList - Error response:", error.response?.data);
      res.status(500).json({ "error": error.message });
  }
}

// Get all hotel bookings with optional filters
exports.getAllHotelBookings = async (req, res) => {
  try {
    const {
      user_id,
      booking_status,
      payment_status,
      hotel_id,
      check_in_date_from,
      check_in_date_to,
      booking_date_from,
      booking_date_to,
      limit = 100,
      offset = 0,
      sort_by = 'created_at',
      sort_order = 'DESC'
    } = req.query;

    // Build WHERE clause dynamically
    const conditions = [];
    const values = [];

    if (user_id) {
      conditions.push('user_id = ?');
      values.push(user_id);
    }

    if (booking_status) {
      conditions.push('booking_status = ?');
      values.push(booking_status);
    }

    if (payment_status) {
      conditions.push('payment_status = ?');
      values.push(payment_status);
    }

    if (hotel_id) {
      conditions.push('hotel_id = ?');
      values.push(hotel_id);
    }

    if (check_in_date_from) {
      conditions.push('check_in_date >= ?');
      values.push(check_in_date_from);
    }

    if (check_in_date_to) {
      conditions.push('check_in_date <= ?');
      values.push(check_in_date_to);
    }

    if (booking_date_from) {
      conditions.push('booking_date >= ?');
      values.push(booking_date_from);
    }

    if (booking_date_to) {
      conditions.push('booking_date <= ?');
      values.push(booking_date_to);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    // Validate sort_by to prevent SQL injection
    const allowedSortColumns = [
      'created_at', 'updated_at', 'booking_date', 'check_in_date', 
      'check_out_date', 'total_amount', 'booking_status', 'payment_status'
    ];
    const safeSortBy = allowedSortColumns.includes(sort_by) ? sort_by : 'created_at';
    const safeSortOrder = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const query = `
      SELECT 
        id,
        booking_id,
        reservation_id,
        internal_booking_id,
        user_id,
        user_name,
        user_email,
        user_phone,
        hotel_id,
        hotel_name,
        hotel_address,
        hotel_city,
        hotel_country,
        hotel_rating,
        hotel_image_url,
        hotel_provider,
        room_name,
        room_type,
        number_of_rooms,
        meal_code,
        service_identifier,
        unique_reference_key,
        check_in_date,
        check_out_date,
        check_in_time,
        number_of_nights,
        number_of_adults,
        number_of_children,
        number_of_infants,
        total_guests,
        room_price,
        taxes,
        service_book_price,
        total_amount,
        currency,
        booking_status,
        payment_status,
        payment_id,
        payment_method,
        payment_date,
        confirmation_number,
        special_requests,
        cancellation_policy,
        booking_remarks,
        primary_guest_details,
        traveller_details,
        room_details,
        prebook_response,
        book_complete_response,
        optional_token,
        created_at,
        updated_at,
        booking_date
      FROM hotel_bookings
      ${whereClause}
      ORDER BY ${safeSortBy} ${safeSortOrder}
      LIMIT ? OFFSET ?
    `;

    values.push(parseInt(limit), parseInt(offset));

    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) as total FROM hotel_bookings ${whereClause}`;
    const countValues = values.slice(0, -2); // Remove limit and offset for count query

    const [bookings] = await connection.promise().query(query, values);
    const [countResult] = await connection.promise().query(countQuery, countValues);
    const total = countResult[0].total;

    // Parse JSON fields (handle both string and object types)
    const parseJsonField = (field) => {
      if (!field) return null;
      if (typeof field === 'object') return field; // Already parsed
      if (typeof field === 'string') {
        try {
          return JSON.parse(field);
        } catch (e) {
          return field; // Return as string if parsing fails
        }
      }
      return field;
    };

    const parsedBookings = bookings.map(booking => ({
      ...booking,
      primary_guest_details: parseJsonField(booking.primary_guest_details),
      traveller_details: parseJsonField(booking.traveller_details) || [],
      room_details: parseJsonField(booking.room_details) || [],
      prebook_response: parseJsonField(booking.prebook_response),
      book_complete_response: parseJsonField(booking.book_complete_response),
    }));

    res.status(200).json({
      success: true,
      data: parsedBookings,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching hotel bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hotel bookings',
      error: error.message
    });
  }
};

// Get hotel bookings by user ID
exports.getUserHotelBookings = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { booking_status, payment_status, limit = 50, offset = 0 } = req.query;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'user_id is required'
      });
    }

    const conditions = ['user_id = ?'];
    const values = [user_id];

    if (booking_status) {
      conditions.push('booking_status = ?');
      values.push(booking_status);
    }

    if (payment_status) {
      conditions.push('payment_status = ?');
      values.push(payment_status);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const query = `
      SELECT 
        id,
        booking_id,
        reservation_id,
        internal_booking_id,
        user_id,
        user_name,
        user_email,
        hotel_id,
        hotel_name,
        hotel_city,
        hotel_country,
        hotel_rating,
        hotel_image_url,
        hotel_provider,
        room_name,
        number_of_rooms,
        meal_code,
        check_in_date,
        check_out_date,
        number_of_nights,
        number_of_adults,
        number_of_children,
        number_of_infants,
        total_guests,
        total_amount,
        currency,
        booking_status,
        payment_status,
        confirmation_number,
        created_at,
        booking_date
      FROM hotel_bookings
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;

    values.push(parseInt(limit), parseInt(offset));

    const [bookings] = await connection.promise().query(query, values);

    res.status(200).json({
      success: true,
      data: bookings,
      count: bookings.length
    });
  } catch (error) {
    console.error('Error fetching user hotel bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user hotel bookings',
      error: error.message
    });
  }
};

// Get specific hotel booking by booking_id
exports.getHotelBookingById = async (req, res) => {
  try {
    const { booking_id } = req.params;

    if (!booking_id) {
      return res.status(400).json({
        success: false,
        message: 'booking_id is required'
      });
    }

    const query = `
      SELECT 
        id,
        booking_id,
        reservation_id,
        internal_booking_id,
        user_id,
        user_name,
        user_email,
        user_phone,
        hotel_id,
        hotel_name,
        hotel_address,
        hotel_city,
        hotel_country,
        hotel_rating,
        hotel_image_url,
        hotel_provider,
        room_name,
        room_type,
        number_of_rooms,
        meal_code,
        service_identifier,
        unique_reference_key,
        check_in_date,
        check_out_date,
        check_in_time,
        number_of_nights,
        number_of_adults,
        number_of_children,
        number_of_infants,
        total_guests,
        room_price,
        taxes,
        service_book_price,
        total_amount,
        currency,
        booking_status,
        payment_status,
        payment_id,
        payment_method,
        payment_date,
        confirmation_number,
        special_requests,
        cancellation_policy,
        booking_remarks,
        primary_guest_details,
        traveller_details,
        room_details,
        prebook_response,
        book_complete_response,
        optional_token,
        created_at,
        updated_at,
        booking_date
      FROM hotel_bookings
      WHERE booking_id = ?
    `;

    const [bookings] = await connection.promise().query(query, [booking_id]);

    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Hotel booking not found'
      });
    }

    const booking = bookings[0];

    // Parse JSON fields (handle both string and object types)
    const parseJsonField = (field) => {
      if (!field) return null;
      if (typeof field === 'object') return field; // Already parsed
      if (typeof field === 'string') {
        try {
          return JSON.parse(field);
        } catch (e) {
          return field; // Return as string if parsing fails
        }
      }
      return field;
    };

    const parsedBooking = {
      ...booking,
      primary_guest_details: parseJsonField(booking.primary_guest_details),
      traveller_details: parseJsonField(booking.traveller_details) || [],
      room_details: parseJsonField(booking.room_details) || [],
      prebook_response: parseJsonField(booking.prebook_response),
      book_complete_response: parseJsonField(booking.book_complete_response),
    };

    res.status(200).json({
      success: true,
      data: parsedBooking
    });
  } catch (error) {
    console.error('Error fetching hotel booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hotel booking',
      error: error.message
    });
  }
};

