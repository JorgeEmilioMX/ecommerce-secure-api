const { z } = require('zod');

const createProductSchema = z.object({
  title: z.string().trim().min(1, "El título es obligatorio"),
  description: z.string().min(1, "La descripción es obligatoria"),
  price: z.number({ invalid_type_error: "El precio debe ser un número" }).min(0, "El precio no puede ser negativo"),
  stock: z.number({ invalid_type_error: "El stock debe ser un número" }).min(0, "El stock no puede ser negativo"),
  category: z.string().regex(/^[0-9a-fA-F]{24}$/, "ID de categoría inválido (ObjectId)"),
  sku: z.string().trim().min(1, "El SKU es obligatorio")
});

const updateProductSchema = createProductSchema.partial();

module.exports = {
  createProductSchema,
  updateProductSchema
};