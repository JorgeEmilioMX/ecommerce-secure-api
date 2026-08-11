const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const userAuth = require('../middlewares/userAuth');
const authorizeRoles = require('../middlewares/rbac');
const validateSchema = require('../middlewares/validateSchema');
const { createOrderSchema, updateOrderStatusSchema } = require('../schemas/order.schema');

// Todas las rutas de órdenes requieren User Token
router.use(userAuth);

router.post('/', validateSchema(createOrderSchema), orderController.createOrder);
router.get('/', orderController.getOrders);
router.get('/:id', orderController.getOrderById);
router.patch('/:id/status', authorizeRoles('Administrator'), validateSchema(updateOrderStatusSchema), orderController.updateOrderStatus);
router.delete('/:id', authorizeRoles('Administrator'), orderController.deleteOrder);

module.exports = router;