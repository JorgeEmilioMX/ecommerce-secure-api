# Secure E-Commerce RESTful API

API RESTful segura para una aplicación de comercio electrónico desarrollada con el stack **MEN** (MongoDB, Express.js, Node.js). Implementa arquitectura de autenticación **Dual-Token**, control de acceso basado en roles (**RBAC**), validación estricta de esquemas (*Fail-Fast*), cifrado de contraseñas y sanitización global de errores.

---

## 🛠️ Tecnologías y Librerías

| Tecnología | Descripción |
|:---|:---|
| Node.js (v18+ LTS) | Entorno de ejecución |
| Express.js | Framework web |
| MongoDB & Mongoose | Base de datos y ODM |
| Helmet | Seguridad de cabeceras HTTP |
| `jsonwebtoken` | Autenticación & tokens JWT |
| `bcryptjs` | Cifrado de contraseñas (factor de costo ≥ 10) |
| Zod | Validación de entradas |
| `dotenv` | Variables de entorno |

---

## ⚙️ Guía de Despliegue y Configuración Local

### Paso 1 — Clonar el repositorio

```bash
git clone https://github.com/JorgeEmilioMX/ecommerce-secure-api.git
cd ecommerce-secure-api
```

### Paso 2 — Instalar dependencias

```bash
npm install
```

### Paso 3 — Configurar variables de entorno

Copia el archivo de ejemplo y edítalo con tus valores:

```bash
cp .env.example .env
```

Abre `.env` y rellena cada variable:

```env
PORT=5100
MONGO_URI="mongodb://localhost:27017/ecommerce_db"
JWT_APP_SECRET="AppTokenSecretHighEntropyKeyForSecurityProject2026_!"
JWT_USER_SECRET="UserTokenSecretHighEntropyKeyForSecurityProject2026_!"
JWT_EXPIRES_IN=15m
```

| Variable | Descripción | Ejemplo |
|:---|:---|:---|
| `PORT` | Puerto en el que escucha el servidor | `5100` |
| `MONGO_URI` | Cadena de conexión a MongoDB (local o Atlas) | `mongodb://localhost:27017/ecommerce_db` |
| `JWT_APP_SECRET` | Secreto para firmar el `app-token`. **Mínimo 32 caracteres.** | `AppTokenSecret...2026_!` |
| `JWT_USER_SECRET` | Secreto para firmar el `user-token`. **Mínimo 32 caracteres.** | `UserTokenSecret...2026_!` |
| `JWT_EXPIRES_IN` | Tiempo de vida del `user-token` | `15m` |

> **⚠️ Seguridad:** Nunca subas el archivo `.env` al repositorio. Está incluido en `.gitignore`.

### Paso 4 — Arrancar el servidor

```bash
# Modo desarrollo (con recarga automática)
npm run dev

# Modo producción
npm start
```

El servidor estará disponible en: `http://localhost:5100`

Confirma que arrancó correctamente viendo en consola:

```
✅ MongoDB connected
🚀 Server running on port 5100
```

---

## 📊 Matriz de Endpoints y Control de Acceso (RBAC)

Todas las rutas dentro de `/api` requieren la cabecera `app-token`. Las rutas protegidas por usuario requieren además la cabecera `user-token`.

