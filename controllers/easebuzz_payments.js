const axios = require("axios");
const crypto = require("crypto");
require("dotenv").config();

exports.easebuzzPayment = async (req, res) => {
  try {
    const { txnid, amount, productinfo, firstname, phone, email, surl, furl } = req.body;

    // ✅ Validate required fields
    if (!txnid || !amount || !productinfo || !firstname || !email || !phone) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const key = process.env.EASEBUZZ_KEY?.trim();
    const salt = process.env.EASEBUZZ_SALT?.trim();
    
    // ✅ Validate environment variables
    if (!key || !salt) {
      return res.status(500).json({ 
        success: false,
        error: "Easebuzz credentials not configured. Please check EASEBUZZ_KEY and EASEBUZZ_SALT environment variables." 
      });
    }

    // ✅ Convert to 2 decimal points
    const formattedAmount = parseFloat(amount).toFixed(2);

    // ✅ Hash string (no extra spaces)
    const hashString = `${key}|${txnid}|${formattedAmount}|${productinfo}|${firstname}|${email}|||||||||||${salt}`;
    const hash = crypto.createHash("sha512").update(hashString).digest("hex");

    // ✅ Create form data
    const formData = new URLSearchParams({
      key,
      txnid,
      amount: formattedAmount,
      productinfo,
      firstname,
      phone,
      email,
      surl,
      furl,
      hash,
    });

    // ✅ POST to Easebuzz payment API
    const response = await axios.post(
      "https://testpay.easebuzz.in/payment/initiateLink",
      formData,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
      }
    );

    console.log("💳 Easebuzz Response:", response.data);

    res.status(200).json({
      success: true,
      message: "Payment initiated successfully",
      data: response.data,
    });
  } catch (error) {
    console.error("❌ Easebuzz Error:", error.message);
    res.status(500).json({
      success: false,
      error: "Payment initiation failed",
      details: error.message,
    });
  }
};

/**
 * Handle Easebuzz Payment Callback
 * Similar to Razorpay handler but for redirect-based flow
 * Handles both POST and GET requests from Easebuzz
 */
exports.easebuzzPaymentCallback = async (req, res) => {
  try {
    console.log("💳 Easebuzz Payment Callback Received:", {
      method: req.method,
      url: req.url,
      originalUrl: req.originalUrl,
      path: req.path,
      body: req.body,
      query: req.query,
      headers: {
        origin: req.headers.origin,
        referer: req.headers.referer
      }
    });

    // Easebuzz sends payment status in POST body or query params
    const paymentData = req.body || {};
    const queryStatus = req.query.status; // From URL parameter we set
    const txnid = paymentData.txnid || req.query.txnid || '';

    // Determine if payment was successful
    // Check URL query parameter first (we set status=success/failure in the URL)
    const statusFromQuery = queryStatus || req.query.status;
    
    // Check POST body fields (Easebuzz might send status in body)
    const statusFromBody = paymentData.status || paymentData.payment_status || paymentData.Status || 
                          paymentData.statuscode || paymentData.statusCode || 
                          paymentData.status_code || paymentData.StatusCode ||
                          paymentData.result || paymentData.Result;
    
    // Check if URL contains 'success' (from our configured success URL)
    const urlContainsSuccess = req.url?.includes('status=success') || 
                               req.originalUrl?.includes('status=success');
    
    const status = statusFromQuery || statusFromBody || '';
    
    console.log("📊 Status Analysis:", {
      queryStatus: statusFromQuery,
      bodyStatus: statusFromBody,
      urlContainsSuccess,
      finalStatus: status,
      txnid: txnid
    });

    // Consider it success if:
    // 1. Query has status=success (we set this in success URL)
    // 2. URL contains status=success
    // 3. Status is 'success', 'SUCCESS', 'Success'
    // 4. Status code is '1' or 1
    const isSuccess = 
      urlContainsSuccess ||
      statusFromQuery === 'success' ||
      status === 'success' || 
      status === 'SUCCESS' || 
      status === 'Success' ||
      status === '1' ||
      status === 1 ||
      paymentData.statuscode === '1' ||
      paymentData.statusCode === '1' ||
      paymentData.status_code === '1' ||
      paymentData.result === 'success';

    // Get frontend URL from environment or default to localhost
    const frontendUrl = process.env.FRONTEND_URL;
    
    // Redirect to React route with transaction ID (similar to Razorpay handler redirect)
    if (isSuccess) {
      console.log("✅ Payment successful, redirecting to:", `${frontendUrl}/bus-payment-success?txnid=${txnid}`);
      return res.redirect(`${frontendUrl}/bus-payment-success?txnid=${txnid}`);
    } else {
      console.log("❌ Payment failed or status unclear, redirecting to:", `${frontendUrl}/bus-payment-failure?txnid=${txnid}`);
      console.log("   Status values:", { statusFromQuery, statusFromBody, finalStatus: status });
      return res.redirect(`${frontendUrl}/bus-payment-failure?txnid=${txnid}`);
    }
  } catch (error) {
    console.error("❌ Easebuzz Callback Error:", error.message);
    console.error("   Error Stack:", error.stack);
    console.error("   Request Details:", {
      method: req.method,
      url: req.url,
      body: req.body,
      query: req.query
    });
    
    const frontendUrl = process.env.FRONTEND_URL ;
    const txnid = req.body?.txnid || req.query?.txnid || '';
    
    try {
      return res.redirect(`${frontendUrl}/bus-payment-failure?txnid=${txnid}`);
    } catch (redirectError) {
      console.error("❌ Failed to redirect:", redirectError.message);
      return res.status(500).json({ 
        error: 'Payment callback error', 
        message: error.message,
        txnid: txnid
      });
    }
  }
};

