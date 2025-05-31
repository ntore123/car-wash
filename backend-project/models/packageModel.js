const { pool } = require('../config/db');

/**
 * Package Model - Handles database operations for service packages
 */
class PackageModel {
  /**
   * Get all packages
   * @returns {Promise<Array>} Array of packages
   */
  static async getAllPackages() {
    try {
      const [rows] = await pool.query('SELECT * FROM Package ORDER BY PackageNumber');
      return rows;
    } catch (error) {
      console.error('Error getting all packages:', error);
      throw error;
    }
  }

  /**
   * Get package by number
   * @param {number} packageNumber - Package number
   * @returns {Promise<Object>} Package object
   */
  static async getPackageByNumber(packageNumber) {
    try {
      const [rows] = await pool.query('SELECT * FROM Package WHERE PackageNumber = ?', [packageNumber]);
      return rows[0];
    } catch (error) {
      console.error('Error getting package by number:', error);
      throw error;
    }
  }

  /**
   * Create a new package
   * @param {Object} packageData - Package data
   * @returns {Promise<Object>} Created package
   */
  static async createPackage(packageData) {
    try {
      const { packageNumber, packageName, packageDescription, packagePrice } = packageData;
      
      const [result] = await pool.query(
        'INSERT INTO Package (PackageNumber, PackageName, PackageDescription, PackagePrice) VALUES (?, ?, ?, ?)',
        [packageNumber, packageName, packageDescription, packagePrice]
      );
      
      return this.getPackageByNumber(packageNumber);
    } catch (error) {
      console.error('Error creating package:', error);
      throw error;
    }
  }

  /**
   * Update a package
   * @param {number} packageNumber - Package number
   * @param {Object} packageData - Package data to update
   * @returns {Promise<Object>} Updated package
   */
  static async updatePackage(packageNumber, packageData) {
    try {
      const { packageName, packageDescription, packagePrice } = packageData;
      
      const [result] = await pool.query(
        'UPDATE Package SET PackageName = ?, PackageDescription = ?, PackagePrice = ? WHERE PackageNumber = ?',
        [packageName, packageDescription, packagePrice, packageNumber]
      );
      
      return this.getPackageByNumber(packageNumber);
    } catch (error) {
      console.error('Error updating package:', error);
      throw error;
    }
  }

  /**
   * Delete a package
   * @param {number} packageNumber - Package number
   * @returns {Promise<boolean>} Success status
   */
  static async deletePackage(packageNumber) {
    try {
      const [result] = await pool.query('DELETE FROM Package WHERE PackageNumber = ?', [packageNumber]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting package:', error);
      throw error;
    }
  }

  /**
   * Search packages by name
   * @param {string} searchTerm - Search term
   * @returns {Promise<Array>} Array of matching packages
   */
  static async searchPackages(searchTerm) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM Package WHERE PackageName LIKE ? OR PackageDescription LIKE ?',
        [`%${searchTerm}%`, `%${searchTerm}%`]
      );
      return rows;
    } catch (error) {
      console.error('Error searching packages:', error);
      throw error;
    }
  }
}

module.exports = PackageModel;
