const { OrderType, Action } = require('../utils/Util');
const { Order } = require('../order/Order');

/**
 * Manages order matching and execution.
 */
class OrderBook {
    constructor() {
         /** @type {Order[]} List of pending orders */
        this.pendingOrders = [];
        /** @type {Array} Blocks of orders for consensus */
        this.blocks = [];
        /** @type {Order[]} List of buy orders */
        this.buyOrders = [];
        /** @type {Order[]} List of sell orders */
        this.sellOrders = [];
        /** @type {Object[]} List of executed trades */
        this.tradeBook = [];
    }

    /**
     * Validates an order's structure.
     * @param {Order} order - The order to validate
     * @throws Will throw an error if the order is invalid
     */
    validateOrder(order) {
        if (!(order instanceof Object)) {
            throw new Error('Invalid order object');
        }

        const { type, qty, price } = order;


        if (typeof qty !== 'number' || qty <= 0) {
            throw new Error('Invalid quantity');
        }

        if (typeof price !== 'number' || price < 0) {
            throw new Error('Invalid price');
        }
    }

     /**
     * Adds an order to the order book.
     * @param {Order} order - The order to add
     */
    addOrder(order) {
        this.pendingOrders.push(order);
        this.checkForConsensus();
        this.validateOrder(order);

        if (order.action === Action.BUY) {
            this.buyOrders.push(order);
            this.buyOrders.sort((a, b) => b.price - a.price);
        } else {
            this.sellOrders.push(order);
            this.sellOrders.sort((a, b) => a.price - b.price);
        }
    }

    /**
     * Cancels an order in the order book.
     * @param {string} orderId - The ID of the order to cancel
     * @returns {boolean} - Returns true if the order was cancelled, false otherwise
     */
    cancelOrder(orderId) {
        this.pendingOrders = this.pendingOrders.filter(order => order.id !== orderId);
        const buyOrderIndex = this.buyOrders.findIndex(order => order.id === orderId);
        if (buyOrderIndex !== -1) {
            const canceledOrder = this.buyOrders.splice(buyOrderIndex, 1)[0];
            console.log(`Cancelled buy order: ${canceledOrder.id}`);
            return true;
        }

        const sellOrderIndex = this.sellOrders.findIndex(order => order.id === orderId);
        if (sellOrderIndex !== -1) {
            const canceledOrder = this.sellOrders.splice(sellOrderIndex, 1)[0];
            console.log(`Cancelled sell order: ${canceledOrder.id}`);
            return true;
        }

        console.log(`Order not found: ${orderId}`);
        return false;
    }

    /**
     * Checks for a consensus to execute a block of orders.
     */
    checkForConsensus() {
        // TODO: think about a better way to do this and not only use the first 10 orders
        if (this.pendingOrders.length >= 10) {
            const block = this.pendingOrders.slice(0, 10);
            this.pendingOrders = this.pendingOrders.slice(10);
            this.executeBlock(block);
        }
    }

    /**
     * Executes a block of orders.
     * @param {Order[]} block - The block of orders to execute
     */
    executeBlock(block) {
        let successfulTransactions = [];

        for (let order of block) {
            if (this.checkForDuplicates(order)) {
                console.log(`Order ${order.id} is a duplicate and will be ignored.`);
                continue;
            }

            let matchingOrder;
            if (order.type === OrderType.BUY) {
                matchingOrder = this.sellOrders.find(sellOrder => sellOrder.price <= order.price);
            } else {
                matchingOrder = this.buyOrders.find(buyOrder => buyOrder.price >= order.price);
            }

            if (matchingOrder) {
                const matchedQty = Math.min(order.qty, matchingOrder.qty);
                const matchedPrice = (order.price + matchingOrder.price) / 2;
                const trade = {
                    buyer: order.type === OrderType.BUY ? order.clientId : matchingOrder.clientId,
                    seller: order.type === OrderType.SELL ? order.clientId : matchingOrder.clientId,
                    qty: matchedQty,
                    price: matchedPrice,
                    date: new Date()
                };
                successfulTransactions.push(trade);
                console.log(`Matched ${matchedQty} units at $${matchedPrice} per unit.`);

                order.qty -= matchedQty;
                matchingOrder.qty -= matchedQty;

                if (matchingOrder.qty === 0) {
                    this.removeOrder(matchingOrder);
                }
            } else {
                this.pendingOrders.push(order);
            }
        }
        this.tradeBook.push(...successfulTransactions);
    }

    /**
     * Checks for duplicate orders in the trade book.
     * @param {Order} order - The order to check
     * @returns {boolean} - Returns true if a duplicate is found, false otherwise
     */
    checkForDuplicates(order) {
        return this.tradeBook.some(trade => {
            return trade.buyer === order.clientId || trade.seller === order.clientId;
        });
    }

    /**
     * Removes an order from the order book.
     * @param {Order} order - The order to remove
     */
    removeOrder(order) {
        const { id, action } = order;

        if (action === Action.BUY) {
            const index = this.buyOrders.findIndex(existingOrder => existingOrder.id === id);
            if (index !== -1) {
                this.buyOrders.splice(index, 1);
            } else {
                console.warn(`Order with id ${id} not found in buyOrders.`);
            }
        } else if (action === Action.SELL) {
            const index = this.sellOrders.findIndex(existingOrder => existingOrder.id === id);
            if (index !== -1) {
                this.sellOrders.splice(index, 1);
            } else {
                console.warn(`Order with id ${id} not found in sellOrders.`);
            }
        } else {
            console.error(`Invalid order action: ${action}`);
        }
    }

}

module.exports = OrderBook;
