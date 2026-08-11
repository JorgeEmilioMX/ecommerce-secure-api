const errorHandler = (err, req, res, next) => {
  // Manejo de error por llave duplicada en MongoDB (ej. email o SKU duplicado)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      error: "Recurso duplicado",
      message: `El campo '${field}' ya existe en el sistema.`
    });
  }

  // Respuesta sanitizada y segura (sin stack trace interno)
  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    error: statusCode === 500 ? "Error Interno del Servidor" : err.name,
    message: statusCode === 500 ? "Ocurrió un error inesperado en el servidor." : err.message
  });
};

module.exports = errorHandler;