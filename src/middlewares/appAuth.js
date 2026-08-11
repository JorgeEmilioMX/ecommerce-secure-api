const jwt = require('jsonwebtoken');
const env = require('../config/env');

const appAuth = (req, res, next) => {
  const appToken = req.headers['x-app-token'];

  if (!appToken) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Se requiere el encabezado x-app-token de la aplicación.'
    });
  }

  try {
    const decoded = jwt.verify(appToken, env.JWT_APP_SECRET);
    req.appContext = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Token de aplicación inválido o expirado.'
    });
  }
};

module.exports = appAuth;