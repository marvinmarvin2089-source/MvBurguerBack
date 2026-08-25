import * as Yup from 'yup';
import Category from '../models/Category.js';
import Product from '../models/Product.js';

class CategoryController {
  async store(request, response) {
    const schema = Yup.object({
      name: Yup.string().required(),
    });

    try {
      await schema.validate(request.body, {});
    } catch (err) {
      return response.status(400).json({ message: err.errors });
    }

    const { name } = request.body;

    if (!request.file) {
      return response.status(400).json({ message: 'Image is required' });
    }

    const { filename } = request.file;

    const existingCategory = await Category.findOne({ where: { name } });

    if (existingCategory) {
      return response.status(400).json({ message: 'Category already exists' });
    }

    const newCategory = await Category.create({
      name,
      path: filename,
    });

    return response.status(201).json(newCategory);
  }

  async update(request, response) {
    const schema = Yup.object({
      name: Yup.string(),
    });

    try {
      await schema.validate(request.body, {});
    } catch (err) {
      return response.status(400).json({ message: err.errors });
    }

    const { name } = request.body;
    const { id } = request.params;

    let path;

    if (request.file) {
      const { filename } = request.file;
      path = filename;
    }

    const category = await Category.findByPk(id);

    if (!category) {
      return response.status(404).json({
        message: 'Categoria não encontrada',
      });
    }

    const existingCategory = name
      ? await Category.findOne({ where: { name } })
      : null;

    if (existingCategory && existingCategory.id !== Number(id)) {
      return response.status(400).json({
        message: 'Category already exists',
      });
    }

    await category.update({
      ...(name && { name }),
      ...(path && { path }),
    });

    return response.status(200).json(category);
  }

  async index(_request, response) {
    const categories = await Category.findAll();

    return response.status(200).json(categories);
  }

  async delete(request, response) {
    const { id } = request.params;

    // 1. verifica se existe
    const category = await Category.findByPk(id);

    if (!category) {
      return response.status(404).json({
        message: 'Categoria não encontrada',
      });
    }

    // 2. verifica se tem produtos
    const hasProducts = await Product.findOne({
      where: { category_id: id },
    });

    if (hasProducts) {
      return response.status(400).json({
        message: 'Não é possível deletar categoria com produtos',
      });
    }

    // 3. deletar
    await category.destroy();

    return response.status(204).json(); // sem conteúdo
  }
}

export default new CategoryController();
