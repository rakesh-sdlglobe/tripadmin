const connection = require("../utils/database");
const moment = require("moment");
const { default: axios } = require("axios");
const { response } = require("express");
const express = require("express");

const base_url = "https://sandboxentityapi.trateq.com/";
const credentials = {
  Type: "C",
  Module: "X",
  Domain: process.env.DOMAIN,
  LoginID: process.env.LOGIN_ID,
  Password: process.env.PASSWORD,
  LanguageLocale: process.env.LANGUAGE,
  IpAddress: "8.8.8.8",
};

exports.getFlightsAirports = async (req, res) => {
  const { input } = req.body;
  try {
    const response = await axios.post(`${base_url}/SIGNIX/B2B/StaticData/AC`, {
      Credential: credentials,
      AcType: "AIRPORT",
      SearchText: input || "",
      AllData: input ? true : false,
    });
    console.log("Response from flight airports API:", response.data);
    if (!response.data || response.data.length === 0) {
        return res.status(404).json({ error: "No airports found" });
    }
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error fetching airport:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
exports.getFlightsList = async (req, res) => {
  console.log("Request body:", req.body);
  try {
    const {
      FromAirport,
      ToAirport,
      DepartDate,
      ReturnDate,
      Adults = 1,
      Infants = 0,
      Children = 0,
      Youth = 0,
      Class = 'E',
      FlightType = 'O', // Default to One-way
      Currency = 'INR',
      PageNo = 1,
      PageSize = 10,
      TravellerNationality = 'IN',
      ServiceTypeCode = 'F',
      FlightSegments
    } = req.body;
 
    // Validate common required fields
    if (!FromAirport || !ToAirport || !DepartDate) {
      return res.status(400).json({ error: 'Missing required fields: FromAirport, ToAirport, and DepartDate are required' });
    }
 
    // Validate FlightType
    if (!['O', 'R', 'M'].includes(FlightType)) {
      return res.status(400).json({ error: 'Invalid FlightType. Must be O (One-way), R (Round-trip), or M (Multi-city)' });
    }
 
    // Validate ReturnDate for Round-trip
    if (FlightType === 'R' && !ReturnDate) {
      return res.status(400).json({ error: 'ReturnDate is required for Round-trip flights' });
    }
 
    // Validate FlightSegments for Multi-city
    if (FlightType === 'M') {
      if (!Array.isArray(FlightSegments) || FlightSegments.length < 2) {
        return res.status(400).json({ error: 'FlightSegments array with at least 2 segments is required for Multi-city flights' });
      }
     
      // Validate each segment
      for (const [index, segment] of FlightSegments.entries()) {
        if (!segment.FromAirport || !segment.ToAirport || !segment.DepartDate) {
          return res.status(400).json({
            error: `Segment ${index + 1} is missing required fields: FromAirport, ToAirport, and DepartDate are required`
          });
        }
      }
    }
 
    // Construct request body based on flight type
    const requestBody = {
      Credential: credentials,
      SessionID: null,
      FromAirport,
      ToAirport,
      Class,
      DepartDate,
      ReturnDate: FlightType === 'R' ? ReturnDate : null,
      Adults,
      Infants,
      Children,
      Youth,
      TravellerNationality,
      SearchKey: null,
      ServiceTypeCode,
      Currency,
      PageNo,
      PageSize,
      Filter: null,
      SortCriteria: null,
      FlightType,
      FlightSegments: FlightType === 'M' ? FlightSegments : null
    };
 
    const response = await axios.post(
      `${base_url}/SIGNIX/B2B/Flight/Search`,
      requestBody
    );
   
    res.status(200).json(response.data);
    console.log("Response from flight search API:", response.data);
  } catch (error) {
    console.error('Flight search error:', error.response?.data || error.message);
   
    // Provide more specific error messages based on the error type
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      res.status(error.response.status).json({
        error: 'Flight search failed',
        details: error.response.data || error.message
      });
    } else if (error.request) {
      // The request was made but no response was received
      res.status(503).json({
        error: 'No response from flight search service',
        details: 'The server is currently unavailable. Please try again later.'
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      res.status(500).json({
        error: 'Failed to process flight search request',
        details: error.message
      });
    }
  }
};
 
exports.getFlightsListmobile = async (req, res) => {
  console.log("Request body:", req.body);
  try {
    const {
      FromAirport,
      ToAirport,
      DepartDate,
      ReturnDate,
      Adults = 1,
      Infants = 0,
      Children = 0,
      Youth = 0,
      Class = 'E',
      FlightType = 'O', // Default to One-way
      Currency = 'INR',
      PageNo = 1,
      PageSize = 10,
      TravellerNationality = 'IN',
      ServiceTypeCode = 'F',
      FlightSegments
    } = req.body;
 
    // Validate common required fields
    if (!FromAirport || !ToAirport || !DepartDate) {
      return res.status(400).json({ error: 'Missing required fields: FromAirport, ToAirport, and DepartDate are required' });
    }
 
    // Validate FlightType
    if (!['O', 'R', 'M'].includes(FlightType)) {
      return res.status(400).json({ error: 'Invalid FlightType. Must be O (One-way), R (Round-trip), or M (Multi-city)' });
    }
 
    // Validate ReturnDate for Round-trip
    if (FlightType === 'R' && !ReturnDate) {
      return res.status(400).json({ error: 'ReturnDate is required for Round-trip flights' });
    }
 
    // Validate FlightSegments for Multi-city
    if (FlightType === 'M') {
      if (!Array.isArray(FlightSegments) || FlightSegments.length < 2) {
        return res.status(400).json({ error: 'FlightSegments array with at least 2 segments is required for Multi-city flights' });
      }
     
      // Validate each segment
      for (const [index, segment] of FlightSegments.entries()) {
        if (!segment.FromAirport || !segment.ToAirport || !segment.DepartDate) {
          return res.status(400).json({
            error: `Segment ${index + 1} is missing required fields: FromAirport, ToAirport, and DepartDate are required`
          });
        }
      }
    }
 
    // Construct request body based on flight type
    const requestBody = {
      Credential: credentials,
      SessionID: null,
      FromAirport,
      ToAirport,
      Class,
      DepartDate,
      ReturnDate: FlightType === 'R' ? ReturnDate : null,
      Adults,
      Infants,
      Children,
      Youth,
      TravellerNationality,
      SearchKey: null,
      ServiceTypeCode,
      Currency,
      PageNo,
      PageSize,
      Filter: null,
      SortCriteria: null,
      FlightType,
      FlightSegments: FlightType === 'M' ? FlightSegments : null
    };
 
    const response = await axios.post(
      `${base_url}/SIGNIX/B2B/Flight/Search`,
      requestBody
    );
   
    res.status(200).json(response.data);
    console.log("Response from flight search API:", response.data);
  } catch (error) {
    console.error('Flight search error:', error.response?.data || error.message);
   
    // Provide more specific error messages based on the error type
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      res.status(error.response.status).json({
        error: 'Flight search failed',
        details: error.response.data || error.message
      });
    } else if (error.request) {
      // The request was made but no response was received
      res.status(503).json({
        error: 'No response from flight search service',
        details: 'The server is currently unavailable. Please try again later.'
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      res.status(500).json({
        error: 'Failed to process flight search request',
        details: error.message
      });
    }
  }
};
 
 

exports.getFlightsList = async (req, res) => {
  const Request = req.body;
  console.log("this request",Request);
  
  Request.Credential = credentials;
  try {
    const response = await axios.post(
      `${base_url}/SIGNIX/B2B/Flight/Search`,
      Request
    );
    console.log("this response ",response.data);
    
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.getFlightPriceValidate = async (req, res) => {
  const Request = req.body;
  console.log("this request",Request);
  
  Request.Credential = credentials;
  try {
    const response = await axios.post(
      `${base_url}/SIGNIX/B2B/PriceValidation`,
      Request
    );
    console.log("this /SIGNIX/B2B/PriceValidation ",response.data);
    
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
