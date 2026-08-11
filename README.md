# Secure E-Commerce RESTful API

API RESTful segura para una aplicación de comercio electrónico (E-Commerce) desarrollada con el stack **MEN** (MongoDB, Express.js, Node.js)[cite: 1]. Implementa arquitectura de autenticación **Dual-Token**, control de acceso basado en roles (**RBAC**), validación estricta de esquemas (*Fail-Fast*), cifrado de contraseñas y sanitización global de errores[cite: 1].

---

## 🛠️ Tecnologías y Librerías

* **Entorno de Ejecución:** Node.js (v18+ LTS)[cite: 1]
* **Framework Web:** Express.js[cite: 1]
* **Base de Datos & ODM:** MongoDB & Mongoose[cite: 1]
* **Seguridad de Cabeceras HTTP:** Helmet[cite: 1]
* **Autenticación & Tokens:** JSON Web Tokens (`jsonwebtoken`)[cite: 1]
* **Cifrado de Contraseñas:** `bcryptjs` (Factor de costo >= 10)[cite: 1]
* **Validación de Entradas:** Zod[cite: 1]
* **Variables de Entorno:** `dotenv`[cite: 1]

---

## ⚙️ Guía de Despliegue y Configuración Local

### 1. Instalación
Clonar el repositorio e instalar las dependencias:
```bash
git clone [https://github.com/JorgeEmilioMX/ecommerce-secure-api.git](https://github.com/JorgeEmilioMX/ecommerce-secure-api.git)
cd ecommerce-secure-api
npm install
```

### 2. Variables de Entorno
Configura el archivo `.env` en la raíz del proyecto usando `.env.example` como referencia[cite: 1]:

```env
PORT=5100
MONGO_URI="tu_cadena_de_conexion_mongodb"
JWT_APP_SECRET="AppTokenSecretHighEntropyKeyForSecurityProject2026_!"
JWT_USER_SECRET="UserTokenSecretHighEntropyKeyForSecurityProject2026_!"
JWT_EXPIRES_IN=15m
```

> **Nota de Seguridad:** Todos los secretos JWT deben cumplir con una entropía criptográfica de al menos 32 caracteres[cite: 1]. La sesión de usuario expira estrictamente a los 15 minutos (`15m`)[cite: 1].

### 3. Ejecución del Servidor
```bash
# Modo Desarrollo
npm run dev

# Modo Producción
npm start
```

---

## 🔑 Guía de Uso del Sistema Dual-Token

Para interactuar con la API de forma segura, se debe seguir el siguiente flujo de tokens en las cabeceras (headers) de las peticiones:

### Paso 1: Generar el Token de Aplicación (`app-token`)
El cliente (Thunder Client o Frontend) debe realizar una petición `POST` al endpoint público para identificarse como aplicación autorizada:
* **Endpoint:** `POST /api/auth/app-token`
* **Cuerpo (JSON):** Vacío `{}`
* **Resultado:** Recibirás un JSON con la propiedad `appToken`.

### Paso 2: Usar `app-token` en peticiones públicas
Cualquier petición posterior (como registrarse, iniciar sesión o listar productos) requiere que envíes el token obtenido en el paso anterior dentro de las cabeceras:
* **Cabecera obligatoria:** `app-token: <tu_app_token_obtenido>`

### Paso 3: Iniciar Sesión y obtener el Token de Usuario (`user-token`)
Para acceder a rutas protegidas (como perfil, órdenes o administración), primero debes iniciar sesión enviando las credenciales y el token de aplicación:
* **Endpoint:** `POST /api/auth/login`
* **Cabeceras:** `app-token: <tu_app_token>`
* **Cuerpo (JSON):** `{"email": "...", "password": "..."}`
* **Resultado:** Recibirás un JSON con la propiedad `userToken` (con un TTL de 15 minutos).

### Paso 4: Usar ambos tokens en peticiones protegidas
Para consultar tu perfil o realizar órdenes, debes incluir ambas cabeceras en tu petición:
* **Cabecera 1:** `app-token: <tu_app_token>`
* **Cabecera 2:** `user-token: <tu_user_token>`

