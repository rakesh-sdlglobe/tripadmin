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
const credentials = {
  Type: "C",
  Module: "X",
  Domain: process.env.DOMAIN,
  LoginID: process.env.LOGIN_ID,
  Password: process.env.PASSWORD,
  LanguageLocale: process.env.LANGUAGE,
  IpAddress: "8.8.8.8",
};

const logAxiosError = (context, error) => {
  const errorInfo = {
    message: error.message,
    status: error.response?.status,
    data: error.response?.data,
    headers: error.response?.headers,
    url: error.config?.url,
    method: error.config?.method,
  };
  console.error(`[Flights] ${context} failed`, errorInfo);
  return errorInfo;
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
    const errorInfo = logAxiosError("getFlightsAirports", error);
    res.status(500).json({
      error: "Flight airport lookup failed",
      details: {
        message: errorInfo.message,
        status: errorInfo.status,
        data: errorInfo.data,
      },
    });
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
    if (error.response?.status === 401 || error.response?.status === 403) {
      const message =
        error.response?.data?.Message ||
        error.response?.data?.message ||
        error.response?.data;
      console.error("[Flights] getFlightsList unauthorized", message);
      return res.status(500).json({
        error:
          "Flight search failed: Credential/IP not accepted by Trateq. Confirm sandbox credentials and whitelist settings.",
        details: message,
      });
    }
    if (error.response?.status === 404) {
      console.error("[Flights] getFlightsList returned 404", error.response.data);
      return res.status(500).json({
        error: "Flight search failed: Trateq returned 404",
        details: error.response.data,
      });
    }
    const errorInfo = logAxiosError("getFlightsList", error);
    res.status(500).json({
      error: "Flight search failed",
      details: {
        message: errorInfo.message,
        status: errorInfo.status,
        data: errorInfo.data,
      },
    });
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
    const errorInfo = logAxiosError("getFlightFareRule", error);
    res.status(500).json({
      error: "Flight fare rule fetch failed",
      details: {
        message: errorInfo.message,
        status: errorInfo.status,
        data: errorInfo.data,
      },
    });
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
    const errorInfo = logAxiosError("getFlightPriceValidate", error);
    res.status(500).json({
      error: "Flight price validation failed",
      details: {
        message: errorInfo.message,
        status: errorInfo.status,
        data: errorInfo.data,
      },
    });
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
    const errorInfo = logAxiosError("getFlightServiceTax", error);
    res.status(500).json({
      error: "Flight service tax lookup failed",
      details: {
        message: errorInfo.message,
        status: errorInfo.status,
        data: errorInfo.data,
      },
    });
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
    const errorInfo = logAxiosError("getFlightPreBook", error);
    res.status(500).json({
      error: "Flight pre-book failed",
      details: {
        message: errorInfo.message,
        status: errorInfo.status,
        data: errorInfo.data,
      },
    });
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
    const errorInfo = logAxiosError("getFlightBook", error);
    res.status(500).json({
      error: "Flight booking failed",
      details: {
        message: errorInfo.message,
        status: errorInfo.status,
        data: errorInfo.data,
      },
    });
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
    const errorInfo = logAxiosError("getFlightBookDetails", error);
    res.status(500).json({
      error: "Flight booking details fetch failed",
      details: {
        message: errorInfo.message,
        status: errorInfo.status,
        data: errorInfo.data,
      },
    });
  }
};

