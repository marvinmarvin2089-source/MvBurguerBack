import * as Yup from 'yup';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Order from '../schemas/Order.js';
class OrderContoller {
  async store(request, response) {
   const schema = Yup.object({
      products: Yup.array().required().of(
        Yup.object().shape({
          id: Yup.number().required(),
          quantity: Yup.number().required(),
        })
      ),
    });

    try {
      await schema.validate(request.body, {
        abortEarly: false, strict: true,
      });
    } catch (err) {
      return response.status(400).json({ message: err.errors });
    }
  

    const { userId, userName } = request;
    const { products } = request.body;

    const productIds = products.map(product => product.id);

    const findedProducts = await Product.findAll({
      where: {
        id: productIds,
      },
      include: {
        model: Category,
        as: 'category',
        attributes: ['name'],
      },
    });

    if (findedProducts.length !== products.length) {
      return response.status(400).json({
        message: 'Um ou mais produtos não existem',
      });
    }
    
    const mapedProducts = findedProducts.map(product => {
      const productFromRequest = products.find(p => p.id === product.id);
      return {
        id: product.id,
        name: product.name,
        price: product.price,
        url: product.url,
        category: product.category?.name ?? 'Sem categoria',
        quantity: productFromRequest.quantity ?? 0,
      };
      
    });

    const order = {
      user: {
        id: userId,
        name: userName,
      },
      products: mapedProducts,
      status: 'Pedido recebido',
    };

  const newOrder = await Order.create(order);
      

      return response.status(201).json(newOrder);
  }

  async update(request, response) {
    const schema = Yup.object({
      status: Yup.string().required()
    });

    try {
      await schema.validate(request.body, {
        abortEarly: false, strict: true,
      });
    } catch (err) {
      return response.status(400).json({ message: err.errors });
    }
    const { status } = request.body;
    const { id } = request.params;

    try {
    await Order.updateOne({ _id: id }, { status });

    } catch (err) {
      return response.status(400).json({ error: err.message });
    }

    return response.status(200).json({ message: 'Status do pedido atualizado com sucesso' });
  }

  async index(_request, response) {
    const orders = await Order.find()

   return response.status(200).json(orders);
  } 
  
} 
    

export default new OrderContoller();