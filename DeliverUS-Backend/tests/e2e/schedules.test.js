import dotenv from 'dotenv'
import request from 'supertest'
import { getLoggedInOwner, getNewLoggedInOwner } from './utils/auth'
import { getApp, shutdownApp } from './utils/testApp'
import { createRestaurant } from './utils/restaurant'

dotenv.config()

const _checkScheduleProperties = (schedule) => {
  expect(schedule.startTime).toBeDefined()
  expect(typeof schedule.startTime).toBe('string')
  expect(schedule.endTime).toBeDefined()
  expect(typeof schedule.endTime).toBe('string')
  expect(schedule.restaurantId).toBeDefined()
  expect(Number.isInteger(schedule.restaurantId)).toBeTruthy()
}

describe('Get restaurant schedules', () => {
  const restaurantId = 1
  let app, schedules
  beforeAll(async () => {
    app = await getApp()
  })
  it('Should return 404 with incorrect restaurant id', async () => {
    const response = await request(app).get('/restaurants/incorrectId/schedules').send()
    expect(response.status).toBe(404)
  })
  it('Should return 200 with correct restaurant id', async () => {
    const response = await request(app).get(`/restaurants/${restaurantId}/schedules`).send()
    expect(response.status).toBe(200)
    schedules = response.body
  })
  it('All schedule properties must be correctly defined', async () => {
    schedules.forEach(schedule => _checkScheduleProperties(schedule))
  })
  it('Should return at least one schedule when schedules exist', async () => {
    expect(schedules.length).toBeGreaterThan(0)
  })
  afterAll(async () => {
    await shutdownApp()
  })
})

describe('Create schedule', () => {
  let owner, restaurant, app, schedule
  beforeAll(async () => {
    app = await getApp()
    owner = await getLoggedInOwner()
    restaurant = await createRestaurant(owner)
    schedule = {
      startTime: '08:00:00',
      endTime: '12:00:00'
    }
  })

  it('Should return 401 if not logged in', async () => {
    const response = await request(app).post(`/restaurants/${restaurant.id}/schedules`).send(schedule)
    expect(response.status).toBe(401)
  })

  it('Should return 403 if logged in as another user', async () => {
    const anotherOwner = await getNewLoggedInOwner()
    const response = await request(app)
      .post(`/restaurants/${restaurant.id}/schedules`)
      .set('Authorization', `Bearer ${anotherOwner.token}`)
      .send(schedule)
    expect(response.status).toBe(403)
  })

  it('Should return 422 if startTime is missing', async () => {
    const response = await request(app)
      .post(`/restaurants/${restaurant.id}/schedules`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ endTime: schedule.endTime }) // Falta `startTime`
    expect(response.status).toBe(422)
  })

  it('Should return 422 if endTime is missing', async () => {
    const response = await request(app)
      .post(`/restaurants/${restaurant.id}/schedules`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ startTime: schedule.startTime }) // Falta `endTime`
    expect(response.status).toBe(422)
  })

  it('Should return 422 if startTime is greater than endTime', async () => {
    const invalidSchedule = { startTime: '12:00:00', endTime: '08:00:00' } // Inválido
    const response = await request(app)
      .post(`/restaurants/${restaurant.id}/schedules`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send(invalidSchedule)
    expect(response.status).toBe(422)
  })

  it('Should return 422 if startTime is equal to endTime', async () => {
    const invalidSchedule = { startTime: '12:00:00', endTime: '12:00:00' } // Inválido
    const response = await request(app)
      .post(`/restaurants/${restaurant.id}/schedules`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send(invalidSchedule)
    expect(response.status).toBe(422)
  })

  it('Should return 422 if startTime has an invalid time', async () => {
    const response = await request(app)
      .post(`/restaurants/${restaurant.id}/schedules`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ startTime: '25:00:00', endTime: schedule.endTime }) // Inválido
    expect(response.status).toBe(422)
  })
  it('Should return 422 if endTime has an invalid time', async () => {
    const response = await request(app)
      .post(`/restaurants/${restaurant.id}/schedules`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ startTime: schedule.startTime, endTime: '99:99:99' }) // Inválido
    expect(response.status).toBe(422)
  })

  it('Should return 422 if startTime has no seconds', async () => {
    const response = await request(app)
      .post(`/restaurants/${restaurant.id}/schedules`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ startTime: '08:00', endTime: schedule.endTime }) // faltan segundos
    expect(response.status).toBe(422)
  })

  it('Should return 422 if endTime has no seconds', async () => {
    const response = await request(app)
      .post(`/restaurants/${restaurant.id}/schedules`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ startTime: schedule.startTime, endTime: '12:00' }) // faltan segundos
    expect(response.status).toBe(422)
  })
  it('Should return 200 when valid schedule is created', async () => {
    const response = await request(app)
      .post(`/restaurants/${restaurant.id}/schedules`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send(schedule)
    expect(response.status).toBe(200)
    expect(response.body.startTime).toBe(schedule.startTime)
    expect(response.body.endTime).toBe(schedule.endTime)
  })

  afterAll(async () => {
    await shutdownApp()
  })
})