| Método | Endpoint | `app-token` | `user-token` | Rol Requerido | Descripción |
|:---:|:---|:---:|:---:|:---:|:---|
| `POST` | `/api/auth/app-token` | ✗ | ✗ | Público | Genera el Token de Aplicación |
| `POST` | `/api/auth/register` | ✓ | ✗ | Público | Registro de nuevo usuario |
| `POST` | `/api/auth/login` | ✓ | ✗ | Público | Autenticación → devuelve `userToken` |
| `GET` | `/api/auth/profile` | ✓ | ✓ | Todos | Ver perfil del usuario autenticado |
| `PUT` | `/api/auth/profile` | ✓ | ✓ | Todos | Actualizar nombre del usuario |
| `GET` | `/api/categories` | ✓ | ✗ | Público | Listar todas las categorías |
| `GET` | `/api/categories/:id` | ✓ | ✗ | Público | Ver detalle de una categoría |
| `POST` | `/api/categories` | ✓ | ✓ | `Administrator` | Crear nueva categoría |
| `PUT` | `/api/categories/:id` | ✓ | ✓ | `Administrator` | Actualizar categoría |
| `DELETE` | `/api/categories/:id` | ✓ | ✓ | `Administrator` | Eliminar categoría |
| `GET` | `/api/products` | ✓ | ✗ | Público | Listar todos los productos |
| `GET` | `/api/products/:id` | ✓ | ✗ | Público | Ver detalle de un producto |
| `POST` | `/api/products` | ✓ | ✓ | `Administrator` | Crear nuevo producto |
| `PUT` | `/api/products/:id` | ✓ | ✓ | `Administrator` | Actualizar producto |
| `DELETE` | `/api/products/:id` | ✓ | ✓ | `Administrator` | Eliminar producto |
| `POST` | `/api/orders` | ✓ | ✓ | `Client` / `Administrator` | Crear orden de compra |
| `GET` | `/api/orders` | ✓ | ✓ | Todos | Admin: todas; Client: solo las suyas |
| `GET` | `/api/orders/:id` | ✓ | ✓ | Todos | Admin: cualquiera; Client: solo la suya |
| `PATCH` | `/api/orders/:id/status` | ✓ | ✓ | `Administrator` | Cambiar estado de la orden |
| `DELETE` | `/api/orders/:id` | ✓ | ✓ | `Administrator` | Eliminar orden |

---

## 🔑 Guía Paso a Paso — Flujo Completo de Uso

> Usa **Thunder Client**, **Postman** o cualquier cliente HTTP. La URL base para todos los ejemplos es `http://localhost:5100`.

---

### PASO 0 — Obtener el App Token (obligatorio antes de cualquier otra llamada)

Antes de cualquier petición debes obtener el token de aplicación. Este identifica al cliente consumidor de la API.

| Campo | Valor |
|:---|:---|
| Método | `POST` |
| URL | `http://localhost:5100/api/auth/app-token` |
| Headers | *(ninguno)* |
| Body | *(vacío)* |

```json
{}
```

**Respuesta exitosa (200):**

```json
{
  "appToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

> 📌 **Guarda este valor.** Lo usarás como cabecera `app-token` en **todas** las peticiones siguientes.

---

### PASO 1 — Registrar un nuevo usuario

Crea una cuenta de usuario. Por defecto el rol asignado es `Client`.

| Campo | Valor |
|:---|:---|
| Método | `POST` |
| URL | `http://localhost:5100/api/auth/register` |
| Header | `app-token: <appToken del Paso 0>` |
| Body (JSON) | Ver abajo |

**Body — Registro de Cliente (rol por defecto):**

```json
{
  "name": "Juan Pérez",
  "email": "juan.perez@email.com",
  "password": "MiPassword@2024"
}
```

**Body — Registro de Administrador:**

```json
{
  "name": "Admin Principal",
  "email": "admin@ecommerce.com",
  "password": "AdminPass@2024",
  "role": "Administrator"
}
```

| Campo | Tipo | Obligatorio | Restricciones |
|:---|:---|:---:|:---|
| `name` | `string` | ✓ | Mínimo 1 carácter |
| `email` | `string` | ✓ | Formato email válido |
| `password` | `string` | ✓ | Mín. 10 chars, 1 mayúscula, 1 minúscula, 1 número, 1 especial (`@$!%*?&`) |
| `role` | `string` | ✗ | `"Client"` (default) o `"Administrator"` |

**Respuesta exitosa (201):**

```json
{
  "message": "Usuario registrado exitosamente",
  "user": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "name": "Juan Pérez",
    "email": "juan.perez@email.com",
    "role": "Client"
  }
}
```

**Error — contraseña débil (400):**

```json
{
  "message": "La contraseña debe tener mínimo 10 caracteres, incluir al menos 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial (@$!%*?&)"
}
```

---

### PASO 2 — Iniciar sesión (Login)

Autentica al usuario y obtén el `userToken` para acceder a rutas protegidas.

| Campo | Valor |
|:---|:---|
| Método | `POST` |
| URL | `http://localhost:5100/api/auth/login` |
| Header | `app-token: <appToken del Paso 0>` |
| Body (JSON) | Ver abajo |

**Body:**

```json
{
  "email": "juan.perez@email.com",
  "password": "MiPassword@2024"
}
```

