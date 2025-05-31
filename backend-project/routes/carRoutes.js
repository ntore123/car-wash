const express = require('express');
const router = express.Router();
const CarModel = require('../models/carModel');
const { isAuthenticated } = require('../middleware/auth');

// Get all cars
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const cars = await CarModel.getAllCars();
    res.json({ success: true, data: cars });
  } catch (error) {
    console.error('Error in GET /cars:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get car by plate number
router.get('/:plateNumber', isAuthenticated, async (req, res) => {
  try {
    const car = await CarModel.getCarByPlateNumber(req.params.plateNumber);
    
    if (!car) {
      return res.status(404).json({ success: false, message: 'Car not found' });
    }
    
    res.json({ success: true, data: car });
  } catch (error) {
    console.error(`Error in GET /cars/${req.params.plateNumber}:`, error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create a new car
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const { plateNumber, carType, carSize, driverName, phoneNumber } = req.body;
    
    // Validate required fields
    if (!plateNumber || !carType || !carSize || !driverName || !phoneNumber) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields: plateNumber, carType, carSize, driverName, phoneNumber' 
      });
    }
    
    // Check if car already exists
    const existingCar = await CarModel.getCarByPlateNumber(plateNumber);
    if (existingCar) {
      return res.status(400).json({ 
        success: false, 
        message: 'Car with this plate number already exists' 
      });
    }
    
    const newCar = await CarModel.createCar({
      plateNumber,
      carType,
      carSize,
      driverName,
      phoneNumber
    });
    
    res.status(201).json({ success: true, data: newCar });
  } catch (error) {
    console.error('Error in POST /cars:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update a car
router.put('/:plateNumber', isAuthenticated, async (req, res) => {
  try {
    const { carType, carSize, driverName, phoneNumber } = req.body;
    const plateNumber = req.params.plateNumber;
    
    // Validate required fields
    if (!carType || !carSize || !driverName || !phoneNumber) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields: carType, carSize, driverName, phoneNumber' 
      });
    }
    
    // Check if car exists
    const existingCar = await CarModel.getCarByPlateNumber(plateNumber);
    if (!existingCar) {
      return res.status(404).json({ 
        success: false, 
        message: 'Car not found' 
      });
    }
    
    const updatedCar = await CarModel.updateCar(plateNumber, {
      carType,
      carSize,
      driverName,
      phoneNumber
    });
    
    res.json({ success: true, data: updatedCar });
  } catch (error) {
    console.error(`Error in PUT /cars/${req.params.plateNumber}:`, error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete a car
router.delete('/:plateNumber', isAuthenticated, async (req, res) => {
  try {
    const plateNumber = req.params.plateNumber;
    
    // Check if car exists
    const existingCar = await CarModel.getCarByPlateNumber(plateNumber);
    if (!existingCar) {
      return res.status(404).json({ 
        success: false, 
        message: 'Car not found' 
      });
    }
    
    const deleted = await CarModel.deleteCar(plateNumber);
    
    if (deleted) {
      res.json({ success: true, message: 'Car deleted successfully' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to delete car' });
    }
  } catch (error) {
    console.error(`Error in DELETE /cars/${req.params.plateNumber}:`, error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Search cars
router.get('/search/:term', isAuthenticated, async (req, res) => {
  try {
    const searchTerm = req.params.term;
    const cars = await CarModel.searchCars(searchTerm);
    
    res.json({ success: true, data: cars });
  } catch (error) {
    console.error(`Error in GET /cars/search/${req.params.term}:`, error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