---

## 📊 Matriz de Endpoints y Control de Acceso (RBAC)

Todas las rutas dentro de `/api` requieren la cabecera `app-token`[cite: 1]. Las rutas protegidas por usuario requieren la cabecera `user-token`[cite: 1].

| Método | Endpoint | Cabeceras Requeridas | Autenticación | Rol Permitido | Descripción |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/app-token` | Ninguna | Pública | Público | Genera el Token de Aplicación (`app-token`)[cite: 1] |
| `POST` | `/api/auth/register` | `app-token` | Pública | Público | Registro de nuevo usuario (Cliente por defecto)[cite: 1] |
| `POST` | `/api/auth/login` | `app-token` | Pública | Público | Autenticación de usuario (Retorna `userToken`)[cite: 1] |
| `GET` | `/api/auth/profile` | `app-token`, `user-token` | User JWT | Todos | Consulta el perfil del usuario autenticado[cite: 1] |
| `PUT` | `/api/auth/profile` | `app-token`, `user-token` | User JWT | Todos | Actualiza el nombre del usuario autenticado[cite: 1] |
| `GET` | `/api/categories` | `app-token` | Pública | Público | Listar todas las categorías del catálogo[cite: 1] |
| `GET` | `/api/categories/:id` | `app-token` | Pública | Público | Consultar detalles de una categoría[cite: 1] |
| `POST` | `/api/categories` | `app-token`, `user-token` | User JWT | `Administrator` | Crear una nueva categoría[cite: 1] |
| `PUT` | `/api/categories/:id` | `app-token`, `user-token` | User JWT | `Administrator` | Actualizar una categoría existente[cite: 1] |
| `DELETE`| `/api/categories/:id` | `app-token`, `user-token` | User JWT | `Administrator` | Eliminar una categoría[cite: 1] |
| `GET` | `/api/products` | `app-token` | Pública | Público | Listar todos los productos del catálogo[cite: 1] |
| `GET` | `/api/products/:id` | `app-token` | Pública | Público | Consultar detalles de un producto[cite: 1] |
| `POST` | `/api/products` | `app-token`, `user-token` | User JWT | `Administrator` | Crear un nuevo producto en inventario[cite: 1] |
| `PUT` | `/api/products/:id` | `app-token`, `user-token` | User JWT | `Administrator` | Actualizar datos/stock de un producto[cite: 1] |
| `DELETE`| `/api/products/:id` | `app-token`, `user-token` | User JWT | `Administrator` | Eliminar un producto[cite: 1] |
| `POST` | `/api/orders` | `app-token`, `user-token` | User JWT | `Client` / `Administrator` | Crear una orden de compra[cite: 1] |
| `GET` | `/api/orders` | `app-token`, `user-token` | User JWT | Todos | Admin ve todas; Client ve solo sus órdenes[cite: 1] |
| `GET` | `/api/orders/:id` | `app-token`, `user-token` | User JWT | Todos | Admin ve cualquiera; Client ve solo la suya[cite: 1] |
| `PATCH`| `/api/orders/:id/status`| `app-token`, `user-token` | User JWT | `Administrator` | Cambiar el estado de la orden[cite: 1] |
| `DELETE`| `/api/orders/:id` | `app-token`, `user-token` | User JWT | `Administrator` | Eliminar una orden[cite: 1] |

---

## 🔒 Políticas de Seguridad Enforzadas

1. **Dual-Token Architecture:** Separación entre token de aplicación consumidora (`app-token`) y token de sesión de usuario (`user-token`)[cite: 1].
2. **Password Complexity:** Expresión regular que exige mínimo 10 caracteres, 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial (`@$!%*?&`)[cite: 1].
3. **Fail-Fast Startup:** Validación de variables de entorno con Zod al iniciar el servidor[cite: 1].
4. **Error Sanitization:** Enmascaramiento global de trazas de pila (*stack traces*) e información interna del motor de base de datos en respuestas de cliente[cite: 1].