/**
 * Retrieve Transaction Details from Easebuzz
 * API: https://testdashboard.easebuzz.in/transaction/v2.1/retrieve
 * Based on official Easebuzz pattern
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing txnid
 * @param {string} req.body.txnid - Transaction ID to retrieve
 * @param {Object} res - Express response object
 */
exports.getTransactionDetails = async (req, res) => {
  const data = req.body;
  const config = {
    key: process.env.EASEBUZZ_KEY?.trim(),
    salt: process.env.EASEBUZZ_SALT?.trim()
  };

  console.log('🔄 Transaction lookup for:', data.txnid);

  // ✅ Only validate txnid (Transaction API v2.1 only needs txnid)
  if (!data.txnid || !data.txnid.trim()) {
    return res.json({
      "status": 0,
      "data": "Transaction ID is required"
    });
  }

  // ✅ Validate environment variables
  if (!config.key || !config.salt) {
    return res.json({
      "status": 0,
      "data": "Easebuzz credentials not configured. Please check EASEBUZZ_KEY and EASEBUZZ_SALT environment variables."
    });
  }

  try {
    // ✅ Generate hash for Transaction API v2.1: key|txnid|salt
    const hashstring = config.key + "|" + data.txnid + "|" + config.salt;
    console.log('🔐 Transaction Hash String:', hashstring);
    
    const hash_key = crypto.createHash("sha512").update(hashstring).digest("hex");
    console.log('🔐 Generated Transaction Hash:', hash_key);

    // ✅ Create form data (matching official pattern)
    const form = {
      'key': config.key,
      'txnid': data.txnid,
      'hash': hash_key,
    };

    console.log('📤 Transaction Request Data:', {
      txnid: form.txnid,
      hash: form.hash.substring(0, 20) + '...'
    });

    // ✅ Determine API endpoint based on environment
    const isProduction = process.env.EASEBUZZ_ENV === 'production';
    const call_url = isProduction 
      ? "https://dashboard.easebuzz.in/transaction/v2.1/retrieve"
      : "https://testdashboard.easebuzz.in/transaction/v2.1/retrieve";

    console.log('🌐 Calling:', call_url);

    // ✅ Make the API call (using axios but matching official pattern)
    const formData = new URLSearchParams(form);
    
    const response = await axios.post(
      call_url,
      formData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json'
        }
      }
    );

    if (response && response.data) {
      console.log('✅ Easebuzz Response:', response.data);
      // ✅ Return the response directly from Easebuzz (matching official pattern)
      return res.json(response.data);
    } else {
      console.error('❌ No response received');
      return res.json({
        "status": 0,
        "data": "No response received from Easebuzz"
      });
    }
  } catch (error) {
    console.error('❌ API Call Error:', error.message);
    console.error('   Error Details:', error.response?.data || error.message);
    
    // ✅ Return error in Easebuzz format (matching official pattern)
    return res.json({
      "status": 0,
      "data": "API Call Error: " + (error.response?.data?.error || error.message)
    });
  }
};

/**
 * Initiate Refund for Easebuzz Transaction (V2 API)
 * API: https://testdashboard.easebuzz.in/transaction/v2/refund
 * Based on official Easebuzz V2 pattern
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing refund details
 * @param {string} req.body.easebuzz_id - Easebuzz transaction ID (required)
 * @param {string} req.body.merchant_refund_id - Unique merchant refund ID (required)
 * @param {number} req.body.refund_amount - Amount to refund (required, must be float)
 * @param {string} req.body.udf1-udf7 - User Defined Fields (optional)
 * @param {object} req.body.split_labels - Split payment labels (optional, required if split payments enabled)
 * @param {Object} res - Express response object
 */
