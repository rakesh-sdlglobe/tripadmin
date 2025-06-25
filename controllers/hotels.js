const connection = require('../utils/database');
const moment = require('moment');
const { default: axios } = require('axios');
const { response } = require('express');

const base_url = 'https://sandboxentityapi.trateq.com/';
const credentials = {
    "Type": "C",
    "Module": "X",
    "Domain": process.env.DOMAIN,
    "LoginID": process.env.LOGIN_ID,
    "Password": process.env.PASSWORD,
    "LanguageLocale": process.env.LANGUAGE,
    "IpAddress": "8.8.8.8"
}

exports.getHotelCities = async (req, res) => {

    const { input } = req.body;
    try {
        const response = await axios.post(`${base_url}/SIGNIX/B2B/StaticData/AC`, {
            "Credential": credentials,
            "AcType": input ? "CityHotel" : "City",
            "SearchText": input || "",
            "AllData": input ? true : false,
        });

        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error fetching hotel cities:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getHotelsList = async (req, res) => {
    const { cityId, checkInDate, checkOutDate, Rooms } = req.body;

    if (!cityId || !checkInDate || !checkOutDate || !Rooms) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const response = await axios.post(`${base_url}/SIGNIX/B2B/Hotel/CacheSearch`, {
            "Credential": credentials,
            "CityId": cityId,
            "CheckInDate": checkInDate,
            "CheckOutDate": checkOutDate,
            "Currency": "INR",
            "showDetail": true,
            "Rooms": Rooms
        });
        console.log("Response:", response.data);
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error fetching hotels:', error.message);
        res.status(500).json({ error: error.message });
    }
}

// Get Hotel Details
// exports.getHotelDetails = async (req, res) => {

// }

exports.getHotelDetails = async (req, res) => {
    // 1) Destructure everything (with defaults)
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
            Favorite: ""
        },
        RoomCriteria = "A",
        SortCriteria = { SortBy: "StarRating", SortOrder: "Desc" }
    } = req.body;

    console.log("Received request to get hotel details with body:", req.body);

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
        SortCriteria
    };

    console.log("Calling /Hotel/DetailWithPrice with payload:", payload);

    // 4) Make the request
    try {
        const response = await axios.post(
            `${base_url}/SIGNIX/B2B/Hotel/DetailWithPrice`,
            payload
        );
        console.log("====> Response from getHotelDetails:", response.data);
        return res.status(200).json(response.data);
    } catch (err) {
        console.error("Error fetching hotel details:", err.message);
        return res.status(500).json({ error: err.message });
    }
};


// get hotel pics
exports.getHotelImages = async (req, res) => {

    const { HotelProviderSearchId } = req.body;
    console.log('Hotels provider id ', HotelProviderSearchId)

    try {
        const response = await axios.post(`${base_url}/SIGNIX/B2B/Hotel/Media`, {
            HotelProviderSearchId,
            "Credential": credentials
        });
        console.log("====> Response from the get hotels pics are: ", response.data);
        res.status(200).json(response.data);

    } catch (error) {
        console.log("Error came while fetching the hotel pics ", error.message);
        res.status(500).json({ "error": error.message });

    }

}