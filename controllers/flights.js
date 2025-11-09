// const connection = require("../utils/database");
// const moment = require("moment");
// const { default: axios } = require("axios");
// const { response } = require("express");
// const express = require("express");

// const base_url = "https://sandboxentityapi.trateq.com";
// const credentials = {
//   Type: "C",
//   Module: "X",
//   Domain: process.env.DOMAIN,
//   LoginID: process.env.LOGIN_ID,
//   Password: process.env.PASSWORD,
//   LanguageLocale: process.env.LANGUAGE,
//   IpAddress: "8.8.8.8",
// };

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



// exports.getFlightsList = async (req, res) => {
//   const Request = req.body;
//   console.log("this request", Request);

//   Request.Credential = credentials;
//   try {
//     const response = await axios.post(
//       `${base_url}/SIGNIX/B2B/Flight/Search`,
//       Request
//     );
//     console.log("this response ", response.data);

//     res.status(200).json(response.data);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// exports.getFlightFareRule = async (req, res) => {
//   const Request = req.body;
//   console.log("this request", Request);

//   Request.Credential = credentials;
//   try {
//     const response = await axios.post(
//       `${base_url}/SIGNIX/B2B/Flight/FareRule`,
//       Request
//     );
//     console.log("this /SIGNIX/B2B/Flight/FareRule ", response.data);

//     res.status(200).json(response.data);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// exports.getFlightPriceValidate = async (req, res) => {
//   const Request = req.body;
//   console.log("this request", Request);

//   Request.Credential = credentials;
//   try {
//     const response = await axios.post(
//       `${base_url}/SIGNIX/B2B/PriceValidation`,
//       Request
//     );
//     console.log("this /SIGNIX/B2B/PriceValidation ", response.data);

//     res.status(200).json(response.data);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// exports.getFlightServiceTax = async (req, res) => {
//   const Request = req.body;
//   console.log("this request", Request);

//   Request.Credential = credentials;
//   try {
//     const response = await axios.post(
//       `${base_url}/SIGNIX/B2B/ServiceTax`,
//       Request
//     );
//     console.log("this /SIGNIX/B2B/ServiceTax ", response.data);

//     res.status(200).json(response.data);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// exports.getFlightPreBook = async (req, res) => {
//   const Request = req.body;
//   console.log("this request", Request);

//   Request.Credential = credentials;
//   try {
//     const response = await axios.post(
//       `${base_url}/SIGNIX/B2B/PreBook`,
//       Request
//     );
//     console.log("this /SIGNIX/B2B/PreBook ", response.data);
//     res.status(200).json(response.data);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// exports.getFlightBook = async (req, res) => {
//   const Request = req.body;
//   console.log("this request", Request);
//   Request.Credential = credentials;
//   try {
//     const response = await axios.post(
//       `${base_url}/SIGNIX/B2B/BookComplete`,
//       Request
//     );
//     console.log("this /SIGNIX/B2B/BookComplete ", response.data);
//     res.status(200).json(response.data);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// exports.getFlightBookDetails = async (req, res) => {
//   const Request = req.body;
//   console.log("this request", Request); 
//   Request.Credential = credentials;
//   try {
//     const response = await axios.post(
//       `${base_url}/SIGNIX/B2B/BookingDetails`,
//       Request
//     );
//     console.log("this /SIGNIX/B2B/BookingDetails ", response.data);
//     res.status(200).json(response.data);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

const connection = require("../utils/database");
const moment = require("moment");
const { default: axios } = require("axios");
const { response } = require("express");
const express = require("express");

const base_url = "https://sandboxentityapi.trateq.com";

// Helper function to create credentials
function createCredentials() {
  return {
    Type: "C",
    Module: "X",
    Domain: process.env.DOMAIN,
    LoginID: process.env.LOGIN_ID,
    Password: process.env.PASSWORD,
    LanguageLocale: process.env.LANGUAGE || "en",
    IpAddress: "8.8.8.8",
  };
}

// Helper function for consistent error handling
function handleTrateqError(error, res) {
  console.error('🔴 TRATEQ API FAILED:');
  console.error('Error Message:', error.message);
  console.error('Error Code:', error.code);

  if (error.response) {
    console.error('Status:', error.response.status);
    console.error('Data:', JSON.stringify(error.response.data, null, 2));
    console.error('URL:', error.config?.url);

    res.status(error.response.status).json({
      error: "Trateq API Error",
      status: error.response.status,
      data: error.response.data
    });
  } else if (error.request) {
    console.error('No response received');
    res.status(503).json({
      error: "Trateq API Unavailable",
      details: "No response received from Trateq API"
    });
  } else {
    console.error('Setup error:', error.message);
    res.status(500).json({
      error: "Internal Server Error",
      details: error.message
    });
  }
}

