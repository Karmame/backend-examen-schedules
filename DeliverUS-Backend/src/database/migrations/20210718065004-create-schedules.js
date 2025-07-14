module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Schedules', {

    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Schedules')
  }
}
