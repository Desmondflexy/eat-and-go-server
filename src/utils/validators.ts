import joi from "joi";

export const options = {
  abortEarly: false,
  errors: { wrap: { label: "" } },
};

export const signup = joi.object().keys({
  fullname: joi.string().required(),
  email: joi.string().email().required(),
  phone: joi.string().required(),
  password: joi.string().min(6).required(),
  confirm: joi
    .string()
    .valid(joi.ref("password"))
    .required()
    .messages({ "any.only": "Passwords do not match" }),
});

export const login = joi.object().keys({
  email: joi.string().email().required().trim(),
  password: joi.string().required(),
});

export const forgotPassword = joi.object().keys({
  email: joi.string().email().required().trim(),
});

export const resetPassword = joi.object().keys({
  password: joi.string().min(6).required(),
  confirm: joi
    .string()
    .valid(joi.ref("password"))
    .required()
    .messages({ "any.only": "Passwords do not match" }),
});

export const addDish = joi.object().keys({
  name: joi.string().required(),
  category: joi.string().required(),
  size: joi.number().required(),
  price: joi.number().required(),
  notes: joi.string(),
  picture: joi.string(),
});

export const updateDish = joi.object().keys({
  name: joi.string(),
  category: joi.string(),
  size: joi.number(),
  price: joi.number(),
  notes: joi.string(),
  picture: joi.string(),
  isAvailable: joi.boolean(),
});

export const updateUserInfo = joi.object().keys({
  first: joi.string(),
  last: joi.string(),
  phone: joi.string(),
  picture: joi.string(),
});

export const updatePassword = joi.object().keys({
  oldPassword: joi.string().required(),
  password: joi.string().min(6).required(),
  confirm: joi
    .string()
    .valid(joi.ref("password"))
    .required()
    .messages({ "any.only": "Passwords do not match" }),
});

export const googleSignOn = joi.object().keys({
  id: joi.string().required(),
  email: joi.string().email().required(),
  name: joi.string().required(),
});