exports.getFlightsList = async (req, res) => {
  const Request = req.body;
  
  try {
    console.log('🚀 Flight Search - Starting request...');
    console.log('📦 Request body:', JSON.stringify(Request, null, 2));
    
    // Create credentials with debug info
    const credentials = createCredentials();
    console.log('🔐 Credentials check:', {
      domain: credentials.Domain ? 'SET' : 'MISSING',
      loginId: credentials.LoginID ? 'SET' : 'MISSING',
      hasPassword: !!credentials.Password
    });

    Request.Credential = credentials;
    
    console.log('🌐 Making request to Trateq Flight Search...');
    console.log('URL:', `${base_url}/SIGNIX/B2B/Flight/Search`);
    
    const response = await axios.post(
      `${base_url}/SIGNIX/B2B/Flight/Search`,
      Request,
      {
        timeout: 15000, // Increased timeout
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'TripAdmin/1.0',
          'Accept': 'application/json'
        }
      }
    );
    
    console.log('✅ Flight Search Success - Status:', response.status);
    console.log('📊 Response data sample:', JSON.stringify(response.data).substring(0, 200) + '...');
    
    res.status(200).json(response.data);
    
  } catch (error) {
    console.error('🔴 FLIGHT SEARCH FAILED:');
    console.error('Error Message:', error.message);
    console.error('Error Code:', error.code);
    
    if (error.response) {
      // Trateq API responded with error
      console.error('📡 RESPONSE ERROR:');
      console.error('Status:', error.response.status);
      console.error('Status Text:', error.response.statusText);
      console.error('Headers:', error.response.headers);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
      console.error('URL:', error.config?.url);
      
      res.status(error.response.status).json({
        error: "Trateq Flight Search API Error",
        status: error.response.status,
        data: error.response.data
      });
      
    } else if (error.request) {
      // No response from Trateq API
      console.error('❌ NO RESPONSE FROM TRATEQ:');
      console.error('Request details:', {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data
      });
      console.error('This means Trateq API is not responding');
      
      res.status(503).json({
        error: "Trateq Flight Search API Unavailable",
        details: "The flight search service is not responding. Please try again later.",
        debug: {
          message: error.message,
          code: error.code
        }
      });
      
    } else {
      // Setup error
      console.error('⚙️ SETUP ERROR:');
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
  console.log("Flight search request:", Request);

  try {
    Request.Credential = createCredentials();
    
    const response = await axios.post(
      `${base_url}/SIGNIX/B2B/Flight/Search`,
      Request,
      {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'TripAdmin/1.0'
        }
      }
    );
    
    console.log("Flight search response:", response.data);
    res.status(200).json(response.data);
  } catch (error) {
    handleTrateqError(error, res);
  }
};

exports.getFlightFareRule = async (req, res) => {
  const Request = req.body;
  console.log("Fare rule request:", Request);

  try {
    Request.Credential = createCredentials();
    
    const response = await axios.post(
      `${base_url}/SIGNIX/B2B/Flight/FareRule`,
      Request,
      {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'TripAdmin/1.0'
        }
      }
    );
    
    console.log("Fare rule response:", response.data);
    res.status(200).json(response.data);
  } catch (error) {
    handleTrateqError(error, res);
  }
};

exports.getFlightPriceValidate = async (req, res) => {
  const Request = req.body;
  console.log("Price validation request:", Request);

  try {
    Request.Credential = createCredentials();
    
    const response = await axios.post(
      `${base_url}/SIGNIX/B2B/PriceValidation`,
      Request,
      {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'TripAdmin/1.0'
        }
      }
    );
    
    console.log("Price validation response:", response.data);
    res.status(200).json(response.data);
  } catch (error) {
    handleTrateqError(error, res);
  }
};

exports.getFlightServiceTax = async (req, res) => {
  const Request = req.body;
  console.log("Service tax request:", Request);

  try {
    Request.Credential = createCredentials();
    
    const response = await axios.post(
      `${base_url}/SIGNIX/B2B/ServiceTax`,
      Request,
      {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'TripAdmin/1.0'
        }
      }
    );
    
    console.log("Service tax response:", response.data);
    res.status(200).json(response.data);
  } catch (error) {
    handleTrateqError(error, res);
  }
};

exports.getFlightPreBook = async (req, res) => {
  const Request = req.body;
  console.log("Pre-book request:", Request);

  try {
    Request.Credential = createCredentials();
    
    const response = await axios.post(
      `${base_url}/SIGNIX/B2B/PreBook`,
      Request,
      {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'TripAdmin/1.0'
        }
      }
    );
    
    console.log("Pre-book response:", response.data);
    res.status(200).json(response.data);
  } catch (error) {
    handleTrateqError(error, res);
  }
};

exports.getFlightBook = async (req, res) => {
  const Request = req.body;
  console.log("Book request:", Request);

  try {
    Request.Credential = createCredentials();
    
    const response = await axios.post(
      `${base_url}/SIGNIX/B2B/BookComplete`,
      Request,
      {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'TripAdmin/1.0'
        }
      }
    );
    
    console.log("Book response:", response.data);
    res.status(200).json(response.data);
  } catch (error) {
    handleTrateqError(error, res);
  }
};

exports.getFlightBookDetails = async (req, res) => {
  const Request = req.body;
  console.log("Booking details request:", Request);

  try {
    Request.Credential = createCredentials();
    
    const response = await axios.post(
      `${base_url}/SIGNIX/B2B/BookingDetails`,
      Request,
      {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'TripAdmin/1.0'
        }
      }
    );
    
    console.log("Booking details response:", response.data);
    res.status(200).json(response.data);
  } catch (error) {
    handleTrateqError(error, res);
  }
};