| Campo | Tipo | Obligatorio |
|:---|:---|:---:|
| `email` | `string` | ✓ |
| `password` | `string` | ✓ |

**Respuesta exitosa (200):**

```json
{
  "message": "Login exitoso",
  "userToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

> 📌 **Guarda este valor.** Lo usarás como cabecera `user-token` en todas las peticiones protegidas. **Expira en 15 minutos.**

**Error — credenciales inválidas (401):**

```json
{
  "message": "Credenciales inválidas"
}
```

---

### PASO 3 — Consultar perfil del usuario autenticado

| Campo | Valor |
|:---|:---|
| Método | `GET` |
| URL | `http://localhost:5100/api/auth/profile` |
| Header 1 | `app-token: <appToken>` |
| Header 2 | `user-token: <userToken del Paso 2>` |
| Body | *(ninguno)* |

**Respuesta exitosa (200):**

```json
{
  "user": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "name": "Juan Pérez",
    "email": "juan.perez@email.com",
    "role": "Client"
  }
}
```

---

### PASO 4 — Actualizar el nombre del perfil

| Campo | Valor |
|:---|:---|
| Método | `PUT` |
| URL | `http://localhost:5100/api/auth/profile` |
| Header 1 | `app-token: <appToken>` |
| Header 2 | `user-token: <userToken>` |
| Body (JSON) | Ver abajo |

**Body:**

```json
{
  "name": "Juan Pérez Actualizado"
}
```

---

### PASO 5 — Crear una Categoría *(requiere rol Administrator)*

| Campo | Valor |
|:---|:---|
| Método | `POST` |
| URL | `http://localhost:5100/api/categories` |
| Header 1 | `app-token: <appToken>` |
| Header 2 | `user-token: <userToken de Admin>` |
| Body (JSON) | Ver abajo |

**Body:**

```json
{
  "name": "Electrónica",
  "slug": "electronica",
  "description": "Dispositivos y accesorios electrónicos"
}
```

| Campo | Tipo | Obligatorio | Restricciones |
|:---|:---|:---:|:---|
| `name` | `string` | ✓ | Mínimo 1 carácter |
| `slug` | `string` | ✓ | Minúsculas, sin espacios |
| `description` | `string` | ✗ | Texto libre |

**Respuesta exitosa (201):**

```json
{
  "message": "Categoría creada",
  "category": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d2",
    "name": "Electrónica",
    "slug": "electronica",
    "description": "Dispositivos y accesorios electrónicos"
  }
}
```

**Error — sin permisos (403):**

```json
{
  "message": "Acceso denegado. Se requiere rol Administrator."
}
```

---

### PASO 6 — Listar y Consultar Categorías

**Listar todas las categorías:**

| Campo | Valor |
|:---|:---|
| Método | `GET` |
| URL | `http://localhost:5100/api/categories` |
| Header | `app-token: <appToken>` |
| Body | *(ninguno)* |

**Consultar una categoría por ID:**

| Campo | Valor |
|:---|:---|
| Método | `GET` |
| URL | `http://localhost:5100/api/categories/64f1a2b3c4d5e6f7a8b9c0d2` |
| Header | `app-token: <appToken>` |
| Body | *(ninguno)* |

---

### PASO 7 — Actualizar una Categoría *(requiere rol Administrator)*

| Campo | Valor |
|:---|:---|
| Método | `PUT` |
| URL | `http://localhost:5100/api/categories/<id>` |
| Header 1 | `app-token: <appToken>` |
| Header 2 | `user-token: <userToken de Admin>` |
| Body (JSON) | Ver abajo |

**Body (todos los campos son opcionales en actualización):**

```json
{
  "name": "Electrónica y Gadgets",
  "description": "Descripción actualizada"
}
```

---

### PASO 8 — Eliminar una Categoría *(requiere rol Administrator)*

| Campo | Valor |
|:---|:---|
| Método | `DELETE` |
| URL | `http://localhost:5100/api/categories/<id>` |
| Header 1 | `app-token: <appToken>` |
| Header 2 | `user-token: <userToken de Admin>` |
| Body | *(ninguno)* |

**Respuesta exitosa (200):**

```json
{
  "message": "Categoría eliminada correctamente"
}
```

