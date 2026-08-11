const express = require('express');
const helmet = require('helmet');
const appAuth = require('./middlewares/appAuth');
const errorHandler = require('./middlewares/errorHandler');
const { generateAppToken } = require('./controllers/auth.controller');

// Importar Rutas
const authRoutes = require('./routes/auth.routes');
const categoryRoutes = require('./routes/category.routes');
const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');

const app = express();

// Middleware de Seguridad HTTP Headers
app.use(helmet());

// Parser de JSON
app.use(express.json());

// Ruta Base Pública (Para verificar estatus)
app.get('/', (req, res) => {
  res.json({ message: 'API E-Commerce Segura Activa' });
});

// Endpoint público para obtener el App Token (bypasses appAuth)
app.post('/api/auth/app-token', generateAppToken);

// A partir de aquí, TODAS las rutas requieren App Token (x-app-token)
app.use('/api', appAuth);

// Registrar Rutas Protegidas a Nivel de Aplicación
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Middleware Global de Errores (Sanitizador)
app.use(errorHandler);

module.exports = app;