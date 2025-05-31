const express = require('express');
const router = express.Router();
const PaymentModel = require('../models/paymentModel');
const ServiceModel = require('../models/serviceModel');
const { isAuthenticated } = require('../middleware/auth');

// Get all payments
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const payments = await PaymentModel.getAllPayments();
    res.json({ success: true, data: payments });
  } catch (error) {
    console.error('Error in GET /payments:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get payment by number
router.get('/:paymentNumber', isAuthenticated, async (req, res) => {
  try {
    const paymentNumber = parseInt(req.params.paymentNumber);
    
    if (isNaN(paymentNumber)) {
      return res.status(400).json({ success: false, message: 'Invalid payment number' });
    }
    
    const payment = await PaymentModel.getPaymentByNumber(paymentNumber);
    
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }
    
    res.json({ success: true, data: payment });
  } catch (error) {
    console.error(`Error in GET /payments/${req.params.paymentNumber}:`, error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create a new payment
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const { paymentNumber, amountPaid, paymentDate, recordNumber } = req.body;
    
    // Validate required fields
    if (!paymentNumber || !amountPaid || !paymentDate || !recordNumber) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields: paymentNumber, amountPaid, paymentDate, recordNumber' 
      });
    }
    
    // Validate payment number is a number
    if (isNaN(parseInt(paymentNumber))) {
      return res.status(400).json({ success: false, message: 'Payment number must be a number' });
    }
    
    // Validate amount paid is a number
    if (isNaN(parseFloat(amountPaid))) {
      return res.status(400).json({ success: false, message: 'Amount paid must be a number' });
    }
    
    // Validate record number is a number
    if (isNaN(parseInt(recordNumber))) {
      return res.status(400).json({ success: false, message: 'Record number must be a number' });
    }
    
    // Check if payment already exists
    const existingPayment = await PaymentModel.getPaymentByNumber(paymentNumber);
    if (existingPayment) {
      return res.status(400).json({ 
        success: false, 
        message: 'Payment with this number already exists' 
      });
    }
    
    // Check if service exists
    const service = await ServiceModel.getServiceByRecordNumber(recordNumber);
    if (!service) {
      return res.status(400).json({ 
        success: false, 
        message: 'Service with this record number does not exist' 
      });
    }
    
    const newPayment = await PaymentModel.createPayment({
      paymentNumber: parseInt(paymentNumber),
      amountPaid: parseFloat(amountPaid),
      paymentDate,
      recordNumber: parseInt(recordNumber)
    });
    
    res.status(201).json({ success: true, data: newPayment });
  } catch (error) {
    console.error('Error in POST /payments:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update a payment
router.put('/:paymentNumber', isAuthenticated, async (req, res) => {
  try {
    const paymentNumber = parseInt(req.params.paymentNumber);
    const { amountPaid, paymentDate, recordNumber } = req.body;
    
    if (isNaN(paymentNumber)) {
      return res.status(400).json({ success: false, message: 'Invalid payment number' });
    }
    
    // Validate required fields
    if (!amountPaid || !paymentDate || !recordNumber) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields: amountPaid, paymentDate, recordNumber' 
      });
    }
    
    // Validate amount paid is a number
    if (isNaN(parseFloat(amountPaid))) {
      return res.status(400).json({ success: false, message: 'Amount paid must be a number' });
    }
    
    // Validate record number is a number
    if (isNaN(parseInt(recordNumber))) {
      return res.status(400).json({ success: false, message: 'Record number must be a number' });
    }
    
    // Check if payment exists
    const existingPayment = await PaymentModel.getPaymentByNumber(paymentNumber);
    if (!existingPayment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Payment not found' 
      });
    }
    
    // Check if service exists
    const service = await ServiceModel.getServiceByRecordNumber(recordNumber);
    if (!service) {
      return res.status(400).json({ 
        success: false, 
        message: 'Service with this record number does not exist' 
      });
    }
    
    const updatedPayment = await PaymentModel.updatePayment(paymentNumber, {
      amountPaid: parseFloat(amountPaid),
      paymentDate,
      recordNumber: parseInt(recordNumber)
    });
    
    res.json({ success: true, data: updatedPayment });
  } catch (error) {
    console.error(`Error in PUT /payments/${req.params.paymentNumber}:`, error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete a payment
router.delete('/:paymentNumber', isAuthenticated, async (req, res) => {
  try {
    const paymentNumber = parseInt(req.params.paymentNumber);
    
    if (isNaN(paymentNumber)) {
      return res.status(400).json({ success: false, message: 'Invalid payment number' });
    }
    
    // Check if payment exists
    const existingPayment = await PaymentModel.getPaymentByNumber(paymentNumber);
    if (!existingPayment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Payment not found' 
      });
    }
    
    const deleted = await PaymentModel.deletePayment(paymentNumber);
    
    if (deleted) {
      res.json({ success: true, message: 'Payment deleted successfully' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to delete payment' });
    }
  } catch (error) {
    console.error(`Error in DELETE /payments/${req.params.paymentNumber}:`, error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get payments by service record number
router.get('/service/:recordNumber', isAuthenticated, async (req, res) => {
  try {
    const recordNumber = parseInt(req.params.recordNumber);
    
    if (isNaN(recordNumber)) {
      return res.status(400).json({ success: false, message: 'Invalid record number' });
    }
    
    const payments = await PaymentModel.getPaymentsByRecordNumber(recordNumber);
    
    res.json({ success: true, data: payments });
  } catch (error) {
    console.error(`Error in GET /payments/service/${req.params.recordNumber}:`, error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get payments by date range
router.get('/date-range/:startDate/:endDate', isAuthenticated, async (req, res) => {
  try {
    const { startDate, endDate } = req.params;
    const payments = await PaymentModel.getPaymentsByDateRange(startDate, endDate);
    
    res.json({ success: true, data: payments });
  } catch (error) {
    console.error(`Error in GET /payments/date-range/${req.params.startDate}/${req.params.endDate}:`, error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get total revenue by date range
router.get('/revenue/:startDate/:endDate', isAuthenticated, async (req, res) => {
  try {
    const { startDate, endDate } = req.params;
    const totalRevenue = await PaymentModel.getTotalRevenueByDateRange(startDate, endDate);
    
    res.json({ success: true, data: { totalRevenue } });
  } catch (error) {
    console.error(`Error in GET /payments/revenue/${req.params.startDate}/${req.params.endDate}:`, error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
