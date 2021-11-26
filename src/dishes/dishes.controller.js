const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

// MIDDLEWARE =================================================================================================

// Check if req.body has a valid name property
const bodyHasName = (req, res, next) => {
  const { data: { name } = {} } = req.body;

  if (name === undefined || name === "") {
    next({
      status: 400,
      message: "Dish must include a name",
    });
  }
  next();
};

// Check if req.body has a valid description property
const bodyHasDescription = (req, res, next) => {
  const { data: { description } = {} } = req.body;

  if (description === undefined || description === "") {
    next({
      status: 400,
      message: "Dish must include a description",
    });
  }
  next();
};

// Check if req.body has a valid price property
const bodyHasPrice = (req, res, next) => {
  const { data: { price } = {} } = req.body;

  if (price === undefined || price === "") {
    next({
      status: 400,
      message: "Dish must include a price",
    });
  }

  if (price <= 0 || typeof price !== "number") {
    next({
      status: 400,
      message: "Dish must have a price that is an integer greater than 0",
    });
  }
  next();
};

// Check if req.body has a valid image_url property
const bodyHasImageUrl = (req, res, next) => {
  const { data: { image_url } = {} } = req.body;

  if (image_url === undefined || image_url === "") {
    next({
      status: 400,
      message: "Dish must include a image_url",
    });
  }
  next();
};

// Check if id matches params id from route
const isIdValid = (req, res, next) => {
  const { dishId } = req.params;
  const { data: { id } = {} } = req.body;

  if (id === null || id === undefined || id === "") {
    return next();
  }

  if (id !== dishId) {
    return next({
      status: 400,
      message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
    });
  }

  next();
};

// Check if dish exists
const dishExists = (req, res, next) => {
  const { dishId } = req.params;

  const foundDish = dishes.find((dish) => dishId === dish.id);

  if (foundDish) {
    res.locals.dish = foundDish;
    return next();
  }

  return next({ status: 404, message: `Dish does not exist: ${dishId}` });
};

// ROUTE RESOURCES (CRUD HANDLERS) =============================================================================

// GET /dishes
const list = (req, res) => {
  res.json({ data: dishes });
};

// GET /dishes/:dishId
const read = (req, res) => {
  res.json({ data: res.locals.dish });
};

// POST /dishes
const create = (req, res) => {
  const { data: { name, description, price, image_url } = {} } = req.body;

  const newDish = {
    id: nextId(),
    name,
    description,
    price,
    image_url,
  };

  dishes.push(newDish);
  res.status(201).json({ data: newDish });
};

// PUT /dishes/:dishId
const update = (req, res, next) => {
  const { dishId } = req.params;
  let dish = res.locals.dish;
  const { data: { id, name, description, price, image_url } = {} } = req.body;

  const updateDish = {
    id: dishId,
    name,
    description,
    price,
    image_url,
  };

  dish = updateDish;

  return res.status(200).json({ data: dish });
};

module.exports = {
  list,
  read: [dishExists, read],
  create: [
    bodyHasName,
    bodyHasDescription,
    bodyHasPrice,
    bodyHasImageUrl,
    create,
  ],
  update: [
    dishExists,
    bodyHasName,
    bodyHasDescription,
    bodyHasPrice,
    bodyHasImageUrl,
    isIdValid,
    update,
  ],
};
