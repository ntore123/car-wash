/**
 * Authentication middleware to protect routes
 */
function isAuthenticated(req, res, next) {
  // Check if user is authenticated via session
  if (req.session && req.session.userId) {
    return next();
  }
  
  // If not authenticated, return 401 Unauthorized
  return res.status(401).json({ 
    success: false, 
    message: 'Authentication required' 
  });
}

module.exports = {
  isAuthenticated
};
