const express = require('express');
const router = express.Router();
const PackageModel = require('../models/packageModel');
const { isAuthenticated } = require('../middleware/auth');

// Get all packages
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const packages = await PackageModel.getAllPackages();
    res.json({ success: true, data: packages });
  } catch (error) {
    console.error('Error in GET /packages:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get package by number
router.get('/:packageNumber', isAuthenticated, async (req, res) => {
  try {
    const packageNumber = parseInt(req.params.packageNumber);
    
    if (isNaN(packageNumber)) {
      return res.status(400).json({ success: false, message: 'Invalid package number' });
    }
    
    const packageData = await PackageModel.getPackageByNumber(packageNumber);
    
    if (!packageData) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }
    
    res.json({ success: true, data: packageData });
  } catch (error) {
    console.error(`Error in GET /packages/${req.params.packageNumber}:`, error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create a new package
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const { packageNumber, packageName, packageDescription, packagePrice } = req.body;
    
    // Validate required fields
    if (!packageNumber || !packageName || !packagePrice) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields: packageNumber, packageName, packagePrice' 
      });
    }
    
    // Validate package number is a number
    if (isNaN(parseInt(packageNumber))) {
      return res.status(400).json({ success: false, message: 'Package number must be a number' });
    }
    
    // Validate package price is a number
    if (isNaN(parseFloat(packagePrice))) {
      return res.status(400).json({ success: false, message: 'Package price must be a number' });
    }
    
    // Check if package already exists
    const existingPackage = await PackageModel.getPackageByNumber(packageNumber);
    if (existingPackage) {
      return res.status(400).json({ 
        success: false, 
        message: 'Package with this number already exists' 
      });
    }
    
    const newPackage = await PackageModel.createPackage({
      packageNumber: parseInt(packageNumber),
      packageName,
      packageDescription: packageDescription || '',
      packagePrice: parseFloat(packagePrice)
    });
    
    res.status(201).json({ success: true, data: newPackage });
  } catch (error) {
    console.error('Error in POST /packages:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update a package
router.put('/:packageNumber', isAuthenticated, async (req, res) => {
  try {
    const packageNumber = parseInt(req.params.packageNumber);
    const { packageName, packageDescription, packagePrice } = req.body;
    
    if (isNaN(packageNumber)) {
      return res.status(400).json({ success: false, message: 'Invalid package number' });
    }
    
    // Validate required fields
    if (!packageName || !packagePrice) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields: packageName, packagePrice' 
      });
    }
    
    // Validate package price is a number
    if (isNaN(parseFloat(packagePrice))) {
      return res.status(400).json({ success: false, message: 'Package price must be a number' });
    }
    
    // Check if package exists
    const existingPackage = await PackageModel.getPackageByNumber(packageNumber);
    if (!existingPackage) {
      return res.status(404).json({ 
        success: false, 
        message: 'Package not found' 
      });
    }
    
    const updatedPackage = await PackageModel.updatePackage(packageNumber, {
      packageName,
      packageDescription: packageDescription || '',
      packagePrice: parseFloat(packagePrice)
    });
    
    res.json({ success: true, data: updatedPackage });
  } catch (error) {
    console.error(`Error in PUT /packages/${req.params.packageNumber}:`, error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete a package
router.delete('/:packageNumber', isAuthenticated, async (req, res) => {
  try {
    const packageNumber = parseInt(req.params.packageNumber);
    
    if (isNaN(packageNumber)) {
      return res.status(400).json({ success: false, message: 'Invalid package number' });
    }
    
    // Check if package exists
    const existingPackage = await PackageModel.getPackageByNumber(packageNumber);
    if (!existingPackage) {
      return res.status(404).json({ 
        success: false, 
        message: 'Package not found' 
      });
    }
    
    const deleted = await PackageModel.deletePackage(packageNumber);
    
    if (deleted) {
      res.json({ success: true, message: 'Package deleted successfully' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to delete package' });
    }
  } catch (error) {
    console.error(`Error in DELETE /packages/${req.params.packageNumber}:`, error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Search packages
router.get('/search/:term', isAuthenticated, async (req, res) => {
  try {
    const searchTerm = req.params.term;
    const packages = await PackageModel.searchPackages(searchTerm);
    
    res.json({ success: true, data: packages });
  } catch (error) {
    console.error(`Error in GET /packages/search/${req.params.term}:`, error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
