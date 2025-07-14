import { check } from 'express-validator'

const validateTimeFormat = (value) => {
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/ // Acepta HH:mm:ss
  if (!timeRegex.test(value)) {
    throw new Error('Time must be in HH:mm:ss format')
  }
  return true
}

const validateEndTimeAfterStartTime = (endTime, { req }) => {
  if (!endTime || !req.body.startTime) return true // No validamos si falta alguno
  if (endTime <= req.body.startTime) {
    throw new Error('End time must be after start time')
  }
  return true
}

const create = [

]

const update = [

]

export { create, update }
