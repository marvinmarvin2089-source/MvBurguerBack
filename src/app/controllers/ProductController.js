import * as Yup from 'yup';
import Product from '../models/Product.js';
import Category from '../models/Category.js';

class ProductController {
  async store(request, response) {
    const schema = Yup.object({
      name: Yup.string().required(),
      price: Yup.number().required(),
      category_id: Yup.number()
        .typeError('category_id precisa ser um número')
        .required(),
      offer: Yup.boolean(),
    });

    try {
      // ✅ 1. valida body
      await schema.validate(request.body, {
        abortEarly: false,
      });

      // ✅ 2. valida imagem
      if (!request.file) {
        return response.status(400).json({
          message: 'Imagem é obrigatória',
        });
      }

      // ✅ 3. pega dados
      const { name, price, category_id, offer } = request.body;

      // ✅ 4. verifica categoria
      const categoryExists = await Category.findByPk(category_id);

      if (!categoryExists) {
        return response.status(400).json({
          message: 'Categoria não existe',
        });
      }

      // ✅ 5. cria produto
      const filename = request.file.filename;

      const newProduct = await Product.create({
        name,
        price: Number(price),
        category_id,
        path: filename,
        offer,
      });

      return response.status(201).json(newProduct);
    } catch (err) {
      return response.status(400).json({
        error: err.errors || err.message,
      });
    }
  }

  async update(request, response) {
    const schema = Yup.object({
      name: Yup.string(),
      price: Yup.number(),
      category_id: Yup.number().typeError('category_id precisa ser um número'),
      offer: Yup.boolean(),
    });

    try {
      await schema.validate(request.body, {
        abortEarly: false,
      });

      const { name, price, category_id, offer } = request.body;
      const { id } = request.params;

      const product = await Product.findByPk(id);

      if (!product) {
        return response.status(404).json({
          message: 'Produto não encontrado',
        });
      }

      // valida categoria (se vier)
      if (category_id) {
        const categoryExists = await Category.findByPk(category_id);

        if (!categoryExists) {
          return response.status(400).json({
            message: 'Categoria não existe',
          });
        }
      }

      let path;
      if (request.file) {
        path = request.file.filename;
      }

      await product.update({
        ...(name && { name }),
        ...(price !== undefined && { price: Number(price) }),
        ...(category_id !== undefined && { category_id }),
        ...(path && { path }),
        ...(offer !== undefined && { offer }),
      });

      return response.status(200).json(product);
    } catch (err) {
      return response.status(400).json({
        error: err.errors || err.message,
      });
    }
  }

  async index(_request, response) {
    const products = await Product.findAll({
      include: {
        model: Category,
        as: 'category',
        attributes: ['id', 'name'],
      },
    });

    return response.status(200).json(products);
  }
}

export default new ProductController();