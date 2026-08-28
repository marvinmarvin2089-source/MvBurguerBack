import Sequelize, { Model } from 'sequelize';

class Order extends Model {
  static init(sequelize) {
    super.init(
      {
        user: Sequelize.JSON,
        products: Sequelize.JSON,
        status: Sequelize.STRING,
        payment_status: Sequelize.STRING,
        payment_intent_id: Sequelize.STRING,
      },
      { sequelize, tableName: 'orders', timestamps: true, underscored: true },
    );
    return this;
  }
}

export default Order;
