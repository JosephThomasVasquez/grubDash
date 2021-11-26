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

  dishes.forEach((dish, index) => {
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

const isIdValid = (req, res, next) => {
  const { orderId } = req.params;
  const { data: { id } = {} } = req.body;

  if (id === null || id === undefined || id === "") {
    return next();
  }

  if (id !== orderId) {
    return next({
      status: 400,
      message: `Order id does not match route id. Dish: ${id}, Route: ${orderId}`,
    });
  }

  next();
};

const isValidStatus = (req, res, next) => {
  const { orderId } = req.params;
  const { data: { status } = {} } = req.body;

  if (
    status === null ||
    status === undefined ||
    status === "" ||
    status === "invalid"
  ) {
    return next({
      status: 400,
      message: `Order must have a status of pending, preparing, out-for-delivery, delivered`,
    });
  }

  //   if (status === "delivered")
  return next();
};

const orderIsPending = (req, res, next) => {
  const { status } = res.locals.order;

  if (status === "pending") {
    return next();
  }

  return next({
    status: 400,
    message: `An order cannot be deleted unless it is pending`,
  });
};

const orderExists = (req, res, next) => {
  const { orderId } = req.params;

  const foundOrder = orders.find((order) => orderId === order.id);

  if (foundOrder) {
    res.locals.order = foundOrder;
    return next();
  }

  return next({ status: 404, message: `Order does not exist: ${orderId}` });
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

const update = (req, res, next) => {
  const { orderId } = req.params;
  let order = res.locals.order;
  const { data: { id, deliverTo, mobileNumber, status, dishes } = {} } =
    req.body;

  const updateOrder = {
    id: orderId,
    deliverTo,
    mobileNumber,
    status,
    dishes,
  };

  order = updateOrder;

  return res.status(200).json({ data: order });
};

const destroy = (req, res) => {
  const { orderId } = req.params;
  const index = orders.findIndex((order) => order.id === orderId);

  orders.splice(index, 1);

  return res.sendStatus(204);
};

module.exports = {
  list,
  read: [orderExists, read],
  create: [
    bodyHasDeliverTo,
    bodyHasMobileNumber,
    bodyHasDishes,
    bodyHasDishQuantity,
    create,
  ],
  update: [
    orderExists,
    bodyHasDeliverTo,
    bodyHasMobileNumber,
    bodyHasDishes,
    bodyHasDishQuantity,
    isIdValid,
    isValidStatus,
    update,
  ],
  delete: [orderExists, isIdValid, orderIsPending, destroy],
};