---

### PASO 9 — Crear un Producto *(requiere rol Administrator)*

> ⚠️ Necesitas el `_id` de una categoría existente (Paso 5).

| Campo | Valor |
|:---|:---|
| Método | `POST` |
| URL | `http://localhost:5100/api/products` |
| Header 1 | `app-token: <appToken>` |
| Header 2 | `user-token: <userToken de Admin>` |
| Body (JSON) | Ver abajo |

**Body:**

```json
{
  "title": "Laptop Gaming Pro",
  "description": "Laptop de alto rendimiento con GPU RTX 4070",
  "price": 25999.99,
  "stock": 10,
  "category": "64f1a2b3c4d5e6f7a8b9c0d2",
  "sku": "LPT-GAMING-001"
}
```

| Campo | Tipo | Obligatorio | Restricciones |
|:---|:---|:---:|:---|
| `title` | `string` | ✓ | Mínimo 1 carácter |
| `description` | `string` | ✓ | Mínimo 1 carácter |
| `price` | `number` | ✓ | ≥ 0 |
| `stock` | `number` | ✓ | Entero ≥ 0 |
| `category` | `string` | ✓ | ObjectId de MongoDB (24 hex chars) |
| `sku` | `string` | ✓ | Identificador único del producto |

**Respuesta exitosa (201):**

```json
{
  "message": "Producto creado",
  "product": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d3",
    "title": "Laptop Gaming Pro",
    "description": "Laptop de alto rendimiento con GPU RTX 4070",
    "price": 25999.99,
    "stock": 10,
    "category": "64f1a2b3c4d5e6f7a8b9c0d2",
    "sku": "LPT-GAMING-001"
  }
}
```

---

### PASO 10 — Listar y Consultar Productos

**Listar todos los productos:**

| Campo | Valor |
|:---|:---|
| Método | `GET` |
| URL | `http://localhost:5100/api/products` |
| Header | `app-token: <appToken>` |
| Body | *(ninguno)* |

**Consultar un producto por ID:**

| Campo | Valor |
|:---|:---|
| Método | `GET` |
| URL | `http://localhost:5100/api/products/64f1a2b3c4d5e6f7a8b9c0d3` |
| Header | `app-token: <appToken>` |
| Body | *(ninguno)* |

---

### PASO 11 — Actualizar un Producto *(requiere rol Administrator)*

| Campo | Valor |
|:---|:---|
| Método | `PUT` |
| URL | `http://localhost:5100/api/products/<id>` |
| Header 1 | `app-token: <appToken>` |
| Header 2 | `user-token: <userToken de Admin>` |
| Body (JSON) | Ver abajo |

**Body (todos los campos son opcionales en actualización):**

```json
{
  "price": 23999.99,
  "stock": 8
}
```

---

### PASO 12 — Eliminar un Producto *(requiere rol Administrator)*

| Campo | Valor |
|:---|:---|
| Método | `DELETE` |
| URL | `http://localhost:5100/api/products/<id>` |
| Header 1 | `app-token: <appToken>` |
| Header 2 | `user-token: <userToken de Admin>` |
| Body | *(ninguno)* |

---

### PASO 13 — Crear una Orden de Compra *(requiere rol Client o Administrator)*

> ⚠️ Necesitas el `_id` de al menos un producto existente (Paso 9).

| Campo | Valor |
|:---|:---|
| Método | `POST` |
| URL | `http://localhost:5100/api/orders` |
| Header 1 | `app-token: <appToken>` |
| Header 2 | `user-token: <userToken>` |
| Body (JSON) | Ver abajo |

**Body:**

```json
{
  "products": [
    {
      "product": "64f1a2b3c4d5e6f7a8b9c0d3",
      "quantity": 2
    },
    {
      "product": "64f1a2b3c4d5e6f7a8b9c0d4",
      "quantity": 1
    }
  ]
}
```

| Campo | Tipo | Obligatorio | Restricciones |
|:---|:---|:---:|:---|
| `products` | `array` | ✓ | Al menos 1 elemento |
| `products[].product` | `string` | ✓ | ObjectId de MongoDB (24 hex chars) |
| `products[].quantity` | `number` | ✓ | Entero ≥ 1 |

**Respuesta exitosa (201):**

