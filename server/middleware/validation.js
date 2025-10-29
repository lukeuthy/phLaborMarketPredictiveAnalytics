import Joi from "joi"
import { ApiError } from "./error-handler.js"

export function validateDataUpload(req, res, next) {
  const schema = Joi.object({
    data: Joi.array()
      .items(
        Joi.object({
          quarter: Joi.number().required(),
          year: Joi.number().required(),
          lfpr: Joi.number().required(),
          employment_rate: Joi.number().required(),
          unemployment_rate: Joi.number().required(),
          underemployment_rate: Joi.number().required(),
          sector: Joi.string().optional(),
        }),
      )
      .required(),
    metadata: Joi.object({
      name: Joi.string().required(),
      description: Joi.string().optional(),
      source: Joi.string().optional(),
    }).required(),
  })

  const { error } = schema.validate(req.body)
  if (error) {
    throw new ApiError(error.details[0].message, 400)
  }
  next()
}

export function validateAlgorithmComparison(req, res, next) {
  const schema = Joi.object({
    datasetId: Joi.string().required(),
    algorithms: Joi.array().items(Joi.string()).required(),
    parameters: Joi.object().optional(),
  })

  const { error } = schema.validate(req.body)
  if (error) {
    throw new ApiError(error.details[0].message, 400)
  }
  next()
}
