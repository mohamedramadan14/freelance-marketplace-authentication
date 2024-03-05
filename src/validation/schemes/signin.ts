import Joi, { ObjectSchema } from 'joi';

const signinSchema: ObjectSchema = Joi.object().keys({
  username: Joi.alternatives().conditional(Joi.string().email(), {
    then: Joi.string().email().required().messages({
      'string.base': 'email must be a string',
      'string.empty': 'email is required',
      'string.email': 'Invalid email'
    }),
    otherwise: Joi.string().min(5).max(15).required().messages({
      'string.base': 'username must be a string',
      'string.min': 'username must be at least 5 characters long',
      'string.max': 'username must be at most 15 characters long',
      'string.empty': 'username is required'
    })
  }),
  password: Joi.string().min(5).max(12).required().messages({
    'string.base': 'password must be a string',
    'string.min': 'password must be at least 5 characters long',
    'string.max': 'password must be at most 15 characters long',
    'string.empty': 'password is required'
  })
});

export { signinSchema };
