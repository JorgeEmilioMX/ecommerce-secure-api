const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const userAuth = require('../middlewares/userAuth');
const authorizeRoles = require('../middlewares/rbac');
const validateSchema = require('../middlewares/validateSchema');
const { createProductSchema, updateProductSchema } = require('../schemas/product.schema');

// Lectura Pública
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

// Operaciones Protegidas (Solo Administrator)
router.post('/', userAuth, authorizeRoles('Administrator'), validateSchema(createProductSchema), productController.createProduct);
router.put('/:id', userAuth, authorizeRoles('Administrator'), validateSchema(updateProductSchema), productController.updateProduct);
router.delete('/:id', userAuth, authorizeRoles('Administrator'), productController.deleteProduct);

module.exports = router;