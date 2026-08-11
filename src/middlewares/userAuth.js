const jwt = require('jsonwebtoken');
const env = require('../config/env');

const userAuth = (req, res, next) => {
  // Acepta user-token (o x-user-token por compatibilidad)
  const userToken = req.headers['user-token'] || req.headers['x-user-token'];

  if (!userToken) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Token de sesión de usuario no proporcionado en la cabecera (user-token).'
    });
  }

  try {
    const decoded = jwt.verify(userToken, env.JWT_USER_SECRET);
    req.user = {
      id: decoded.sub,
      role: decoded.role
    };
    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Token de sesión inválido o expirado (duración máxima 15 minutos).'
    });
  }
};

module.exports = userAuth;