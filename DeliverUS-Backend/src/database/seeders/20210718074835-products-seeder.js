module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Products', [
      // 📍 Casa Felix (restaurantId = 1)
      { id: 1, name: 'Ensaladilla', description: 'Tuna salad with mayonnaise', price: 2.5, image: process.env.PRODUCTS_FOLDER + '/ensaladilla.jpeg', order: 1, availability: true, restaurantId: 1, productCategoryId: 1, scheduleId: 2 },
      { id: 2, name: 'Olives', description: 'Homemade', price: 1.5, image: process.env.PRODUCTS_FOLDER + '/aceitunas.jpeg', order: 2, availability: true, restaurantId: 1, productCategoryId: 1, scheduleId: 2 },
      { id: 3, name: 'Grilled Tuna', description: 'With salad', price: 4.5, image: process.env.PRODUCTS_FOLDER + '/grilledTuna.jpeg', order: 3, availability: true, restaurantId: 1, productCategoryId: 4, scheduleId: 3 },
      { id: 4, name: 'Steak', description: 'Pork steak', price: 3.5, image: process.env.PRODUCTS_FOLDER + '/steak.jpeg', order: 4, availability: true, restaurantId: 1, productCategoryId: 4, scheduleId: 3 },
      { id: 5, name: 'Burritos', description: 'Tomato, chicken, cheese', price: 4.0, image: process.env.PRODUCTS_FOLDER + '/burritos.jpeg', order: 5, availability: true, restaurantId: 1, productCategoryId: 4, scheduleId: 2 },
      { id: 6, name: 'Coffee', description: 'Espresso', price: 1.2, image: process.env.PRODUCTS_FOLDER + '/cafe.jpeg', order: 6, availability: true, restaurantId: 1, productCategoryId: 3, scheduleId: 1 },
      { id: 7, name: 'Coca-Cola', description: '33 cc', price: 1.5, image: process.env.PRODUCTS_FOLDER + '/cola.jpeg', order: 7, availability: true, restaurantId: 1, productCategoryId: 3, scheduleId: 3 },
      { id: 8, name: 'Water', description: '50 cc', price: 1.0, image: process.env.PRODUCTS_FOLDER + '/agua.png', order: 8, availability: true, restaurantId: 1, productCategoryId: 3, scheduleId: 1 },
      { id: 9, name: 'Chocolate Cake', description: '1 piece', price: 3.0, image: process.env.PRODUCTS_FOLDER + '/chocolateCake.jpeg', order: 9, availability: true, restaurantId: 1, productCategoryId: 5, scheduleId: 6 },
      { id: 10, name: 'Apple Pie', description: '1 piece', price: 3.0, image: process.env.PRODUCTS_FOLDER + '/applePie.jpeg', order: 10, availability: false, restaurantId: 1, productCategoryId: 5, scheduleId: 6 },
      { id: 11, name: 'Churros', description: '5 pieces', price: 2.0, image: process.env.PRODUCTS_FOLDER + '/churros.jpeg', order: 11, availability: false, restaurantId: 1, productCategoryId: 5, scheduleId: 6 },

      // 📍 100 Montaditos (restaurantId = 2)
      { id: 12, name: 'Salchichón', description: '12 little pieces', price: 1.5, image: process.env.PRODUCTS_FOLDER + '/salchichon.jpeg', order: 12, availability: true, restaurantId: 2, productCategoryId: 1, scheduleId: 5 },
      { id: 13, name: 'Jamón Montadito', description: 'Cured ham and olive oil', price: 1.5, image: process.env.PRODUCTS_FOLDER + '/montaditoJamon.jpeg', order: 13, availability: true, restaurantId: 2, productCategoryId: 6, scheduleId: 5 },
      { id: 14, name: 'Queso y Tomate Montadito', description: 'Iberian cheese and tomato', price: 1.5, image: process.env.PRODUCTS_FOLDER + '/montaditoQuesoTomate.jpeg', order: 14, availability: true, restaurantId: 2, productCategoryId: 6, scheduleId: 5 },
      { id: 15, name: 'Salmón Montadito', description: 'Norwegian smoked salmon', price: 2.0, image: process.env.PRODUCTS_FOLDER + '/montaditoSalmon.jpeg', order: 15, availability: true, restaurantId: 2, productCategoryId: 6, scheduleId: 5 },
      { id: 16, name: 'Chocolate Montadito', description: '1 piece', price: 1.5, image: process.env.PRODUCTS_FOLDER + '/montaditoChocolate.png', order: 16, availability: true, restaurantId: 2, productCategoryId: 5, scheduleId: 6 },
      { id: 17, name: 'Muffin', description: '1 piece', price: 1.0, image: process.env.PRODUCTS_FOLDER + '/muffin.jpeg', order: 17, availability: false, restaurantId: 2, productCategoryId: 5, scheduleId: 6 },
      { id: 18, name: 'Beer', description: '20 cc', price: 1.0, image: process.env.PRODUCTS_FOLDER + '/cerveza.jpeg', order: 18, availability: true, restaurantId: 2, productCategoryId: 3, scheduleId: 3 },
      { id: 19, name: 'Chocolate Ice Cream', description: '100 ml', price: 3.0, image: process.env.PRODUCTS_FOLDER + '/chocolateIceCream.jpeg', order: 19, availability: true, restaurantId: 2, productCategoryId: 5, scheduleId: 6 }
    ], {})
  },

  down: async (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface
    try {
      await sequelize.transaction(async (transaction) => {
        const options = { transaction }
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', options)
        await sequelize.query('TRUNCATE TABLE Products', options)
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', options)
      })
    } catch (error) {
      console.error(error)
    }
  }
}
