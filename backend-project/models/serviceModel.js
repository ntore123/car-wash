const { pool } = require('../config/db');

/**
 * Service Model - Handles database operations for service records
 */
class ServiceModel {
  /**
   * Get all service records
   * @returns {Promise<Array>} Array of service records
   */
  static async getAllServices() {
    try {
      const [rows] = await pool.query(`
        SELECT s.*, c.DriverName, c.CarType, c.CarSize, p.PackageName, p.PackagePrice
        FROM ServicePackage s
        JOIN Car c ON s.PlateNumber = c.PlateNumber
        JOIN Package p ON s.PackageNumber = p.PackageNumber
        ORDER BY s.ServiceDate DESC
      `);
      return rows;
    } catch (error) {
      console.error('Error getting all services:', error);
      throw error;
    }
  }

  /**
   * Get service by record number
   * @param {number} recordNumber - Service record number
   * @returns {Promise<Object>} Service record object
   */
  static async getServiceByRecordNumber(recordNumber) {
    try {
      const [rows] = await pool.query(`
        SELECT s.*, c.DriverName, c.CarType, c.CarSize, p.PackageName, p.PackagePrice
        FROM ServicePackage s
        JOIN Car c ON s.PlateNumber = c.PlateNumber
        JOIN Package p ON s.PackageNumber = p.PackageNumber
        WHERE s.RecordNumber = ?
      `, [recordNumber]);
      return rows[0];
    } catch (error) {
      console.error('Error getting service by record number:', error);
      throw error;
    }
  }

  /**
   * Create a new service record
   * @param {Object} serviceData - Service data
   * @returns {Promise<Object>} Created service record
   */
  static async createService(serviceData) {
    try {
      const { recordNumber, serviceDate, plateNumber, packageNumber } = serviceData;
      
      const [result] = await pool.query(
        'INSERT INTO ServicePackage (RecordNumber, ServiceDate, PlateNumber, PackageNumber) VALUES (?, ?, ?, ?)',
        [recordNumber, serviceDate, plateNumber, packageNumber]
      );
      
      return this.getServiceByRecordNumber(recordNumber);
    } catch (error) {
      console.error('Error creating service record:', error);
      throw error;
    }
  }

  /**
   * Update a service record
   * @param {number} recordNumber - Service record number
   * @param {Object} serviceData - Service data to update
   * @returns {Promise<Object>} Updated service record
   */
  static async updateService(recordNumber, serviceData) {
    try {
      const { serviceDate, plateNumber, packageNumber } = serviceData;
      
      const [result] = await pool.query(
        'UPDATE ServicePackage SET ServiceDate = ?, PlateNumber = ?, PackageNumber = ? WHERE RecordNumber = ?',
        [serviceDate, plateNumber, packageNumber, recordNumber]
      );
      
      return this.getServiceByRecordNumber(recordNumber);
    } catch (error) {
      console.error('Error updating service record:', error);
      throw error;
    }
  }

  /**
   * Delete a service record
   * @param {number} recordNumber - Service record number
   * @returns {Promise<boolean>} Success status
   */
  static async deleteService(recordNumber) {
    try {
      const [result] = await pool.query('DELETE FROM ServicePackage WHERE RecordNumber = ?', [recordNumber]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting service record:', error);
      throw error;
    }
  }

  /**
   * Get services by car plate number
   * @param {string} plateNumber - Car plate number
   * @returns {Promise<Array>} Array of service records
   */
  static async getServicesByPlateNumber(plateNumber) {
    try {
      const [rows] = await pool.query(`
        SELECT s.*, c.DriverName, c.CarType, c.CarSize, p.PackageName, p.PackagePrice
        FROM ServicePackage s
        JOIN Car c ON s.PlateNumber = c.PlateNumber
        JOIN Package p ON s.PackageNumber = p.PackageNumber
        WHERE s.PlateNumber = ?
        ORDER BY s.ServiceDate DESC
      `, [plateNumber]);
      return rows;
    } catch (error) {
      console.error('Error getting services by plate number:', error);
      throw error;
    }
  }

  /**
   * Get services by date range
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @returns {Promise<Array>} Array of service records
   */
  static async getServicesByDateRange(startDate, endDate) {
    try {
      const [rows] = await pool.query(`
        SELECT s.*, c.DriverName, c.CarType, c.CarSize, p.PackageName, p.PackagePrice
        FROM ServicePackage s
        JOIN Car c ON s.PlateNumber = c.PlateNumber
        JOIN Package p ON s.PackageNumber = p.PackageNumber
        WHERE s.ServiceDate BETWEEN ? AND ?
        ORDER BY s.ServiceDate DESC
      `, [startDate, endDate]);
      return rows;
    } catch (error) {
      console.error('Error getting services by date range:', error);
      throw error;
    }
  }
}

module.exports = ServiceModel;
