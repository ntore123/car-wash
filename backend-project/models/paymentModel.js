const { pool } = require('../config/db');

/**
 * Payment Model - Handles database operations for payments
 */
class PaymentModel {
  /**
   * Get all payments
   * @returns {Promise<Array>} Array of payments
   */
  static async getAllPayments() {
    try {
      const [rows] = await pool.query(`
        SELECT p.*, s.ServiceDate, s.PlateNumber, c.DriverName, pkg.PackageName, pkg.PackagePrice
        FROM Payment p
        JOIN ServicePackage s ON p.RecordNumber = s.RecordNumber
        JOIN Car c ON s.PlateNumber = c.PlateNumber
        JOIN Package pkg ON s.PackageNumber = pkg.PackageNumber
        ORDER BY p.PaymentDate DESC
      `);
      return rows;
    } catch (error) {
      console.error('Error getting all payments:', error);
      throw error;
    }
  }

  /**
   * Get payment by number
   * @param {number} paymentNumber - Payment number
   * @returns {Promise<Object>} Payment object
   */
  static async getPaymentByNumber(paymentNumber) {
    try {
      const [rows] = await pool.query(`
        SELECT p.*, s.ServiceDate, s.PlateNumber, c.DriverName, pkg.PackageName, pkg.PackagePrice
        FROM Payment p
        JOIN ServicePackage s ON p.RecordNumber = s.RecordNumber
        JOIN Car c ON s.PlateNumber = c.PlateNumber
        JOIN Package pkg ON s.PackageNumber = pkg.PackageNumber
        WHERE p.PaymentNumber = ?
      `, [paymentNumber]);
      return rows[0];
    } catch (error) {
      console.error('Error getting payment by number:', error);
      throw error;
    }
  }

  /**
   * Create a new payment
   * @param {Object} paymentData - Payment data
   * @returns {Promise<Object>} Created payment
   */
  static async createPayment(paymentData) {
    try {
      const { paymentNumber, amountPaid, paymentDate, recordNumber } = paymentData;
      
      const [result] = await pool.query(
        'INSERT INTO Payment (PaymentNumber, AmountPaid, PaymentDate, RecordNumber) VALUES (?, ?, ?, ?)',
        [paymentNumber, amountPaid, paymentDate, recordNumber]
      );
      
      return this.getPaymentByNumber(paymentNumber);
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  }

  /**
   * Update a payment
   * @param {number} paymentNumber - Payment number
   * @param {Object} paymentData - Payment data to update
   * @returns {Promise<Object>} Updated payment
   */
  static async updatePayment(paymentNumber, paymentData) {
    try {
      const { amountPaid, paymentDate, recordNumber } = paymentData;
      
      const [result] = await pool.query(
        'UPDATE Payment SET AmountPaid = ?, PaymentDate = ?, RecordNumber = ? WHERE PaymentNumber = ?',
        [amountPaid, paymentDate, recordNumber, paymentNumber]
      );
      
      return this.getPaymentByNumber(paymentNumber);
    } catch (error) {
      console.error('Error updating payment:', error);
      throw error;
    }
  }

  /**
   * Delete a payment
   * @param {number} paymentNumber - Payment number
   * @returns {Promise<boolean>} Success status
   */
  static async deletePayment(paymentNumber) {
    try {
      const [result] = await pool.query('DELETE FROM Payment WHERE PaymentNumber = ?', [paymentNumber]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting payment:', error);
      throw error;
    }
  }

  /**
   * Get payments by service record number
   * @param {number} recordNumber - Service record number
   * @returns {Promise<Array>} Array of payments
   */
  static async getPaymentsByRecordNumber(recordNumber) {
    try {
      const [rows] = await pool.query(`
        SELECT p.*, s.ServiceDate, s.PlateNumber, c.DriverName, pkg.PackageName, pkg.PackagePrice
        FROM Payment p
        JOIN ServicePackage s ON p.RecordNumber = s.RecordNumber
        JOIN Car c ON s.PlateNumber = c.PlateNumber
        JOIN Package pkg ON s.PackageNumber = pkg.PackageNumber
        WHERE p.RecordNumber = ?
        ORDER BY p.PaymentDate DESC
      `, [recordNumber]);
      return rows;
    } catch (error) {
      console.error('Error getting payments by record number:', error);
      throw error;
    }
  }

  /**
   * Get payments by date range
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @returns {Promise<Array>} Array of payments
   */
  static async getPaymentsByDateRange(startDate, endDate) {
    try {
      const [rows] = await pool.query(`
        SELECT p.*, s.ServiceDate, s.PlateNumber, c.DriverName, pkg.PackageName, pkg.PackagePrice
        FROM Payment p
        JOIN ServicePackage s ON p.RecordNumber = s.RecordNumber
        JOIN Car c ON s.PlateNumber = c.PlateNumber
        JOIN Package pkg ON s.PackageNumber = pkg.PackageNumber
        WHERE p.PaymentDate BETWEEN ? AND ?
        ORDER BY p.PaymentDate DESC
      `, [startDate, endDate]);
      return rows;
    } catch (error) {
      console.error('Error getting payments by date range:', error);
      throw error;
    }
  }

  /**
   * Get total revenue by date range
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @returns {Promise<number>} Total revenue
   */
  static async getTotalRevenueByDateRange(startDate, endDate) {
    try {
      const [rows] = await pool.query(`
        SELECT SUM(AmountPaid) as totalRevenue
        FROM Payment
        WHERE PaymentDate BETWEEN ? AND ?
      `, [startDate, endDate]);
      return rows[0].totalRevenue || 0;
    } catch (error) {
      console.error('Error getting total revenue:', error);
      throw error;
    }
  }
}

module.exports = PaymentModel;
