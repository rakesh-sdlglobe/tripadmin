const express = require('express');
const easebuzzPaymentController = require('../controllers/easebuzz_payments.js')

const routes = express.Router()

// Initiate payment 
routes.post("/Initiate_Payment", easebuzzPaymentController.easebuzzPayment)

// Handle payment callback from Easebuzz 
routes.post("/payment_callback", easebuzzPaymentController.easebuzzPaymentCallback)
routes.get("/payment_callback", easebuzzPaymentController.easebuzzPaymentCallback)

// Retrieve transaction details from Easebuzz
routes.post("/get_transaction_details", easebuzzPaymentController.getTransactionDetails)

// Initiate refund for Easebuzz transaction (V2 API)
routes.post("/initiate_refund", easebuzzPaymentController.initiateRefund)

// Get refund status from Easebuzz
routes.post("/get_refund_status", easebuzzPaymentController.getRefundStatus)

module.exports = routes