```json
{
  "message": "Orden creada",
  "order": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d5",
    "user": "64f1a2b3c4d5e6f7a8b9c0d1",
    "products": [
      { "product": "64f1a2b3c4d5e6f7a8b9c0d3", "quantity": 2 }
    ],
    "status": "Pending",
    "createdAt": "2026-08-12T14:00:00.000Z"
  }
}
```

---

### PASO 14 — Listar y Consultar Órdenes

- Si el usuario es **Client**: solo verá sus propias órdenes.
- Si el usuario es **Administrator**: verá todas las órdenes.

**Listar órdenes:**

| Campo | Valor |
|:---|:---|
| Método | `GET` |
| URL | `http://localhost:5100/api/orders` |
| Header 1 | `app-token: <appToken>` |
| Header 2 | `user-token: <userToken>` |
| Body | *(ninguno)* |

**Consultar una orden por ID:**

| Campo | Valor |
|:---|:---|
| Método | `GET` |
| URL | `http://localhost:5100/api/orders/64f1a2b3c4d5e6f7a8b9c0d5` |
| Header 1 | `app-token: <appToken>` |
| Header 2 | `user-token: <userToken>` |
| Body | *(ninguno)* |

---

### PASO 15 — Cambiar Estado de una Orden *(requiere rol Administrator)*

| Campo | Valor |
|:---|:---|
| Método | `PATCH` |
| URL | `http://localhost:5100/api/orders/<id>/status` |
| Header 1 | `app-token: <appToken>` |
| Header 2 | `user-token: <userToken de Admin>` |
| Body (JSON) | Ver abajo |

**Body:**

```json
{
  "status": "Processing"
}
```

| Valor de `status` | Descripción |
|:---|:---|
| `"Pending"` | Orden recibida, pendiente de procesar |
| `"Processing"` | En proceso de preparación |
| `"Completed"` | Entregada al cliente |
| `"Cancelled"` | Cancelada |

**Respuesta exitosa (200):**

```json
{
  "message": "Estado de la orden actualizado",
  "order": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d5",
    "status": "Processing"
  }
}
```

---

### PASO 16 — Eliminar una Orden *(requiere rol Administrator)*

| Campo | Valor |
|:---|:---|
| Método | `DELETE` |
| URL | `http://localhost:5100/api/orders/<id>` |
| Header 1 | `app-token: <appToken>` |
| Header 2 | `user-token: <userToken de Admin>` |
| Body | *(ninguno)* |

---

## 🚫 Casos de Rechazo — Evidencia de Seguridad

Estos casos **deben incluirse** en la colección de Thunder Client / Postman para demostrar compliance:

### Contraseña débil en registro (400)

`POST /api/auth/register` con:

```json
{
  "name": "Test",
  "email": "test@test.com",
  "password": "12345"
}
```

Respuesta esperada:

```json
{
  "message": "La contraseña debe tener mínimo 10 caracteres, incluir al menos 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial (@$!%*?&)"
}
```

### Token de aplicación ausente (401/403)

`GET /api/products` **sin** la cabecera `app-token`.

Respuesta esperada:

```json
{
  "message": "App token requerido"
}
```

### Token de usuario expirado o inválido (401)

Cualquier ruta protegida con un `user-token` vencido o manipulado.

Respuesta esperada:

```json
{
  "message": "Token inválido o expirado"
}
```

### Acceso sin privilegios de Administrator (403)

`POST /api/categories` con `user-token` de un usuario `Client`.

Respuesta esperada:

```json
{
  "message": "Acceso denegado. Se requiere rol Administrator."
}
```

---

## 🔒 Políticas de Seguridad Enforzadas

1. **Dual-Token Architecture:** Separación entre token de aplicación consumidora (`app-token`) y token de sesión de usuario (`user-token`).
2. **Password Complexity:** Regex que exige mínimo 10 caracteres, 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial (`@$!%*?&`).
3. **Fail-Fast Startup:** Validación de variables de entorno con Zod al iniciar el servidor. Si falta alguna variable crítica, el proceso no arranca.
4. **Error Sanitization:** Enmascaramiento global de stack traces e información interna del motor de base de datos en respuestas al cliente.
5. **RBAC estricto:** Cada endpoint valida el rol del usuario antes de ejecutar la operación.