exports.initiateRefund = async (req, res) => {
  const data = req.body;
  const config = {
    key: process.env.EASEBUZZ_KEY?.trim(),
    salt: process.env.EASEBUZZ_SALT?.trim(),
    env: process.env.EASEBUZZ_ENV || 'test'
  };

  // ✅ Auto-generate merchant_refund_id if not provided
  if (!data.merchant_refund_id || !data.merchant_refund_id.trim()) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    // Format: REFUND_{timestamp}_{random} or REFUND_{easebuzz_id}_{timestamp} if easebuzz_id available
    if (data.easebuzz_id) {
      data.merchant_refund_id = `REFUND_${data.easebuzz_id}_${timestamp}_${random}`;
    } else {
      data.merchant_refund_id = `REFUND_${timestamp}_${random}`;
    }
    console.log('🔑 Auto-generated merchant_refund_id:', data.merchant_refund_id);
  }

  console.log('💸 Initiating refund V2 for:', {
    easebuzz_id: data.easebuzz_id,
    merchant_refund_id: data.merchant_refund_id,
    refund_amount: data.refund_amount
  });

  // ✅ Validate config
  if (!config.key || !config.salt) {
    console.error('❌ Missing Easebuzz configuration');
    return res.json({
      "status": false,
      "message": "Payment gateway configuration error"
    });
  }

  // ✅ Validate required fields
  const errors = [];
  
  if (!data.easebuzz_id || !data.easebuzz_id.trim()) {
    errors.push("easebuzz_id is required");
  }

  if (!data.refund_amount || data.refund_amount <= 0) {
    errors.push("refund_amount is required and must be greater than 0");
  }

  // Validate easebuzz_id format (alphanumeric)
  if (data.easebuzz_id && !/^[a-zA-Z0-9]*$/.test(data.easebuzz_id)) {
    errors.push("easebuzz_id must contain only alphanumeric characters");
  }

  // Validate merchant_refund_id format (alphanumeric, underscore, hyphen)
  if (data.merchant_refund_id && !/^[a-zA-Z0-9_-]*$/.test(data.merchant_refund_id)) {
    errors.push("merchant_refund_id must contain only alphanumeric characters, underscore, or hyphen");
  }

  if (errors.length > 0) {
    return res.json({
      "status": false,
      "message": errors.join(", ")
    });
  }

  try {
    // ✅ Convert refund_amount to float (as per Easebuzz requirement)
    const refundAmount = parseFloat(data.refund_amount);

    // ✅ Generate hash: key|merchant_refund_id|easebuzz_id|refund_amount|salt
    const hashstring = config.key + "|" + data.merchant_refund_id + "|" + data.easebuzz_id + "|" + refundAmount + "|" + config.salt;
    console.log('🔐 Refund V2 Hash String:', hashstring);
    
    const hash_key = crypto.createHash("sha512").update(hashstring).digest("hex");
    console.log('🔐 Generated Refund V2 Hash:', hash_key);

    // ✅ Build request payload
    const payload = {
      key: config.key,
      merchant_refund_id: data.merchant_refund_id,
      easebuzz_id: data.easebuzz_id,
      refund_amount: refundAmount,
      hash: hash_key
    };

    // ✅ Add optional UDF fields if provided
    if (data.udf1) payload.udf1 = data.udf1;
    if (data.udf2) payload.udf2 = data.udf2;
    if (data.udf3) payload.udf3 = data.udf3;
    if (data.udf4) payload.udf4 = data.udf4;
    if (data.udf5) payload.udf5 = data.udf5;
    if (data.udf6) payload.udf6 = data.udf6;
    if (data.udf7) payload.udf7 = data.udf7;

    // ✅ Add split_labels if provided (required if split payments enabled)
    if (data.split_labels && typeof data.split_labels === 'object') {
      payload.split_labels = data.split_labels;
    }

    console.log('📤 Refund V2 Request Data:', {
      merchant_refund_id: payload.merchant_refund_id,
      easebuzz_id: payload.easebuzz_id,
      refund_amount: payload.refund_amount,
      hash: payload.hash.substring(0, 20) + '...',
      has_split_labels: !!payload.split_labels
    });

    // ✅ Determine API endpoint based on environment
    const isProduction = config.env === 'production';
    const call_url = isProduction 
      ? 'https://dashboard.easebuzz.in/transaction/v2/refund'
      : 'https://testdashboard.easebuzz.in/transaction/v2/refund';

    console.log('🌐 Calling Refund V2 API:', call_url);

    // ✅ Make API call (Note: Content-Type is application/json)
    const response = await axios.post(
      call_url,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        }
      }
    );

    if (response && response.data) {
      console.log('✅ Refund V2 API Response:', response.data);
      
      // ✅ Return the response directly from Easebuzz (matching official pattern)
      return res.json(response.data);
    } else {
      console.error('❌ No response received from Refund V2 API');
      return res.json({
        "status": false,
        "message": "No response received from Easebuzz"
      });
    }
  } catch (error) {
    console.error('❌ Error calling Refund V2 API:', error.message);
    console.error('   Error Details:', error.response?.data || error.message);
    
    // ✅ Return error in Easebuzz format
    return res.json({
      "status": false,
      "message": "Error processing refund: " + (error.response?.data?.message || error.response?.data?.error || error.message || 'Unknown error')
    });
  }
};