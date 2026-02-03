'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('attendance', 'unique_user_date');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addConstraint('attendance', {
      fields: ['userId', 'date'],
      type: 'unique',
      name: 'unique_user_date',
    });
  },
};
