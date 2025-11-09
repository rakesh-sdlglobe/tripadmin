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
const express = require("express");

const base_url = "https://sandboxentityapi.trateq.com";

const credentials = {
  Type: "C",
  Module: "X",
  Domain: process.env.DOMAIN,
  LoginID: process.env.LOGIN_ID,
  Password: process.env.PASSWORD,
  LanguageLocale: process.env.LANGUAGE || "en",
  IpAddress: "8.8.8.8",
};

// Common Axios Config
const axiosConfig = {
  timeout: 10000, // 10 seconds
  headers: {
    "Content-Type": "application/json",
    "User-Agent": "TripAdmin/1.0",
  },
};

// Helper function for Trateq POST calls
const trateqPost = async (url, payload) => {
  try {
    const response = await axios.post(url, payload, axiosConfig);
    return response.data;
  } catch (error) {
    console.error("🔴 Trateq API Error:", url);
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", JSON.stringify(error.response.data, null, 2));
      throw new Error(
        `Trateq API responded with ${error.response.status}: ${error.response.statusText}`
      );
    } else if (error.request) {
      console.error("No response received from Trateq API.");
      throw new Error("No response from Trateq API");
    } else {
      console.error("Request setup error:", error.message);
      throw new Error(error.message);
    }
  }
};

// ===================== 🛫 1. AIRPORTS =====================
exports.getFlightsAirports = async (req, res) => {
  const { input } = req.body;

  const payload = {
    Credential: credentials,
    AcType: "AIRPORT",
    SearchText: input || "",
    AllData: input ? true : false,
  };

  try {
    console.log("🌍 Fetching Airport Data...");
    const data = await trateqPost(`${base_url}/SIGNIX/B2B/StaticData/AC`, payload);

    if (!data || data.length === 0) {
      return res.status(404).json({ error: "No airports found" });
    }

    console.log("✅ Airports fetched successfully");
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching airport:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// ===================== 🛩️ 2. FLIGHT SEARCH =====================
exports.getFlightsList = async (req, res) => {
  const Request = { ...req.body, Credential: credentials };
  try {
    console.log("🔎 Searching flights...");
    const data = await trateqPost(`${base_url}/SIGNIX/B2B/Flight/Search`, Request);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===================== 🧾 3. FARE RULE =====================
exports.getFlightFareRule = async (req, res) => {
  const Request = { ...req.body, Credential: credentials };
  try {
    console.log("📜 Fetching fare rule...");
    const data = await trateqPost(`${base_url}/SIGNIX/B2B/Flight/FareRule`, Request);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===================== 💰 4. PRICE VALIDATION =====================
exports.getFlightPriceValidate = async (req, res) => {
  const Request = { ...req.body, Credential: credentials };
  try {
    console.log("💵 Validating price...");
    const data = await trateqPost(`${base_url}/SIGNIX/B2B/PriceValidation`, Request);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===================== 🧮 5. SERVICE TAX =====================
exports.getFlightServiceTax = async (req, res) => {
  const Request = { ...req.body, Credential: credentials };
  try {
    console.log("💸 Getting service tax...");
    const data = await trateqPost(`${base_url}/SIGNIX/B2B/ServiceTax`, Request);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===================== ⏳ 6. PRE-BOOK =====================
exports.getFlightPreBook = async (req, res) => {
  const Request = { ...req.body, Credential: credentials };
  try {
    console.log("🛒 Pre-booking flight...");
    const data = await trateqPost(`${base_url}/SIGNIX/B2B/PreBook`, Request);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===================== 📘 7. BOOK COMPLETE =====================
exports.getFlightBook = async (req, res) => {
  const Request = { ...req.body, Credential: credentials };
  try {
    console.log("🧾 Completing flight booking...");
    const data = await trateqPost(`${base_url}/SIGNIX/B2B/BookComplete`, Request);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===================== 📄 8. BOOKING DETAILS =====================
exports.getFlightBookDetails = async (req, res) => {
  const Request = { ...req.body, Credential: credentials };
  try {
    console.log("📋 Fetching booking details...");
    const data = await trateqPost(`${base_url}/SIGNIX/B2B/BookingDetails`, Request);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
