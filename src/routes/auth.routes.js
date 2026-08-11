const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const validateSchema = require('../middlewares/validateSchema');
const userAuth = require('../middlewares/userAuth');
const { registerSchema, loginSchema, updateProfileSchema } = require('../schemas/auth.schema');

// Registro y Login
router.post('/register', validateSchema(registerSchema), authController.register);
router.post('/login', validateSchema(loginSchema), authController.login);

// Rutas de perfil protegidas por User Token
router.get('/profile', userAuth, authController.getProfile);
router.put('/profile', userAuth, validateSchema(updateProfileSchema), authController.updateProfile);

module.exports = router;