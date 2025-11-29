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

    // ✅ Determine payment URL based on environment
    const isProduction = process.env.EASEBUZZ_ENV === 'production';
    const paymentBaseUrl = isProduction 
      ? 'https://pay.easebuzz.in'
      : 'https://testpay.easebuzz.in';

    // ✅ POST to Easebuzz payment API
    const response = await axios.post(
      `${paymentBaseUrl}/payment/initiateLink`,
      formData,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
      }
    );

    console.log("💳 Easebuzz Response:", response.data);

    // ✅ Check if payment initiation was successful
    if (response && response.data && (response.data.status === 1 || response.data.status === '1')) {
      const accessKey = response.data.data;
      
      if (accessKey) {
        // ✅ Return payment URL for frontend to redirect (backend constructs the URL)
        const paymentUrl = `${paymentBaseUrl}/pay/${accessKey}`;
        console.log("✅ Payment URL generated:", paymentUrl);
        return res.status(200).json({
          success: true,
          message: "Payment initiated successfully",
          paymentUrl: paymentUrl, // Frontend will redirect to this URL
          data: response.data
        });
      } else {
        console.error("❌ No access key received from Easebuzz");
        return res.status(500).json({
          success: false,
          error: "Payment initiation failed: No access key received"
        });
      }
    } else {
      // ✅ Payment initiation failed
      const errorMsg = response?.data?.data || response?.data?.message || "Payment initiation failed";
      console.error("❌ Payment initiation failed:", errorMsg);
      return res.status(500).json({
        success: false,
        error: errorMsg
      });
    }
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
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    // Product type mapping - maps product types to their success/failure page routes
    const productRoutes = {
      'bus': {
        success: '/bus-payment-success',
        failure: '/bus-payment-failure'
      },
      'insurance': {
        success: '/insurance-payment-success',
        failure: '/insurance-payment-failure'
      },
      'hotel': {
        success: '/hotel-payment-success',
        failure: '/hotel-payment-failure'
      },
      'flight': {
        success: '/flight-payment-success',
        failure: '/flight-payment-failure'
      },
      'train': {
        success: '/train-payment-success',
        failure: '/train-payment-failure'
      },
      'cab': {
        success: '/cab-payment-success',
        failure: '/cab-payment-failure'
      },
      'cruise': {
        success: '/cruise-payment-success',
        failure: '/cruise-payment-failure'
      }
    };
    
    // Detect product type from query params or transaction ID prefix
    let paymentType = req.query.type || 'bus'; // Default to bus for backward compatibility
    
    // If type not in query, try to detect from transaction ID prefix
    if (!req.query.type && txnid) {
      const txnidUpper = txnid.toUpperCase();
      if (txnidUpper.startsWith('INS_')) {
        paymentType = 'insurance';
      } else if (txnidUpper.startsWith('BUS_')) {
        paymentType = 'bus';
      } else if (txnidUpper.startsWith('HTL_') || txnidUpper.startsWith('HOTEL_')) {
        paymentType = 'hotel';
      } else if (txnidUpper.startsWith('FLT_') || txnidUpper.startsWith('FLIGHT_')) {
        paymentType = 'flight';
      } else if (txnidUpper.startsWith('TRN_') || txnidUpper.startsWith('TRAIN_')) {
        paymentType = 'train';
      } else if (txnidUpper.startsWith('CAB_')) {
        paymentType = 'cab';
      } else if (txnidUpper.startsWith('CRS_') || txnidUpper.startsWith('CRUISE_')) {
        paymentType = 'cruise';
      }
    }
    
    // Get routes for the detected product type, fallback to bus if not found
    const routes = productRoutes[paymentType] || productRoutes['bus'];
    
    console.log("🔍 Payment Type Detection:", {
      typeFromQuery: req.query.type,
      txnidPrefix: txnid ? txnid.substring(0, 4) : 'N/A',
      detectedType: paymentType,
      routes: routes
    });
    
    // Redirect to React route with transaction ID (similar to Razorpay handler redirect)
    if (isSuccess) {
      const successUrl = `${frontendUrl}${routes.success}?txnid=${txnid}`;
      console.log(`✅ ${paymentType.charAt(0).toUpperCase() + paymentType.slice(1)} payment successful, redirecting to:`, successUrl);
      return res.redirect(successUrl);
    } else {
      const failureUrl = `${frontendUrl}${routes.failure}?txnid=${txnid}`;
      console.log(`❌ ${paymentType.charAt(0).toUpperCase() + paymentType.slice(1)} payment failed or status unclear, redirecting to:`, failureUrl);
      console.log("   Status values:", { statusFromQuery, statusFromBody, finalStatus: status });
      return res.redirect(failureUrl);
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
    
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const txnid = req.body?.txnid || req.query?.txnid || '';
    
    // Product type mapping (same as above)
    const productRoutes = {
      'bus': { failure: '/bus-payment-failure' },
      'insurance': { failure: '/insurance-payment-failure' },
      'hotel': { failure: '/hotel-payment-failure' },
      'flight': { failure: '/flight-payment-failure' },
      'train': { failure: '/train-payment-failure' },
      'cab': { failure: '/cab-payment-failure' },
      'cruise': { failure: '/cruise-payment-failure' }
    };
    
    // Detect product type
    let paymentType = req.query.type || 'bus';
    if (!req.query.type && txnid) {
      const txnidUpper = txnid.toUpperCase();
      if (txnidUpper.startsWith('INS_')) paymentType = 'insurance';
      else if (txnidUpper.startsWith('BUS_')) paymentType = 'bus';
      else if (txnidUpper.startsWith('HTL_') || txnidUpper.startsWith('HOTEL_')) paymentType = 'hotel';
      else if (txnidUpper.startsWith('FLT_') || txnidUpper.startsWith('FLIGHT_')) paymentType = 'flight';
      else if (txnidUpper.startsWith('TRN_') || txnidUpper.startsWith('TRAIN_')) paymentType = 'train';
      else if (txnidUpper.startsWith('CAB_')) paymentType = 'cab';
      else if (txnidUpper.startsWith('CRS_') || txnidUpper.startsWith('CRUISE_')) paymentType = 'cruise';
    }
    
    const routes = productRoutes[paymentType] || productRoutes['bus'];
    
    try {
      return res.redirect(`${frontendUrl}${routes.failure}?txnid=${txnid}`);
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



/**
 * Get Refund Status from Easebuzz
 * API: https://testdashboard.easebuzz.in/refund/v1/retrieve
 * Based on official Easebuzz Refund Status API documentation
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing refund details
 * @param {string} req.body.easebuzz_id - Easebuzz transaction ID (required)
 * @param {string} req.body.merchant_refund_id - Unique merchant refund ID (optional, for filtering)
 * @param {Object} res - Express response object
 */
exports.getRefundStatus = async (req, res) => {
  const data = req.body;
  const config = {
    key: process.env.EASEBUZZ_KEY?.trim(),
    salt: process.env.EASEBUZZ_SALT?.trim(),
    env: process.env.EASEBUZZ_ENV || 'test'
  };

  console.log('🔄 Refund status lookup for:', {
    easebuzz_id: data.easebuzz_id,
    merchant_refund_id: data.merchant_refund_id
  });

  // ✅ Validate config
  if (!config.key || !config.salt) {
    console.error('❌ Missing Easebuzz configuration');
    return res.json({
      "status": false,
      "message": "Easebuzz credentials not configured. Please check EASEBUZZ_KEY and EASEBUZZ_SALT environment variables."
    });
  }

  // ✅ Validate required fields
  if (!data.easebuzz_id || !data.easebuzz_id.trim()) {
    return res.json({
      "status": false,
      "message": "easebuzz_id is required"
    });
  }

  // ✅ Validate easebuzz_id format (alphanumeric)
  if (!/^[a-zA-Z0-9]*$/.test(data.easebuzz_id)) {
    return res.json({
      "status": false,
      "message": "easebuzz_id must contain only alphanumeric characters"
    });
  }

  // ✅ Validate merchant_refund_id format if provided (alphanumeric, underscore, hyphen)
  if (data.merchant_refund_id && !/^[a-zA-Z0-9_-]*$/.test(data.merchant_refund_id)) {
    return res.json({
      "status": false,
      "message": "merchant_refund_id must contain only alphanumeric characters, underscore, or hyphen"
    });
  }

  try {
    // ✅ Generate hash: key|easebuzz_id|salt
    const hashstring = config.key + "|" + data.easebuzz_id + "|" + config.salt;
    console.log('🔐 Refund Status Hash String:', hashstring);
    
    const hash_key = crypto.createHash("sha512").update(hashstring).digest("hex");
    console.log('🔐 Generated Refund Status Hash:', hash_key);

    // ✅ Build request payload
    const payload = {
      key: config.key,
      easebuzz_id: data.easebuzz_id,
      hash: hash_key
    };

    // ✅ Add optional merchant_refund_id if provided (for filtering)
    if (data.merchant_refund_id && data.merchant_refund_id.trim()) {
      payload.merchant_refund_id = data.merchant_refund_id.trim();
    }

    console.log('📤 Refund Status Request Data:', {
      easebuzz_id: payload.easebuzz_id,
      merchant_refund_id: payload.merchant_refund_id || 'not provided',
      hash: payload.hash.substring(0, 20) + '...'
    });

    // ✅ Determine API endpoint based on environment
    const isProduction = config.env === 'production';
    const call_url = isProduction 
      ? 'https://dashboard.easebuzz.in/refund/v1/retrieve'
      : 'https://testdashboard.easebuzz.in/refund/v1/retrieve';

    console.log('🌐 Calling Refund Status API:', call_url);

    // ✅ Make API call (Content-Type is application/json)
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
      console.log('✅ Refund Status API Response:', response.data);
      
      // ✅ Return the response directly from Easebuzz (matching official pattern)
      return res.json(response.data);
    } else {
      console.error('❌ No response received from Refund Status API');
      return res.json({
        "status": false,
        "message": "No response received from Easebuzz"
      });
    }
  } catch (error) {
    console.error('❌ Error calling Refund Status API:', error.message);
    console.error('   Error Details:', error.response?.data || error.message);
    
    // ✅ Return error in Easebuzz format
    return res.json({
      "status": false,
      "message": "Error retrieving refund status: " + (error.response?.data?.message || error.response?.data?.error || error.message || 'Unknown error')
    });
  }
};

/**
 * Get Transaction Details by Date from Easebuzz
 * API: https://testdashboard.easebuzz.in/transaction/v1/retrieve/date
 * Based on official Easebuzz Transaction API (by date) documentation
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing transaction date
 * @param {string} req.body.transaction_date - Transaction date in dd-mm-yyyy format (required)
 * @param {string} req.body.merchant_email - Registered email of the merchant (optional, uses env var if not provided)
 * @param {string} req.body.submerchant_id - Filter transactions by submerchant (optional)
 * @param {Object} res - Express response object
 */
exports.getTransactionsByDate = async (req, res) => {
  const data = req.body;
  const config = {
    key: process.env.EASEBUZZ_KEY?.trim(),
    salt: process.env.EASEBUZZ_SALT?.trim(),
    merchant_email: process.env.EASEBUZZ_MERCHANT_EMAIL?.trim() || data.merchant_email?.trim(),
    env: process.env.EASEBUZZ_ENV || 'test'
  };

  console.log('📅 Transaction lookup by date for:', data.transaction_date);

  // ✅ Validate environment variables
  if (!config.key || !config.salt) {
    console.error('❌ Missing Easebuzz configuration');
    return res.json({
      "status": false,
      "message": "Easebuzz credentials not configured. Please check EASEBUZZ_KEY and EASEBUZZ_SALT environment variables."
    });
  }

  // ✅ Validate merchant_email
  if (!config.merchant_email || !config.merchant_email.trim()) {
    return res.json({
      "status": false,
      "message": "merchant_email is required. Please provide it in the request body or set EASEBUZZ_MERCHANT_EMAIL environment variable."
    });
  }

  // ✅ Validate transaction_date
  if (!data.transaction_date || !data.transaction_date.trim()) {
    return res.json({
      "status": false,
      "message": "transaction_date is required in dd-mm-yyyy format"
    });
  }

  // ✅ Validate transaction_date format (dd-mm-yyyy)
  const datePattern = /^[0-9]{2}-[0-9]{2}-[0-9]{4}$/;
  if (!datePattern.test(data.transaction_date)) {
    return res.json({
      "status": false,
      "message": "transaction_date must be in dd-mm-yyyy format (e.g., 25-12-2024)"
    });
  }

  // ✅ Validate merchant_email format
  const emailPattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (!emailPattern.test(config.merchant_email)) {
    return res.json({
      "status": false,
      "message": "merchant_email must be a valid email address"
    });
  }

  // ✅ Validate merchant_key format if provided
  if (config.key && !/^[a-zA-Z0-9_]{1,15}$/.test(config.key)) {
    return res.json({
      "status": false,
      "message": "merchant_key format is invalid"
    });
  }

  // ✅ Validate submerchant_id format if provided
  if (data.submerchant_id && !/^[a-zA-Z0-9_]{1,45}$/.test(data.submerchant_id)) {
    return res.json({
      "status": false,
      "message": "submerchant_id must contain only alphanumeric characters and underscore (max 45 characters)"
    });
  }

  try {
    // ✅ Generate hash: key|merchant_email|transaction_date|salt
    const hashstring = config.key + "|" + config.merchant_email + "|" + data.transaction_date + "|" + config.salt;
    console.log('🔐 Transaction by Date Hash String:', hashstring);
    
    const hash_key = crypto.createHash("sha512").update(hashstring).digest("hex");
    console.log('🔐 Generated Transaction by Date Hash:', hash_key);

    // ✅ Build request payload
    const payload = {
      merchant_key: config.key,
      merchant_email: config.merchant_email,
      transaction_date: data.transaction_date,
      hash: hash_key
    };

    // ✅ Add optional submerchant_id if provided
    if (data.submerchant_id && data.submerchant_id.trim()) {
      payload.submerchant_id = data.submerchant_id.trim();
    }

    console.log('📤 Transaction by Date Request Data:', {
      merchant_key: payload.merchant_key,
      merchant_email: payload.merchant_email,
      transaction_date: payload.transaction_date,
      submerchant_id: payload.submerchant_id || 'not provided',
      hash: payload.hash.substring(0, 20) + '...'
    });

    // ✅ Determine API endpoint based on environment
    const isProduction = config.env === 'production';
    const call_url = isProduction 
      ? 'https://dashboard.easebuzz.in/transaction/v1/retrieve/date'
      : 'https://testdashboard.easebuzz.in/transaction/v1/retrieve/date';

    console.log('🌐 Calling Transaction by Date API:', call_url);

    // ✅ Make API call (Content-Type is application/x-www-form-urlencoded)
    const formData = new URLSearchParams(payload);
    
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
      console.log('✅ Transaction by Date API Response:', {
        status: response.data.status,
        transactionCount: response.data.transactions?.length || 0
      });
      
      // ✅ Return the response directly from Easebuzz (matching official pattern)
      return res.json(response.data);
    } else {
      console.error('❌ No response received from Transaction by Date API');
      return res.json({
        "status": false,
        "message": "No response received from Easebuzz"
      });
    }
  } catch (error) {
    console.error('❌ Error calling Transaction by Date API:', error.message);
    console.error('   Error Details:', error.response?.data || error.message);
    
    // ✅ Return error in Easebuzz format
    return res.json({
      "status": false,
      "message": "Error retrieving transactions by date: " + (error.response?.data?.message || error.response?.data?.error || error.message || 'Unknown error')
    });
  }
};