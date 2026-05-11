import * as Joi from 'joi'

export const envValidationSchema = Joi.object({
	DATABASE_URL: Joi.string().uri().required(),
	PG_POOL_MAX: Joi.any()
		.optional()
		.custom((v, helpers) => {
			if (v === undefined || v === null || v === '') return undefined
			const n = Number(v)
			if (!Number.isInteger(n) || n < 1 || n > 200) {
				return helpers.error('any.invalid')
			}
			return n
		}, 'PG_POOL_MAX'),
	TRUST_PROXY: Joi.string().valid('true', 'false', '').default('false'),
	JWT_ACCESS_SECRET: Joi.string().min(8).required(),
	JWT_REFRESH_SECRET: Joi.string().min(8).required(),
	JWT_ACCESS_EXPIRATION: Joi.string().default('15m'),
	JWT_REFRESH_EXPIRATION: Joi.string().default('7d'),
	NODE_ENV: Joi.string().valid('development', 'production', 'test').optional(),
	REFRESH_COOKIE_NAME: Joi.string().default('crm_refresh'),
	REFRESH_COOKIE_SAMESITE: Joi.string().valid('lax', 'strict').default('lax'),
	REFRESH_COOKIE_SECURE: Joi.string().valid('true', 'false', '').default(''),
	REFRESH_COOKIE_PATH: Joi.string().default('/api/auth'),
	TELEGRAM_BOT_TOKEN: Joi.string().allow('').default(''),
	PORT: Joi.number().default(3000),
	LOG_LEVEL: Joi.string().default('log,warn,error,debug'),
	LOG_STACK: Joi.boolean().truthy('true').falsy('false').default(true),
	LOG_BODY: Joi.boolean().truthy('true').falsy('false').default(false),
	LOG_4XX: Joi.boolean().truthy('true').falsy('false').default(true),
	DEFAULT_RESET_PASSWORD: Joi.string().allow('').optional(),
})
