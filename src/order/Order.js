const { ITime, OrderType, Action } = require('../utils/Util');

const OrderParams = Object.freeze({
    AON: 'AON', // all-or-nothing - complete fill or cancel
    IOC: 'IOC', // immediate-or-cancel - immediately fill what you can, cancel the rest
});

/**
 * Represents a tracking information of an order.
 */
const OrderTracker = {
    orderId: String,
    type: OrderType,
    action: Action,
    price: Number,
    ...ITime
};

/**
 * Represents optional order parameters.
 */
const OrderOptions = {
    stop: Boolean, // stop order (has to have stop price set)
    params: [OrderParams], // IOC + AON - immediately try to fill the whole order
    gtc: Boolean, // good-till-cancelled - keep order active until manually cancelled
    gfd: Boolean, // good-for-day keep order active until the end of the trading day
    gtd: Boolean, // good-till-date - keep order active until the provided date (including the date)
};

/**
 * Represents the main order object structure.
 */
const OrderObject = {
    ...ITime,
    ...OrderOptions,
    action: Action,
    id: String,
    instrument: String,
    clientId: String,
    type: OrderType,
    qty: Number,
    filledQty: Number,
    price: Number,
    stopPrice: Number,
    canceled: Boolean,
};

/**
 * Represents an order with additional properties.
 */
const Order = {
    ...OrderObject,
    workedOn: Date, // for any active orders
};

module.exports = {
    OrderTracker,
    OrderParams,
    OrderOptions,
    OrderObject,
    Order
};
