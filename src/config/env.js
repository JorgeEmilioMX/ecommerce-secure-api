const { z } = require('zod');
require('dotenv').config();

const envSchema = z.object({
  PORT: z.string().default('5000'),
  MONGO_URI: z.string().min(1, "MONGO_URI es requerida"),
  JWT_APP_SECRET: z.string().min(32, "JWT_APP_SECRET debe tener al menos 32 caracteres"),
  JWT_USER_SECRET: z.string().min(32, "JWT_USER_SECRET debe tener al menos 32 caracteres"),
  JWT_EXPIRES_IN: z.string().default('15m')
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("❌ Error grave en Variables de Entorno:");
  console.error(_env.error.format());
  process.exit(1); // Detiene la ejecución si falta alguna variable
}

module.exports = _env.data;