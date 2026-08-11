const { z } = require('zod');

const orderItemSchema = z.object({
  product: z.string().regex(/^[0-9a-fA-F]{24}$/, "ID de producto inválido"),
  quantity: z.number().int().min(1, "La cantidad mínima debe ser 1")
});

const createOrderSchema = z.object({
  products: z.array(orderItemSchema).min(1, "La orden debe contener al menos un producto")
});

module.exports = {
  createOrderSchema
};