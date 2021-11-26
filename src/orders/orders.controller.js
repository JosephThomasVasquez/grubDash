const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

// MIDDLEWARE =================================================================================================

const bodyHasDeliverTo = (req, res, next) => {
  const { data: { deliverTo } = {} } = req.body;

  if (deliverTo === undefined || deliverTo === "") {
    next({
      status: 400,
      message: "Order must include a deliverTo",
    });
  }
  next();
};

const bodyHasMobileNumber = (req, res, next) => {
  const { data: { mobileNumber } = {} } = req.body;

  if (mobileNumber === undefined || mobileNumber === "") {
    next({
      status: 400,
      message: "Order must include a mobileNumber",
    });
  }
  next();
};

const bodyHasDishes = (req, res, next) => {
  const { data: { dishes } = {} } = req.body;

  const dishesIsArray = Array.isArray(dishes);
  console.log("isArray?", dishesIsArray);

  if (dishes === undefined || dishes === "") {
    return next({
      status: 400,
      message: "Order must include a dish",
    });
  }

  if (!dishesIsArray || dishes.length === 0) {
    return next({
      status: 400,
      message: "Order must include at least one dish",
    });
  }

  next();
};

const bodyHasDishQuantity = (req, res, next) => {
  const { data: { dishes } = {} } = req.body;

  const filterDishes = dishes.forEach((dish, index) => {
    const { quantity } = dish;

    if (
      quantity === undefined ||
      quantity === "" ||
      typeof quantity !== "number" ||
      quantity <= 0
    ) {
      return next({
        status: 400,
        message: `Dish ${index} must have a quantity that is an integer greater than 0`,
      });
    }
  });

  next();
};

// ROUTE RESOURCES (CRUD HANDLERS) =============================================================================

const list = (req, res) => {
  res.json({ data: orders });
};

const read = (req, res) => {
  res.json({ data: res.locals.order });
};

const create = (req, res) => {
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;

  const newOrder = {
    id: nextId(),
    deliverTo,
    mobileNumber,
    status,
    dishes,
  };

  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
};

module.exports = {
  list,
  create: [
    bodyHasDeliverTo,
    bodyHasMobileNumber,
    bodyHasDishes,
    bodyHasDishQuantity,
    create,
  ],
};
