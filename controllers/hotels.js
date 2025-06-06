const connection = require('../utils/database');
const moment = require('moment');
const { default: axios } = require('axios');
const { response } = require('express');

const base_url = 'https://sandboxentityapi.trateq.com/';
const credentials =  {
    "Type": "C",
    "Module": "X",
    "Domain": "SDB",
    "LoginID": "INDSNI00",
    "Password": "Mallik@123",
    "LanguageLocale": "en-US",
    "IpAddress": "8.8.8.8"
}

exports.getHotelCities = async (req, res) => {

    const { input } = req.body;
    try {
        const response = await axios.post(`${base_url}/SIGNIX/B2B/StaticData/AC`, {
            "Credential": credentials,  
            "AcType": input ? "CityHotel" : "City", 
            "SearchText":input || "",
            "AllData": input ? true : false,
        });

        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error fetching hotel cities:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getHotels = async (req, res) => {
    const { cityId, checkInDate, checkOutDate, Rooms } = req.body;

    try {
        const response = await axios.post(`${base_url}/SIGNIX/B2B/Hotel/CacheSearch`, {
            "Credential": credentials,
            "CityId": cityId,
            "CheckInDate": moment(checkInDate).format('YYYY-MM-DD'),
            "CheckOutDate": moment(checkOutDate).format('YYYY-MM-DD'),
            "Rooms": Rooms
        });

        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error fetching hotels:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
}
    