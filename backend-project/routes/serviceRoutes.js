const express = require('express');
const router = express.Router();
const ServiceModel = require('../models/serviceModel');
const CarModel = require('../models/carModel');
const PackageModel = require('../models/packageModel');
const { isAuthenticated } = require('../middleware/auth');

// Get all services
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const services = await ServiceModel.getAllServices();
    res.json({ success: true, data: services });
  } catch (error) {
    console.error('Error in GET /services:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get service by record number
router.get('/:recordNumber', isAuthenticated, async (req, res) => {
  try {
    const recordNumber = parseInt(req.params.recordNumber);
    
    if (isNaN(recordNumber)) {
      return res.status(400).json({ success: false, message: 'Invalid record number' });
    }
    
    const service = await ServiceModel.getServiceByRecordNumber(recordNumber);
    
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    
    res.json({ success: true, data: service });
  } catch (error) {
    console.error(`Error in GET /services/${req.params.recordNumber}:`, error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create a new service
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const { recordNumber, serviceDate, plateNumber, packageNumber } = req.body;
    
    // Validate required fields
    if (!recordNumber || !serviceDate || !plateNumber || !packageNumber) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields: recordNumber, serviceDate, plateNumber, packageNumber' 
      });
    }
    
    // Validate record number is a number
    if (isNaN(parseInt(recordNumber))) {
      return res.status(400).json({ success: false, message: 'Record number must be a number' });
    }
    
    // Validate package number is a number
    if (isNaN(parseInt(packageNumber))) {
      return res.status(400).json({ success: false, message: 'Package number must be a number' });
    }
    
    // Check if service already exists
    const existingService = await ServiceModel.getServiceByRecordNumber(recordNumber);
    if (existingService) {
      return res.status(400).json({ 
        success: false, 
        message: 'Service with this record number already exists' 
      });
    }
    
    // Check if car exists
    const car = await CarModel.getCarByPlateNumber(plateNumber);
    if (!car) {
      return res.status(400).json({ 
        success: false, 
        message: 'Car with this plate number does not exist' 
      });
    }
    
    // Check if package exists
    const packageData = await PackageModel.getPackageByNumber(packageNumber);
    if (!packageData) {
      return res.status(400).json({ 
        success: false, 
        message: 'Package with this number does not exist' 
      });
    }
    
    const newService = await ServiceModel.createService({
      recordNumber: parseInt(recordNumber),
      serviceDate,
      plateNumber,
      packageNumber: parseInt(packageNumber)
    });
    
    res.status(201).json({ success: true, data: newService });
  } catch (error) {
    console.error('Error in POST /services:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update a service
router.put('/:recordNumber', isAuthenticated, async (req, res) => {
  try {
    const recordNumber = parseInt(req.params.recordNumber);
    const { serviceDate, plateNumber, packageNumber } = req.body;
    
    if (isNaN(recordNumber)) {
      return res.status(400).json({ success: false, message: 'Invalid record number' });
    }
    
    // Validate required fields
    if (!serviceDate || !plateNumber || !packageNumber) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields: serviceDate, plateNumber, packageNumber' 
      });
    }
    
    // Validate package number is a number
    if (isNaN(parseInt(packageNumber))) {
      return res.status(400).json({ success: false, message: 'Package number must be a number' });
    }
    
    // Check if service exists
    const existingService = await ServiceModel.getServiceByRecordNumber(recordNumber);
    if (!existingService) {
      return res.status(404).json({ 
        success: false, 
        message: 'Service not found' 
      });
    }
    
    // Check if car exists
    const car = await CarModel.getCarByPlateNumber(plateNumber);
    if (!car) {
      return res.status(400).json({ 
        success: false, 
        message: 'Car with this plate number does not exist' 
      });
    }
    
    // Check if package exists
    const packageData = await PackageModel.getPackageByNumber(packageNumber);
    if (!packageData) {
      return res.status(400).json({ 
        success: false, 
        message: 'Package with this number does not exist' 
      });
    }
    
    const updatedService = await ServiceModel.updateService(recordNumber, {
      serviceDate,
      plateNumber,
      packageNumber: parseInt(packageNumber)
    });
    
    res.json({ success: true, data: updatedService });
  } catch (error) {
    console.error(`Error in PUT /services/${req.params.recordNumber}:`, error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete a service
router.delete('/:recordNumber', isAuthenticated, async (req, res) => {
  try {
    const recordNumber = parseInt(req.params.recordNumber);
    
    if (isNaN(recordNumber)) {
      return res.status(400).json({ success: false, message: 'Invalid record number' });
    }
    
    // Check if service exists
    const existingService = await ServiceModel.getServiceByRecordNumber(recordNumber);
    if (!existingService) {
      return res.status(404).json({ 
        success: false, 
        message: 'Service not found' 
      });
    }
    
    const deleted = await ServiceModel.deleteService(recordNumber);
    
    if (deleted) {
      res.json({ success: true, message: 'Service deleted successfully' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to delete service' });
    }
  } catch (error) {
    console.error(`Error in DELETE /services/${req.params.recordNumber}:`, error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get services by car plate number
router.get('/car/:plateNumber', isAuthenticated, async (req, res) => {
  try {
    const plateNumber = req.params.plateNumber;
    const services = await ServiceModel.getServicesByPlateNumber(plateNumber);
    
    res.json({ success: true, data: services });
  } catch (error) {
    console.error(`Error in GET /services/car/${req.params.plateNumber}:`, error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get services by date range
router.get('/date-range/:startDate/:endDate', isAuthenticated, async (req, res) => {
  try {
    const { startDate, endDate } = req.params;
    const services = await ServiceModel.getServicesByDateRange(startDate, endDate);
    
    res.json({ success: true, data: services });
  } catch (error) {
    console.error(`Error in GET /services/date-range/${req.params.startDate}/${req.params.endDate}:`, error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
