const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const env = require('../config/env');

// Generar App JWT para el cliente consumible (Thunder Client / Frontend)
const generateAppToken = async (req, res, next) => {
  try {
    const appToken = jwt.sign(
      { clientApp: 'EcommerceConsumerApp', version: '1.0.0' },
      env.JWT_APP_SECRET
    );
    res.json({
      message: 'App Token generado exitosamente',
      appToken
    });
  } catch (error) {
    next(error);
  }
};

// Registro de Usuario
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        error: 'BadRequest',
        message: 'El correo electrónico ya está registrado.'
      });
    }

    // Hash de la contraseña con bcrypt (cost factor >= 10)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'Client'
    });

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// Inicio de Sesión (Genera User JWT con TTL de 15m)
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Credenciales inválidas.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Credenciales inválidas.'
      });
    }

    // Token de identidad de usuario (Contiene sub y role)
    const userToken = jwt.sign(
      { sub: user._id, role: user.role },
      env.JWT_USER_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN } // 15 minutos
    );

    res.json({
      message: 'Autenticación exitosa',
      userToken,
      expiresIn: env.JWT_EXPIRES_IN,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// Obtener Perfil del Usuario Autenticado
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'NotFound', message: 'Usuario no encontrado.' });
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// Actualizar Perfil Propio (Cliente o Admin)
const updateProfile = async (req, res, next) => {
  try {
    const { name } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Perfil actualizado correctamente',
      user
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateAppToken,
  register,
  login,
  getProfile,
  updateProfile
};