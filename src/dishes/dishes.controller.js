const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

// MIDDLEWARE =================================================================================================

const dishExists = (req, res, next) => {
  const { dishId } = req.params;

  const foundDish = dishes.find((dish) => dishId === Number(dish.id));

  if (foundDish) {
    res.locals.dish = foundDish;
    next();
  }

  return next({ status: 404, message: `Dish id not found: ${dishId}` });
};

// ROUTE RESOURCES (CRUD HANDLERS) =============================================================================

const list = (req, res) => {
  res.json({ data: dishes });
};

module.exports = { list };
