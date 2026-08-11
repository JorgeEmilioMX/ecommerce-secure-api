const app = require('./src/app');
const connectDB = require('./src/config/db');
const env = require('./src/config/env');

const startServer = async () => {
  // 1. Conectar a MongoDB
  await connectDB();

  // 2. Levantar el servidor HTTP
  app.listen(env.PORT, () => {
    console.log(`🚀 Servidor ejecutándose en el puerto ${env.PORT}`);
  });
};

startServer();