import { Model } from 'sequelize'

const loadModel = (sequelize, DataTypes) => {
  class Schedule extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
    }
  }

  Schedule.init({

  }, {
    sequelize,
    modelName: 'Schedule'
  })

  return Schedule
}

export default loadModel
