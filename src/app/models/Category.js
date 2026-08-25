import Sequelize, { Model } from 'sequelize';

class Category extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        path: Sequelize.STRING,
        url: {
          type: Sequelize.VIRTUAL,
          get() {
            return `http://localhost:3001/category-files/${this.path}`;
          },
        },
      },
      {
        sequelize,
        tableName: 'categories',
        timestamps: true,
        underscored: true,
      },
    );

    return this;
  }
}

export default Category;
