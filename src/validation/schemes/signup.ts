import Joi, { ObjectSchema } from 'joi';

const signupSchema: ObjectSchema = Joi.object().keys({
  username: Joi.string().min(5).max(15).required().messages({
    'string.base': 'username must be a string',
    'string.min': 'username must be at least 5 characters long',
    'string.max': 'username must be at most 15 characters long',
    'string.empty': 'username is required'
  }),
  password: Joi.string().min(5).max(12).required().messages({
    'string.base': 'password must be a string',
    'string.min': 'password must be at least 5 characters long',
    'string.max': 'password must be at most 15 characters long',
    'string.empty': 'password is required'
  }),
  country: Joi.string().required().messages({
    'string.base': 'country  must be a string',
    'string.empty': 'country  is required'
  }),
  email: Joi.string().email().required().messages({
    'string.base': 'email must be a string',
    'string.empty': 'email is required',
    'string.email': 'Invalid email'
  }),
  profilePicture: Joi.string().required().messages({
    'string.base': 'Please add a profile picture',
    'string.empty': 'Please add a profile picture'
  })
});

export { signupSchema };
