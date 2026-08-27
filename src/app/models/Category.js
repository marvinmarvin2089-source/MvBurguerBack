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
            const baseUrl =
              process.env.APP_URL || 'http://localhost:3001';

            return `${baseUrl}/category-files/${this.path}`;
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