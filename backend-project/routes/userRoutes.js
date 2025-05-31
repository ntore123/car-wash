const express = require('express');
const router = express.Router();
const UserModel = require('../models/userModel');
const { isAuthenticated } = require('../middleware/auth');

// Login route
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validate required fields
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide both username and password' 
      });
    }
    
    // Authenticate user
    const user = await UserModel.authenticateUser(username, password);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid username or password' 
      });
    }
    
    // Set user in session
    req.session.userId = user.UserID;
    req.session.username = user.Username;
    
    res.json({ 
      success: true, 
      message: 'Login successful',
      data: user
    });
  } catch (error) {
    console.error('Error in POST /users/login:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Logout route
router.post('/logout', (req, res) => {
  try {
    // Destroy session
    req.session.destroy(err => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Failed to logout' });
      }
      
      res.json({ success: true, message: 'Logout successful' });
    });
  } catch (error) {
    console.error('Error in POST /users/logout:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get current user
router.get('/me', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;
    const user = await UserModel.getUserById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Error in GET /users/me:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all users (admin only)
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const users = await UserModel.getAllUsers();
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Error in GET /users:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create a new user (admin only)
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validate required fields
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide both username and password' 
      });
    }
    
    // Check if user already exists
    const existingUser = await UserModel.getUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username already exists' 
      });
    }
    
    const newUser = await UserModel.createUser({ username, password });
    
    res.status(201).json({ success: true, data: newUser });
  } catch (error) {
    console.error('Error in POST /users:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update a user
router.put('/:userId', isAuthenticated, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const { username, password } = req.body;
    
    if (isNaN(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }
    
    // Validate required fields
    if (!username) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide username' 
      });
    }
    
    // Check if user exists
    const existingUser = await UserModel.getUserById(userId);
    if (!existingUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Check if username is already taken by another user
    if (username !== existingUser.Username) {
      const userWithSameUsername = await UserModel.getUserByUsername(username);
      if (userWithSameUsername && userWithSameUsername.UserID !== userId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Username already exists' 
        });
      }
    }
    
    const updatedUser = await UserModel.updateUser(userId, { username, password });
    
    res.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error(`Error in PUT /users/${req.params.userId}:`, error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete a user (admin only)
router.delete('/:userId', isAuthenticated, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }
    
    // Check if user exists
    const existingUser = await UserModel.getUserById(userId);
    if (!existingUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Prevent deleting the current user
    if (userId === req.session.userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete your own account' 
      });
    }
    
    const deleted = await UserModel.deleteUser(userId);
    
    if (deleted) {
      res.json({ success: true, message: 'User deleted successfully' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to delete user' });
    }
  } catch (error) {
    console.error(`Error in DELETE /users/${req.params.userId}:`, error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Change password
router.post('/change-password', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;
    const { currentPassword, newPassword } = req.body;
    
    // Validate required fields
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide both current password and new password' 
      });
    }
    
    // Get user
    const user = await UserModel.getUserByUsername(req.session.username);
    
    // Verify current password
    const isAuthenticated = await UserModel.authenticateUser(user.Username, currentPassword);
    if (!isAuthenticated) {
      return res.status(401).json({ 
        success: false, 
        message: 'Current password is incorrect' 
      });
    }
    
    // Update password
    await UserModel.updateUser(userId, { 
      username: user.Username, 
      password: newPassword 
    });
    
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error in POST /users/change-password:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
