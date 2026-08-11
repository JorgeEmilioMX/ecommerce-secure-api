const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const userAuth = require('../middlewares/userAuth');
const authorizeRoles = require('../middlewares/rbac');
const validateSchema = require('../middlewares/validateSchema');
const { createCategorySchema, updateCategorySchema } = require('../schemas/category.schema');

// Lectura Pública
router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategoryById);

// Operaciones Protegidas (Solo Administrator)
router.post('/', userAuth, authorizeRoles('Administrator'), validateSchema(createCategorySchema), categoryController.createCategory);
router.put('/:id', userAuth, authorizeRoles('Administrator'), validateSchema(updateCategorySchema), categoryController.updateCategory);
router.delete('/:id', userAuth, authorizeRoles('Administrator'), categoryController.deleteCategory);

module.exports = router;