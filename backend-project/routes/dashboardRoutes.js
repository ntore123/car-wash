const express = require('express');
const router = express.Router();
const DashboardModel = require('../models/dashboardModel');
const { isAuthenticated } = require('../middleware/auth');

// Get dashboard statistics
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const stats = await DashboardModel.getDashboardStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error in GET /dashboard:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get revenue by date range
router.get('/revenue/:startDate/:endDate', isAuthenticated, async (req, res) => {
  try {
    const { startDate, endDate } = req.params;
    const revenueData = await DashboardModel.getRevenueByDateRange(startDate, endDate);
    
    res.json({ success: true, data: revenueData });
  } catch (error) {
    console.error(`Error in GET /dashboard/revenue/${req.params.startDate}/${req.params.endDate}:`, error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get service statistics by date range
router.get('/services/:startDate/:endDate', isAuthenticated, async (req, res) => {
  try {
    const { startDate, endDate } = req.params;
    const serviceStats = await DashboardModel.getServiceStatsByDateRange(startDate, endDate);
    
    res.json({ success: true, data: serviceStats });
  } catch (error) {
    console.error(`Error in GET /dashboard/services/${req.params.startDate}/${req.params.endDate}:`, error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get package popularity statistics
router.get('/packages/popularity', isAuthenticated, async (req, res) => {
  try {
    const packageStats = await DashboardModel.getPackagePopularityStats();
    
    res.json({ success: true, data: packageStats });
  } catch (error) {
    console.error('Error in GET /dashboard/packages/popularity:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
