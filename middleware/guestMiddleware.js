const checkGuestPermissions = (req, res, next) => {
  const userRole = req.headers['x-user-role'];
  const method = req.method.toLowerCase();
  
  console.log('Guest middleware - Role:', userRole, 'Method:', method);
  
  if (userRole === 'guest' && ['post', 'put', 'delete', 'patch'].includes(method)) {
    console.log('Blocking guest request');
    return res.status(403).json({ 
      error: 'You only have authority to view. Contact admin for modifications.' 
    });
  }
  
  next();
};

module.exports = checkGuestPermissions;