describe('Edit schedule', () => {
  let owner, restaurant, schedule, app, scheduleToBeEdited, editedSchedule
  beforeAll(async () => {
    app = await getApp()
    owner = await getLoggedInOwner()
    restaurant = await createRestaurant(owner)
    scheduleToBeEdited = { startTime: '08:00:00', endTime: '12:00:00' }
    editedSchedule = { startTime: '09:00:00', endTime: '13:00:00' }
    const response = await request(app)
      .post(`/restaurants/${restaurant.id}/schedules`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send(scheduleToBeEdited)
    schedule = response.body
  })
  it('Should return 401 if not logged in', async () => {
    const response = await request(app)
      .put(`/restaurants/${restaurant.id}/schedules/${schedule.id}`).send(editedSchedule)
    expect(response.status).toBe(401)
  })
  it('Should return 403 when trying to edit a schedule that is not yours', async () => {
    const anotherOwner = await getNewLoggedInOwner()
    const response = await request(app)
      .put(`/restaurants/${restaurant.id}/schedules/${schedule.id}`)
      .set('Authorization', `Bearer ${anotherOwner.token}`)
      .send(editedSchedule)
    expect(response.status).toBe(403)
  })
  it('Should return 404 when restaurantId does not exists', async () => {
    const response = await request(app)
      .put(`/restaurants/invalidRestaurantId/schedules/${schedule.id}`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send(editedSchedule)
    expect(response.status).toBe(404)
  })
  it('Should return 404 when scheduleId does not exists', async () => {
    const response = await request(app)
      .put(`/restaurants/${restaurant.id}/schedules/invalidScheduleId`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send(editedSchedule)
    expect(response.status).toBe(404)
  })
  it('Should return 422 if startTime is missing', async () => {
    const response = await request(app)
      .put(`/restaurants/${restaurant.id}/schedules/${schedule.id}`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ endTime: editedSchedule.endTime }) // Falta `startTime`
    expect(response.status).toBe(422)
  })
  it('Should return 422 if endTime is missing', async () => {
    const response = await request(app)
      .put(`/restaurants/${restaurant.id}/schedules/${schedule.id}`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ startTime: editedSchedule.startTime }) // Falta `endTime`
    expect(response.status).toBe(422)
  })
  it('Should return 422 if startTime has no seconds', async () => {
    const response = await request(app)
      .put(`/restaurants/${restaurant.id}/schedules/${schedule.id}`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ startTime: '09:00', endTime: editedSchedule.endTime }) // Sin segundos
    expect(response.status).toBe(422)
  })

  it('Should return 422 if endTime has no seconds', async () => {
    const response = await request(app)
      .put(`/restaurants/${restaurant.id}/schedules/${schedule.id}`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ startTime: editedSchedule.startTime, endTime: '13:00' }) // Sin segundos
    expect(response.status).toBe(422)
  })

  it('Should return 422 if startTime is greater to endTime', async () => {
    const invalidSchedule = { startTime: '12:00:00', endTime: '08:00:00' } // Inválido
    const response = await request(app)
      .put(`/restaurants/${restaurant.id}/schedules/${schedule.id}`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send(invalidSchedule)
    expect(response.status).toBe(422)
  })

  it('Should return 422 if startTime is equal to endTime', async () => {
    const sameTimeSchedule = { startTime: '10:00:00', endTime: '10:00:00' }
    const response = await request(app)
      .put(`/restaurants/${restaurant.id}/schedules/${schedule.id}`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send(sameTimeSchedule)
    expect(response.status).toBe(422)
  })

  it('Should return 200 when schedule is updated', async () => {
    const response = await request(app)
      .put(`/restaurants/${restaurant.id}/schedules/${schedule.id}`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send(editedSchedule)
    expect(response.status).toBe(200)
    expect(response.body.startTime).toBe(editedSchedule.startTime)
    expect(response.body.endTime).toBe(editedSchedule.endTime)
  })
  afterAll(async () => {
    await shutdownApp()
  })
})

describe('Remove schedule', () => {
  let owner, restaurant, schedule, app
  beforeAll(async () => {
    app = await getApp()
    owner = await getLoggedInOwner()
    restaurant = await createRestaurant(owner)
    const response = await request(app)
      .post(`/restaurants/${restaurant.id}/schedules`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({
        startTime: '08:00:00',
        endTime: '12:00:00'
      })
    schedule = response.body
  })
  it('Should return 401 if not logged in', async () => {
    const response = await request(app).delete(`/restaurants/${restaurant.id}/schedules/${schedule.id}`).send()
    expect(response.status).toBe(401)
  })
  it('Should return 403 when trying to delete a schedule that is not yours', async () => {
    const anotherOwner = await getNewLoggedInOwner()
    const response = await request(app)
      .delete(`/restaurants/${restaurant.id}/schedules/${schedule.id}`)
      .set('Authorization', `Bearer ${anotherOwner.token}`)
      .send()
    expect(response.status).toBe(403)
  })
  it('Should return 404 when trying to delete a schedule from a restaurant that does not exist', async () => {
    const response = await request(app)
      .delete(`/restaurants/invalidRestaurantId/schedules/${schedule.id}`) // Un ID alto que nunca existió
      .set('Authorization', `Bearer ${owner.token}`)
      .send()
    expect(response.status).toBe(404)
  })
  it('Should return 404 when trying to delete a schedule that does not exist', async () => {
    const response = await request(app)
      .delete(`/restaurants/${restaurant.id}/schedules/invalidScheduleId`) // Un ID alto que nunca existió
      .set('Authorization', `Bearer ${owner.token}`)
      .send()
    expect(response.status).toBe(404)
  })
  it('Should return 200 when valid schedule is deleted', async () => {
    const response = await request(app)
      .delete(`/restaurants/${restaurant.id}/schedules/${schedule.id}`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send()
    expect(response.status).toBe(200)
  })
  it('Should return 404 when trying to delete a schedule already deleted', async () => {
    const response = await request(app)
      .delete(`/restaurants/${restaurant.id}/schedules/${schedule.id}`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send()
    expect(response.status).toBe(404)
  })
  afterAll(async () => {
    await shutdownApp()
  })
})

describe('Create product with optional schedule', () => {
  let owner, restaurant, schedule, app, validProduct
  beforeAll(async () => {
    app = await getApp()
    owner = await getLoggedInOwner()
    restaurant = await createRestaurant(owner)

    // Crear un horario dentro del restaurante
    const scheduleResponse = await request(app)
      .post(`/restaurants/${restaurant.id}/schedules`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ startTime: '08:00:00', endTime: '12:00:00' })
    schedule = scheduleResponse.body

    // Producto válido con `scheduleId`
    validProduct = {
      name: 'Test Product',
      description: 'A test product',
      price: 9.99,
      order: 1,
      availability: true,
      productCategoryId: 1,
      restaurantId: restaurant.id,
      scheduleId: schedule.id
    }
  })

  it('Should return 422 if scheduleId does not belong to restaurant', async () => {
    const anotherRestaurant = await createRestaurant(owner)
    const otherScheduleResponse = await request(app)
      .post(`/restaurants/${anotherRestaurant.id}/schedules`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ startTime: '10:00:00', endTime: '14:00:00' })

    const invalidProduct = { ...validProduct, scheduleId: otherScheduleResponse.body.id }
    const response = await request(app)
      .post('/products')
      .set('Authorization', `Bearer ${owner.token}`)
      .send(invalidProduct)
    expect(response.status).toBe(422)
  })
  it('Should return 422 when creating a product with non-existent scheduleId', async () => {
    const invalidScheduleId = 99999 // ID inexistente
    const response = await request(app)
      .post('/products')
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ ...validProduct, scheduleId: invalidScheduleId })
    expect(response.status).toBe(422)
  })

  it('Should return 200 when valid product with schedule is created', async () => {
    const response = await request(app)
      .post('/products')
      .set('Authorization', `Bearer ${owner.token}`)
      .send(validProduct)
    expect(response.status).toBe(200)
    expect(response.body.scheduleId).toBe(validProduct.scheduleId)
  })

  afterAll(async () => {
    await shutdownApp()
  })
})

describe('Edit product with optional schedule', () => {
  let owner, restaurant, product, app, scheduleToBeAssigned, editedProduct
  beforeAll(async () => {
    app = await getApp()
    owner = await getLoggedInOwner()
    restaurant = await createRestaurant(owner)

    // Crear un horario inicial dentro del restaurante
    const scheduleResponse = await request(app)
      .post(`/restaurants/${restaurant.id}/schedules`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ startTime: '08:00:00', endTime: '12:00:00' })
    const schedule = scheduleResponse.body

    // Crear otro horario dentro del restaurante
    const newScheduleResponse = await request(app)
      .post(`/restaurants/${restaurant.id}/schedules`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ startTime: '14:00:00', endTime: '18:00:00' })
    scheduleToBeAssigned = newScheduleResponse.body

    // Crear un producto con el primer horario
    const productResponse = await request(app)
      .post('/products')
      .set('Authorization', `Bearer ${owner.token}`)
      .send({
        name: 'Product to Edit',
        description: 'A product that will be edited',
        price: 15.99,
        order: 1,
        availability: true,
        productCategoryId: 1,
        restaurantId: restaurant.id,
        scheduleId: schedule.id
      })
    product = productResponse.body

    // Datos del producto editado con nuevo scheduleId
    editedProduct = {
      name: 'Updated Product',
      description: 'Updated description',
      price: 20.99,
      order: 2,
      availability: false,
      productCategoryId: 2,
      scheduleId: scheduleToBeAssigned.id
    }
  })

  it('Should return 422 when scheduleId belongs to another restaurant', async () => {
    const anotherOwner = await getNewLoggedInOwner()
    const anotherRestaurant = await createRestaurant(anotherOwner)

    const scheduleAnotherRestaurantResponse = await request(app)
      .post(`/restaurants/${anotherRestaurant.id}/schedules`)
      .set('Authorization', `Bearer ${anotherOwner.token}`)
      .send({ startTime: '10:00:00', endTime: '14:00:00' })

    const response = await request(app)
      .put(`/products/${product.id}`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ scheduleId: scheduleAnotherRestaurantResponse.body.id })
    expect(response.status).toBe(422)
  })

  it('Should return 422 when updating a product with non-existent scheduleId', async () => {
    const invalidScheduleId = 99999 // ID inexistente
    const response = await request(app)
      .put(`/products/${product.id}`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({
        name: 'Updated Product',
        price: 20.99,
        productCategoryId: 1,
        scheduleId: invalidScheduleId
      })
    expect(response.status).toBe(422)
  })

  it('Should return 200 when product is updated with a valid schedule', async () => {
    const response = await request(app)
      .put(`/products/${product.id}`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send(editedProduct)
    expect(response.status).toBe(200)
    expect(response.body.scheduleId).toBe(editedProduct.scheduleId)
  })

  afterAll(async () => {
    await shutdownApp()
  })
})

