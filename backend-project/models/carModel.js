const { pool } = require('../config/db');

/**
 * Car Model - Handles database operations for cars
 */
class CarModel {
  /**
   * Get all cars
   * @returns {Promise<Array>} Array of cars
   */
  static async getAllCars() {
    try {
      const [rows] = await pool.query('SELECT * FROM Car ORDER BY PlateNumber');
      return rows;
    } catch (error) {
      console.error('Error getting all cars:', error);
      throw error;
    }
  }

  /**
   * Get car by plate number
   * @param {string} plateNumber - Car plate number
   * @returns {Promise<Object>} Car object
   */
  static async getCarByPlateNumber(plateNumber) {
    try {
      const [rows] = await pool.query('SELECT * FROM Car WHERE PlateNumber = ?', [plateNumber]);
      return rows[0];
    } catch (error) {
      console.error('Error getting car by plate number:', error);
      throw error;
    }
  }

  /**
   * Create a new car
   * @param {Object} carData - Car data
   * @returns {Promise<Object>} Created car
   */
  static async createCar(carData) {
    try {
      const { plateNumber, carType, carSize, driverName, phoneNumber } = carData;
      
      const [result] = await pool.query(
        'INSERT INTO Car (PlateNumber, CarType, CarSize, DriverName, PhoneNumber) VALUES (?, ?, ?, ?, ?)',
        [plateNumber, carType, carSize, driverName, phoneNumber]
      );
      
      return this.getCarByPlateNumber(plateNumber);
    } catch (error) {
      console.error('Error creating car:', error);
      throw error;
    }
  }

  /**
   * Update a car
   * @param {string} plateNumber - Car plate number
   * @param {Object} carData - Car data to update
   * @returns {Promise<Object>} Updated car
   */
  static async updateCar(plateNumber, carData) {
    try {
      const { carType, carSize, driverName, phoneNumber } = carData;
      
      const [result] = await pool.query(
        'UPDATE Car SET CarType = ?, CarSize = ?, DriverName = ?, PhoneNumber = ? WHERE PlateNumber = ?',
        [carType, carSize, driverName, phoneNumber, plateNumber]
      );
      
      return this.getCarByPlateNumber(plateNumber);
    } catch (error) {
      console.error('Error updating car:', error);
      throw error;
    }
  }

  /**
   * Delete a car
   * @param {string} plateNumber - Car plate number
   * @returns {Promise<boolean>} Success status
   */
  static async deleteCar(plateNumber) {
    try {
      const [result] = await pool.query('DELETE FROM Car WHERE PlateNumber = ?', [plateNumber]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting car:', error);
      throw error;
    }
  }

  /**
   * Search cars by driver name or plate number
   * @param {string} searchTerm - Search term
   * @returns {Promise<Array>} Array of matching cars
   */
  static async searchCars(searchTerm) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM Car WHERE PlateNumber LIKE ? OR DriverName LIKE ?',
        [`%${searchTerm}%`, `%${searchTerm}%`]
      );
      return rows;
    } catch (error) {
      console.error('Error searching cars:', error);
      throw error;
    }
  }
}

module.exports = CarModel;
