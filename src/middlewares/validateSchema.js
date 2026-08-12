const validateSchema = (schema) => async (req, res, next) => {
  try {
    req.body = await schema.parseAsync(req.body);
    next();
  } catch (error) {
    if (error.issues) {
      return res.status(400).json({
        error: "Error de Validación de Entrada",
        details: error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }
    next(error);
  }
};

module.exports = validateSchema;