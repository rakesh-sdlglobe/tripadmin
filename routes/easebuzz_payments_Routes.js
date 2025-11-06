const express = require('express');
const easebuzzPaymentController = require('../controllers/easebuzz_payments.js')

const routes = express.Router()

// Initiate payment (similar to Razorpay getRazorpayOrder)
routes.post("/Initiate_Payment", easebuzzPaymentController.easebuzzPayment)

// Handle payment callback from Easebuzz (similar to Razorpay handler)
routes.post("/payment_callback", easebuzzPaymentController.easebuzzPaymentCallback)
routes.get("/payment_callback", easebuzzPaymentController.easebuzzPaymentCallback)

// Retrieve transaction details from Easebuzz
routes.post("/get_transaction_details", easebuzzPaymentController.getTransactionDetails)

// Initiate refund for Easebuzz transaction (V2 API)
routes.post("/initiate_refund", easebuzzPaymentController.initiateRefund)

module.exports = routes