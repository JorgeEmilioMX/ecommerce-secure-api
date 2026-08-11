const jwt = require('jsonwebtoken');
const env = require('../config/env');

const userAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Token de sesión de usuario no proporcionado.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.JWT_USER_SECRET);
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