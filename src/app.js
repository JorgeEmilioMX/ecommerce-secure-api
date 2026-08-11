const express = require('express');
const helmet = require('helmet');

const app = express();

// Middleware de seguridad de HTTP Headers
app.use(helmet()); //

// Middleware para entender JSON en las peticiones
app.use(express.json());

// Ruta base de prueba
app.get('/', (req, res) => {
  res.json({ message: 'API E-Commerce Segura Activa' });
});

module.exports = app;