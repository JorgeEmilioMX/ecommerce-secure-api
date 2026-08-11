const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'No tienes los permisos necesarios para realizar esta acción.'
      });
    }
    next();
  };
};

module.exports = authorizeRoles;