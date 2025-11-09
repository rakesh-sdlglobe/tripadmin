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

// ❌ REMOVE THIS - Don't create credentials here
// const credentials = {
//   Type: "C",
//   Module: "X",
//   Domain: process.env.DOMAIN,
//   LoginID: process.env.LOGIN_ID,
//   Password: process.env.PASSWORD,
//   LanguageLocale: process.env.LANGUAGE,
//   IpAddress: "8.8.8.8",
// };

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

exports.getFlightsAirports = async (req, res) => {
  const { input } = req.body;
  try {
    const credentials = createCredentials(); // ← Create inside function
    
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
  const Request = req.body;
  console.log("this request", Request);

  Request.Credential = createCredentials(); // ← Create inside function
  try {
    const response = await axios.post(
      `${base_url}/SIGNIX/B2B/Flight/Search`,
      Request
    );
    console.log("this response ", response.data);

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Flight search error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.getFlightFareRule = async (req, res) => {
  const Request = req.body;
  console.log("this request", Request);

  Request.Credential = createCredentials(); // ← Create inside function
  try {
    const response = await axios.post(
      `${base_url}/SIGNIX/B2B/Flight/FareRule`,
      Request
    );
    console.log("this /SIGNIX/B2B/Flight/FareRule ", response.data);

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Fare rule error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// Update ALL other functions the same way...
exports.getFlightPriceValidate = async (req, res) => {
  const Request = req.body;
  console.log("this request", Request);

  Request.Credential = createCredentials(); // ← Create inside function
  try {
    const response = await axios.post(
      `${base_url}/SIGNIX/B2B/PriceValidation`,
      Request
    );
    console.log("this /SIGNIX/B2B/PriceValidation ", response.data);

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Price validation error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.getFlightServiceTax = async (req, res) => {
  const Request = req.body;
  console.log("this request", Request);

  Request.Credential = createCredentials(); // ← Create inside function
  try {
    const response = await axios.post(
      `${base_url}/SIGNIX/B2B/ServiceTax`,
      Request
    );
    console.log("this /SIGNIX/B2B/ServiceTax ", response.data);

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Service tax error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.getFlightPreBook = async (req, res) => {
  const Request = req.body;
  console.log("this request", Request);

  Request.Credential = createCredentials(); // ← Create inside function
  try {
    const response = await axios.post(
      `${base_url}/SIGNIX/B2B/PreBook`,
      Request
    );
    console.log("this /SIGNIX/B2B/PreBook ", response.data);
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Pre-book error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.getFlightBook = async (req, res) => {
  const Request = req.body;
  console.log("this request", Request);
  Request.Credential = createCredentials(); // ← Create inside function
  try {
    const response = await axios.post(
      `${base_url}/SIGNIX/B2B/BookComplete`,
      Request
    );
    console.log("this /SIGNIX/B2B/BookComplete ", response.data);
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Book error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.getFlightBookDetails = async (req, res) => {
  const Request = req.body;
  console.log("this request", Request);
  Request.Credential = createCredentials(); // ← Create inside function
  try {
    const response = await axios.post(
      `${base_url}/SIGNIX/B2B/BookingDetails`,
      Request
    );
    console.log("this /SIGNIX/B2B/BookingDetails ", response.data);
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Booking details error:", error.message);
    res.status(500).json({ error: error.message });
  }
};



