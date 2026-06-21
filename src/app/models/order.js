import Sequelize, { Model } from 'sequelize';

class Order extends Model {
  static init(sequelize) {
    super.init(
      {
        user: Sequelize.JSON,
        products: Sequelize.JSON,
        status: Sequelize.STRING,
      },
      {
        sequelize,
      },
    );
    return this;
  }
}

export default Order;