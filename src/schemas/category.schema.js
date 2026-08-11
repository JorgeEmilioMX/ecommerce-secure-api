const { z } = require('zod');

const createCategorySchema = z.object({
  name: z.string().trim().min(1, "El nombre de la categoría es obligatorio"),
  slug: z.string().toLowerCase().trim().min(1, "El slug es obligatorio"),
  description: z.string().optional()
});

const updateCategorySchema = createCategorySchema.partial();

module.exports = {
  createCategorySchema,
  updateCategorySchema
};