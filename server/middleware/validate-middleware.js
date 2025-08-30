const validate = (Schema) => async (req, res, next) => {
  try {
    const parsedBody = await Schema.parseAsync(req.body);
    req.body = parsedBody;
    next();
  } catch (err) {
    console.log(err);

    const status = 400;
    const message = err.errors.map(error => error.message).join(', ');

    const error = { status, message };
    next(error);
  }
};

export default validate;