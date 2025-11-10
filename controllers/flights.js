const connection = require("../utils/database");
const moment = require("moment");
const { default: axios } = require("axios");
const { response } = require("express");
const express = require("express");

const base_url = "https://sandboxentityapi.trateq.com";
const credentials = {
  Type: "C",
  Module: "X",
  Domain: process.env.DOMAIN,
  LoginID: process.env.LOGIN_ID,
  Password: process.env.PASSWORD,
  LanguageLocale: process.env.LANGUAGE,
  IpAddress: "8.8.8.8",
};

// exports.getFlightsAirports = async (req, res) => {
//   const { input } = req.body;
//   try {
//     const response = await axios.post(`${base_url}/SIGNIX/B2B/StaticData/AC`, {
//       Credential: credentials,
//       AcType: "AIRPORT",
//       SearchText: input || "",
//       AllData: input ? true : false,
//     });
//     console.log("Response from flight airports API:", response.data);
//     if (!response.data || response.data.length === 0) {
//       return res.status(404).json({ error: "No airports found" });
//     }
//     res.status(200).json(response.data);
//   } catch (error) {
//     console.error("Error fetching airport:", error.message);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };



exports.getFlightsAirports = async (req, res) => {
  const { input } = req.body;
  
  try {
    const response = await axios.post(`${base_url}/SIGNIX/B2B/StaticData/AC`, {
      Credential: credentials,
    console.log('🚀 Making Trateq API request from Vercel...', {
      domain: process.env.DOMAIN,
      loginId: process.env.LOGIN_ID,
      hasPassword: !!process.env.PASSWORD,
      environment: process.env.NODE_ENV
    });

    const response = await axios.post('https://sandboxentityapi.trateq.com/SIGNIX/B2B/StaticData/AC', {
      Credential: {
        Type: "C",
        Module: "X",
        Domain: process.env.DOMAIN,
        LoginID: process.env.LOGIN_ID,
        Password: process.env.PASSWORD,
        LanguageLocale: process.env.LANGUAGE || "en",
        IpAddress: "8.8.8.8",
      },
      AcType: "AIRPORT",
      SearchText: input || "",
      AllData: input ? true : false,
    }, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'TripAdmin/1.0'
      }
    });
    console.log("Response from flight airports API:", response.data);
    if (!response.data || response.data.length === 0) {
      return res.status(404).json({ error: "No airports found" });
    }
    
    console.log('✅ Trateq API Success - Status:', response.status);
    res.status(200).json(response.data);
    
  } catch (error) {
    console.error("Error fetching airport:", error.message);
    res.status(500).json({ error: "Internal server error" });
    // Enhanced error logging that will show in Vercel logs
    console.error('🔴 TRATEQ API FAILED - FULL ERROR DETAILS:');
    console.error('Error Message:', error.message);
    console.error('Error Code:', error.code);
    console.error('Stack:', error.stack);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('🔴 RESPONSE ERROR:');
      console.error('Status:', error.response.status);
      console.error('Status Text:', error.response.statusText);
      console.error('Headers:', JSON.stringify(error.response.headers));
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
      console.error('URL:', error.config?.url);
      
      res.status(error.response.status).json({
        error: "Trateq API Error",
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
      
    } else if (error.request) {
      // The request was made but no response was received
      console.error('🔴 NO RESPONSE ERROR:');
      console.error('Request:', error.request);
      console.error('Config:', error.config);
      
      res.status(503).json({
        error: "Trateq API Unavailable",
        details: "No response received from Trateq API"
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('🔴 SETUP ERROR:');
      console.error('Config:', error.config);
      
      res.status(500).json({
        error: "Internal Server Error", 
        details: error.message
      });
    }
  }
};



exports.getFlightsList = async (req, res) => {
  const Request = req.body;
  console.log("this request", Request);

  Request.Credential = credentials;
  try {
    const response = await axios.post(
      `${base_url}/SIGNIX/B2B/Flight/Search`,
      Request
    );
    console.log("this response ", response.data);

    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getFlightFareRule = async (req, res) => {
  const Request = req.body;
  console.log("this request", Request);

  Request.Credential = credentials;
  try {
    const response = await axios.post(
      `${base_url}/SIGNIX/B2B/Flight/FareRule`,
      Request
    );
    console.log("this /SIGNIX/B2B/Flight/FareRule ", response.data);

    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getFlightPriceValidate = async (req, res) => {
  const Request = req.body;
  console.log("this request", Request);

  Request.Credential = credentials;
  try {
    const response = await axios.post(
      `${base_url}/SIGNIX/B2B/PriceValidation`,
      Request
    );
    console.log("this /SIGNIX/B2B/PriceValidation ", response.data);

    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getFlightServiceTax = async (req, res) => {
  const Request = req.body;
  console.log("this request", Request);

  Request.Credential = credentials;
  try {
    const response = await axios.post(
      `${base_url}/SIGNIX/B2B/ServiceTax`,
      Request
    );
    console.log("this /SIGNIX/B2B/ServiceTax ", response.data);

    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getFlightPreBook = async (req, res) => {
  const Request = req.body;
  console.log("this request", Request);

  Request.Credential = credentials;
  try {
    const response = await axios.post(
      `${base_url}/SIGNIX/B2B/PreBook`,
      Request
    );
    console.log("this /SIGNIX/B2B/PreBook ", response.data);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getFlightBook = async (req, res) => {
  const Request = req.body;
  console.log("this request", Request);
  Request.Credential = credentials;
  try {
    const response = await axios.post(
      `${base_url}/SIGNIX/B2B/BookComplete`,
      Request
    );
    console.log("this /SIGNIX/B2B/BookComplete ", response.data);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getFlightBookDetails = async (req, res) => {
  const Request = req.body;
  console.log("this request", Request); 
  Request.Credential = credentials;
  try {
    const response = await axios.post(
      `${base_url}/SIGNIX/B2B/BookingDetails`,
      Request
    );
    console.log("this /SIGNIX/B2B/BookingDetails ", response.data);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

