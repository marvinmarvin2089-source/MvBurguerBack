import { Sequelize } from 'sequelize';
import mangoose from 'mongoose';
import Product from '../app/models/Product.js';
import User from '../app/models/User.js';
import databaseConfig from '../config/database.cjs';
import Category from '../app/models/Category.js';

const models = [User, Product, Category];

class Database {
    constructor() {
        this.init();
        this.mongo();
    }
    init() {
        this.connection = new Sequelize(databaseConfig);
        models.map((model) => model.init(this.connection)).map(model => model.associate && model.associate(this.connection.models));
    }
    mongo() {
        this.mongoConnection = mangoose.connect('mongodb://localhost:27017/mv-burguer');
    }
}
export default new Database();
