const { pool } = require('../config/db');
const bcrypt = require('bcrypt');

/**
 * User Model - Handles database operations for users
 */
class UserModel {
  /**
   * Get all users
   * @returns {Promise<Array>} Array of users (without passwords)
   */
  static async getAllUsers() {
    try {
      const [rows] = await pool.query('SELECT UserID, Username FROM User ORDER BY UserID');
      return rows;
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }

  /**
   * Get user by ID
   * @param {number} userId - User ID
   * @returns {Promise<Object>} User object (without password)
   */
  static async getUserById(userId) {
    try {
      const [rows] = await pool.query('SELECT UserID, Username FROM User WHERE UserID = ?', [userId]);
      return rows[0];
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw error;
    }
  }

  /**
   * Get user by username
   * @param {string} username - Username
   * @returns {Promise<Object>} User object (with password for authentication)
   */
  static async getUserByUsername(username) {
    try {
      const [rows] = await pool.query('SELECT * FROM User WHERE Username = ?', [username]);
      return rows[0];
    } catch (error) {
      console.error('Error getting user by username:', error);
      throw error;
    }
  }

  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user (without password)
   */
  static async createUser(userData) {
    try {
      const { username, password } = userData;
      
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const [result] = await pool.query(
        'INSERT INTO User (Username, Password) VALUES (?, ?)',
        [username, hashedPassword]
      );
      
      return this.getUserById(result.insertId);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Update a user
   * @param {number} userId - User ID
   * @param {Object} userData - User data to update
   * @returns {Promise<Object>} Updated user (without password)
   */
  static async updateUser(userId, userData) {
    try {
      const { username, password } = userData;
      
      if (password) {
        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        await pool.query(
          'UPDATE User SET Username = ?, Password = ? WHERE UserID = ?',
          [username, hashedPassword, userId]
        );
      } else {
        await pool.query(
          'UPDATE User SET Username = ? WHERE UserID = ?',
          [username, userId]
        );
      }
      
      return this.getUserById(userId);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Delete a user
   * @param {number} userId - User ID
   * @returns {Promise<boolean>} Success status
   */
  static async deleteUser(userId) {
    try {
      const [result] = await pool.query('DELETE FROM User WHERE UserID = ?', [userId]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  /**
   * Authenticate a user
   * @param {string} username - Username
   * @param {string} password - Password
   * @returns {Promise<Object|null>} User object if authenticated, null otherwise
   */
  static async authenticateUser(username, password) {
    try {
      const user = await this.getUserByUsername(username);
      
      if (!user) {
        return null;
      }
      
      const isPasswordValid = await bcrypt.compare(password, user.Password);
      
      if (!isPasswordValid) {
        return null;
      }
      
      // Return user without password
      return {
        UserID: user.UserID,
        Username: user.Username
      };
    } catch (error) {
      console.error('Error authenticating user:', error);
      throw error;
    }
  }
}

module.exports = UserModel;
