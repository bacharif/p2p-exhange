'use strict';

const { PeerRPCClient } = require('grenache-nodejs-http');
const Link = require('grenache-nodejs-link');
const {OrderType, Action } = require('../../utils/Util');
const {OrderObject } = require('../../order/Order');

/**
 * Represents a client for trading operations.
 * @class
 */
class P2PClient {
    /**
     * Instantiates a P2PClient.
     * @constructor
     */
    constructor() {
        this.link = new Link({
            grape: 'http://127.0.0.1:30001'
        });
        this.link.start();
        this.peer = new PeerRPCClient(this.link, {});
        this.peer.init();
    }

    /**
     * Converts a simple order object to a complex order object.
     * @param {Object} simpleOrder - The simple order object.
     * @return {Object} The complex order object.
     */
    convertToComplexOrder(simpleOrder) {
        return {
            ...OrderObject,
            action: Action.BUY,
            id: simpleOrder.id,
            instrument: simpleOrder.instrument,
            clientId: simpleOrder.client,
            type: OrderType.LIMIT,
            qty: simpleOrder.quantity,
            price: simpleOrder.price,
            workedOn: new Date(),
        };
    }

    /**
     * Submits an order.
     * @param {Object} simpleOrder - The simple order object.
     * @param {function} callback - The callback to handle the response.
     */
    submitOrder(simpleOrder, callback) {
        const order = this.convertToComplexOrder(simpleOrder);
        this.peer.request('submit_order', { order: order }, { timeout: 10000 }, (err, data) => {
            if (err) {
                callback(err, null);
                return;
            }
            callback(null, data);
        });
    }

    /**
     * Cancels an order.
     * @param {string} orderId - The ID of the order to cancel.
     * @param {function} callback - The callback to handle the response.
     */
    cancelOrder(orderId, callback) {
        this.peer.request('cancel_order', { orderId: orderId }, { timeout: 10000 }, (err, data) => {
            if (err) {
                callback(err, null);
                return;
            }
            callback(null, data);
        });
    }
}

module.exports = P2PClient;
