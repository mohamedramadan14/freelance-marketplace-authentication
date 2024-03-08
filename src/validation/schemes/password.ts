import Joi, { ObjectSchema, ref } from 'joi';

const emailSchema: ObjectSchema = Joi.object().keys({
  email: Joi.string().email().required().messages({
    'string.base': 'Field must be a string',
    'string.empty': 'Field is required',
    'string.email': 'Field must be valid'
  })
});

const passwordSchema: ObjectSchema = Joi.object().keys({
  password: Joi.string().min(5).max(12).required().messages({
    'string.base': 'Password must be a string',
    'string.min': 'Password must be at least 5 characters long',
    'string.max': 'Password must be at most 12 characters long',
    'string.empty': 'Password is required'
  }),

  confirmPassword: Joi.string().required().valid(ref('password')).messages({
    'any.only': 'Password does not match',
    'any.required': 'Confirm password is required'
  })
});

const changePasswordSchema: ObjectSchema = Joi.object().keys({
  currentPassword: Joi.string().min(5).max(12).required().messages({
    'string.base': 'Password must be a string',
    'string.min': 'Password must be at least 5 characters long',
    'string.max': 'Password must be at most 12 characters long',
    'string.empty': 'Password is required'
  }),
  newPassword: Joi.string().required().valid(ref('password')).messages({
    'any.only': 'Password does not match',
    'any.required': 'New password is required'
  })
});

export { emailSchema, passwordSchema, changePasswordSchema };
