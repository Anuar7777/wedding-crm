import * as Joi from 'joi'

export const envValidationSchema = Joi.object({
	DATABASE_URL: Joi.string().uri().required(),
	JWT_ACCESS_SECRET: Joi.string().min(8).required(),
	JWT_REFRESH_SECRET: Joi.string().min(8).required(),
	JWT_ACCESS_EXPIRATION: Joi.string().default('15m'),
	JWT_REFRESH_EXPIRATION: Joi.string().default('7d'),
	TELEGRAM_BOT_TOKEN: Joi.string().allow('').default(''),
	PORT: Joi.number().default(3000),
	LOG_LEVEL: Joi.string().default('log,warn,error,debug'),
	LOG_STACK: Joi.boolean().truthy('true').falsy('false').default(true),
	LOG_BODY: Joi.boolean().truthy('true').falsy('false').default(false),
	LOG_4XX: Joi.boolean().truthy('true').falsy('false').default(true),
})
