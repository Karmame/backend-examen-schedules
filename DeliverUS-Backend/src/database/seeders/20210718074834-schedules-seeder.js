module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Schedules', [
      // Restaurant 1
      { startTime: '08:00:00', endTime: '11:00:00', restaurantId: 1, createdAt: new Date(), updatedAt: new Date() }, // Breakfast
      { startTime: '12:00:00', endTime: '15:00:00', restaurantId: 1, createdAt: new Date(), updatedAt: new Date() }, // Lunch
      { startTime: '19:00:00', endTime: '22:00:00', restaurantId: 1, createdAt: new Date(), updatedAt: new Date() }, // Dinner

      // Restaurant 2
      { startTime: '07:30:00', endTime: '10:30:00', restaurantId: 2, createdAt: new Date(), updatedAt: new Date() }, // Breakfast
      { startTime: '13:00:00', endTime: '16:00:00', restaurantId: 2, createdAt: new Date(), updatedAt: new Date() }, // Lunch
      { startTime: '20:00:00', endTime: '23:00:00', restaurantId: 2, createdAt: new Date(), updatedAt: new Date() } // Dinner
    ], {})
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Schedules', null, {})
  }
}
