module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Orders', [
      // 📍 Casa Felix (restaurantId = 1)
      // 🛒 Pedido 1 (Pendiente) - Almuerzo (scheduleId = 2)
      { price: 15.0, address: 'Fake street 123', shippingCosts: 0, restaurantId: 1, userId: 1 },
      // 🛒 Pedido 2 (Terminado) - Cena (scheduleId = 3)
      { startedAt: new Date(), sentAt: new Date(), deliveredAt: new Date(), price: 19.5, address: 'Fake street 123 modificada', shippingCosts: 0, restaurantId: 1, userId: 1 },
      // 🛒 Pedido 3 (En proceso) - Desayuno (scheduleId = 1)
      { startedAt: new Date(), price: 12.50, address: 'Fake street 123', shippingCosts: 0, restaurantId: 1, userId: 1 },

      // 📍 100 Montaditos (restaurantId = 2)
      // 🛒 Pedido 4 (Pendiente) - Almuerzo (scheduleId = 5)
      { startedAt: new Date(), price: 6, address: 'Fake street 123', shippingCosts: 1.5, restaurantId: 2, userId: 1 },
      // 🛒 Pedido 5 (Terminado) - Cena (scheduleId = 6)
      { startedAt: new Date(), sentAt: new Date(), deliveredAt: new Date(), price: 10.5, address: 'Otra dirección', shippingCosts: 1.5, restaurantId: 2, userId: 1 }
    ], {})

    await queryInterface.bulkInsert('OrderProducts', [
      // 📦 Pedido 1 - Casa Felix (Almuerzo - scheduleId = 2)
      { orderId: 1, productId: 1, unityPrice: 2.5, quantity: 2 }, // Ensaladilla
      { orderId: 1, productId: 2, unityPrice: 1.5, quantity: 1 }, // Olives
      { orderId: 1, productId: 5, unityPrice: 4.0, quantity: 1 }, // Burritos

      // 📦 Pedido 2 - Casa Felix (Cena - scheduleId = 3)
      { orderId: 2, productId: 3, unityPrice: 4.5, quantity: 1 }, // Grilled Tuna
      { orderId: 2, productId: 4, unityPrice: 3.5, quantity: 1 }, // Steak

      // 📦 Pedido 3 - Casa Felix (Desayuno - scheduleId = 1)
      { orderId: 3, productId: 6, unityPrice: 1.2, quantity: 1 }, // Coffee
      { orderId: 3, productId: 8, unityPrice: 1.0, quantity: 1 }, // Water

      // 📦 Pedido 4 - 100 Montaditos (Almuerzo - scheduleId = 5)
      { orderId: 4, productId: 12, unityPrice: 1.5, quantity: 2 }, // Salchichón
      { orderId: 4, productId: 13, unityPrice: 1.5, quantity: 1 }, // Jamón Montadito
      { orderId: 4, productId: 14, unityPrice: 1.5, quantity: 1 }, // Queso y Tomate Montadito

      // 📦 Pedido 5 - 100 Montaditos (Cena - scheduleId = 6)
      { orderId: 5, productId: 9, unityPrice: 3.0, quantity: 1 }, // Chocolate Cake
      { orderId: 5, productId: 10, unityPrice: 3.0, quantity: 1 }, // Apple Pie
      { orderId: 5, productId: 11, unityPrice: 2.0, quantity: 1 } // Churros
    ], {})
  },

  down: async (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface
    try {
      await sequelize.transaction(async (transaction) => {
        const options = { transaction }
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', options)
        await sequelize.query('TRUNCATE TABLE OrderProducts', options)
        await sequelize.query('TRUNCATE TABLE Orders', options)
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', options)
      })
    } catch (error) {
      console.error(error)
    }
  }
}
