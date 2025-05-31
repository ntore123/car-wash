const { pool } = require('../config/db');

/**
 * Dashboard Model - Handles database operations for dashboard statistics
 */
class DashboardModel {
  /**
   * Get dashboard statistics
   * @returns {Promise<Object>} Dashboard statistics
   */
  static async getDashboardStats() {
    try {
      // Get total cars
      const [carRows] = await pool.query('SELECT COUNT(*) as totalCars FROM Car');
      const totalCars = carRows[0].totalCars;

      // Get total services
      const [serviceRows] = await pool.query('SELECT COUNT(*) as totalServices FROM ServicePackage');
      const totalServices = serviceRows[0].totalServices;

      // Get total revenue
      const [revenueRows] = await pool.query('SELECT SUM(AmountPaid) as totalRevenue FROM Payment');
      const totalRevenue = revenueRows[0].totalRevenue || 0;

      // Get recent services
      const [recentServices] = await pool.query(`
        SELECT s.*, c.DriverName, c.CarType, p.PackageName, p.PackagePrice
        FROM ServicePackage s
        JOIN Car c ON s.PlateNumber = c.PlateNumber
        JOIN Package p ON s.PackageNumber = p.PackageNumber
        ORDER BY s.ServiceDate DESC
        LIMIT 5
      `);

      // Get recent payments
      const [recentPayments] = await pool.query(`
        SELECT p.*, s.PlateNumber, c.DriverName
        FROM Payment p
        JOIN ServicePackage s ON p.RecordNumber = s.RecordNumber
        JOIN Car c ON s.PlateNumber = c.PlateNumber
        ORDER BY p.PaymentDate DESC
        LIMIT 5
      `);

      // Get popular packages
      const [popularPackages] = await pool.query(`
        SELECT p.PackageNumber, p.PackageName, COUNT(s.RecordNumber) as serviceCount
        FROM Package p
        JOIN ServicePackage s ON p.PackageNumber = s.PackageNumber
        GROUP BY p.PackageNumber, p.PackageName
        ORDER BY serviceCount DESC
        LIMIT 5
      `);

      return {
        totalCars,
        totalServices,
        totalRevenue,
        recentServices,
        recentPayments,
        popularPackages
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      throw error;
    }
  }

  /**
   * Get revenue by date range
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @returns {Promise<Object>} Revenue statistics
   */
  static async getRevenueByDateRange(startDate, endDate) {
    try {
      const [rows] = await pool.query(`
        SELECT 
          DATE(p.PaymentDate) as date,
          SUM(p.AmountPaid) as dailyRevenue,
          COUNT(p.PaymentNumber) as paymentCount
        FROM Payment p
        WHERE p.PaymentDate BETWEEN ? AND ?
        GROUP BY DATE(p.PaymentDate)
        ORDER BY date
      `, [startDate, endDate]);

      return rows;
    } catch (error) {
      console.error('Error getting revenue by date range:', error);
      throw error;
    }
  }

  /**
   * Get service statistics by date range
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @returns {Promise<Object>} Service statistics
   */
  static async getServiceStatsByDateRange(startDate, endDate) {
    try {
      const [rows] = await pool.query(`
        SELECT 
          DATE(s.ServiceDate) as date,
          COUNT(s.RecordNumber) as serviceCount
        FROM ServicePackage s
        WHERE s.ServiceDate BETWEEN ? AND ?
        GROUP BY DATE(s.ServiceDate)
        ORDER BY date
      `, [startDate, endDate]);

      return rows;
    } catch (error) {
      console.error('Error getting service stats by date range:', error);
      throw error;
    }
  }

  /**
   * Get package popularity statistics
   * @returns {Promise<Array>} Package popularity statistics
   */
  static async getPackagePopularityStats() {
    try {
      const [rows] = await pool.query(`
        SELECT 
          p.PackageNumber,
          p.PackageName,
          COUNT(s.RecordNumber) as serviceCount,
          SUM(p.PackagePrice) as totalRevenue
        FROM Package p
        LEFT JOIN ServicePackage s ON p.PackageNumber = s.PackageNumber
        GROUP BY p.PackageNumber, p.PackageName
        ORDER BY serviceCount DESC
      `);

      return rows;
    } catch (error) {
      console.error('Error getting package popularity stats:', error);
      throw error;
    }
  }
}

module.exports = DashboardModel;