describe('GET /restaurants/:restaurantId/showWithActiveProducts muestra solo productos activos según horario', () => {
  let app, owner, restaurant, activeProduct

  beforeAll(async () => {
    app = await getApp()
    owner = await getLoggedInOwner()
    restaurant = await createRestaurant(owner)

    // Obtener hora actual
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    const pad = n => n.toString().padStart(2, '0')

    // Crear un horario activo
    const activeScheduleResponse = await request(app)
      .post(`/restaurants/${restaurant.id}/schedules`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({
        startTime: `${pad(currentHour)}:${pad(currentMinute - 1)}:00`,
        endTime: `${pad(currentHour)}:${pad(currentMinute + 1)}:59`
      })

    const activeSchedule = activeScheduleResponse.body

    // Crear producto activo
    const activeProductResponse = await request(app)
      .post('/products')
      .set('Authorization', `Bearer ${owner.token}`)
      .send({
        name: 'Producto activo',
        description: 'Debe mostrarse',
        price: 10,
        productCategoryId: 1,
        restaurantId: restaurant.id,
        scheduleId: activeSchedule.id
      })
    activeProduct = activeProductResponse.body

    // Crear producto sin schedule
    await request(app)
      .post('/products')
      .set('Authorization', `Bearer ${owner.token}`)
      .send({
        name: 'Producto sin schedule',
        description: 'No Debe mostrarse',
        price: 10,
        productCategoryId: 1,
        restaurantId: restaurant.id
      })

    // Crear un horario inactivo (fuera de hora actual)
    const inactiveScheduleResponse = await request(app)
      .post(`/restaurants/${restaurant.id}/schedules`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({
        startTime: `${pad((currentHour + 2) % 24)}:00:00`,
        endTime: `${pad((currentHour + 3) % 24)}:00:00`
      })

    const inactiveSchedule = inactiveScheduleResponse.body

    // Crear producto inactivo
    await request(app)
      .post('/products')
      .set('Authorization', `Bearer ${owner.token}`)
      .send({
        name: 'Producto inactivo',
        description: 'No debe mostrarse',
        price: 15,
        productCategoryId: 1,
        restaurantId: restaurant.id,
        scheduleId: inactiveSchedule.id
      })
  })

  it('Debería devolver sólo el producto activo según horario actual', async () => {
    const response = await request(app)
      .get(`/restaurants/${restaurant.id}/showWithActiveProducts`)
      .send()

    expect(response.status).toBe(200)
    expect(response.body.products).toHaveLength(1)
    expect(response.body.products[0].id).toBe(activeProduct.id)
    expect(response.body.products[0].name).toBe('Producto activo')
  })

  afterAll(async () => {
    await shutdownApp()
  })
})
