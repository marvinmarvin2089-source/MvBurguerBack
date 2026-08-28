'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('orders', 'payment_status', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'Pendente',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('orders', 'payment_status');
  },
};
