const { z } = require('zod');

// Regex estricto especificado en la guía del proyecto
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/;

const registerSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio"),
  email: z.string().email("Formato de correo inválido").toLowerCase().trim(),
  password: z.string().refine(
    (val) => passwordRegex.test(val),
    {
      message: "La contraseña debe tener mínimo 10 caracteres, incluir al menos 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial (@$!%*?&)"
    }
  ),
  role: z.enum(['Administrator', 'Client']).optional().default('Client')
});

const loginSchema = z.object({
  email: z.string().email("Formato de correo inválido").toLowerCase().trim(),
  password: z.string().min(1, "La contraseña es obligatoria")
});

const updateProfileSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio")
});

module.exports = {
  registerSchema,
  loginSchema,
  updateProfileSchema
};