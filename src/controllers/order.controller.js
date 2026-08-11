const Order = require('../models/Order');
const Product = require('../models/Product');

// Crear Orden (Cliente realiza compra)
const createOrder = async (req, res, next) => {
  try {
    const { products } = req.body;
    let totalAmount = 0;
    const orderProducts = [];

    for (const item of products) {
      const dbProduct = await Product.findById(item.product);
      if (!dbProduct) {
        return res.status(400).json({
          error: 'BadRequest',
          message: `El producto con ID ${item.product} no existe.`
        });
      }

      if (dbProduct.stock < item.quantity) {
        return res.status(400).json({
          error: 'BadRequest',
          message: `Stock insuficiente para el producto ${dbProduct.title}.`
        });
      }

      const unitPrice = dbProduct.price;
      totalAmount += unitPrice * item.quantity;

      orderProducts.push({
        product: dbProduct._id,
        quantity: item.quantity,
        unitPrice
      });

      // Descontar stock del producto
      dbProduct.stock -= item.quantity;
      await dbProduct.save();
    }

    const order = await Order.create({
      client: req.user.id,
      products: orderProducts,
      totalAmount,
      status: 'Pending'
    });

    res.status(201).json({ message: 'Orden creada exitosamente', order });
  } catch (error) {
    next(error);
  }
};

// Consultar Órdenes (Admin ve todas, Client ve solo las suyas)
const getOrders = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role !== 'Administrator') {
      query.client = req.user.id;
    }

    const orders = await Order.find(query)
      .populate('client', 'name email')
      .populate('products.product', 'title price');

    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// Consultar Orden por ID (Con verificación de permisos)
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('client', 'name email')
      .populate('products.product', 'title price');

    if (!order) {
      return res.status(404).json({ error: 'NotFound', message: 'Orden no encontrada.' });
    }

    // El cliente solo puede ver su propia orden
    if (req.user.role !== 'Administrator' && order.client._id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden', message: 'No tienes permiso para ver esta orden.' });
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
};

// Actualizar Estado de Orden (Solo Administrator)
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ error: 'NotFound', message: 'Orden no encontrada.' });
    }

    res.json({ message: 'Estado de la orden actualizado exitosamente', order });
  } catch (error) {
    next(error);
  }
};

// Eliminar Orden (Solo Administrator)
const deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'NotFound', message: 'Orden no encontrada.' });
    }
    res.json({ message: 'Orden eliminada exitosamente' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder
};