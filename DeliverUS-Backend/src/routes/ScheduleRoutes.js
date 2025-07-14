import * as ScheduleValidation from '../controllers/validation/ScheduleValidation.js'
import ScheduleController from '../controllers/ScheduleController.js'
import { isLoggedIn, hasRole } from '../middlewares/AuthMiddleware.js'
import { handleValidation } from '../middlewares/ValidationHandlingMiddleware.js'
import { checkEntityExists } from '../middlewares/EntityMiddleware.js'
import * as RestaurantMiddleware from '../middlewares/RestaurantMiddleware.js'
import { Schedule, Restaurant } from '../models/models.js'

const loadScheduleRoutes = function (app) {

}

export default loadScheduleRoutes
