'use strict';

const { PeerRPCServer, PeerRPCClient } = require('grenache-nodejs-http');
const Link = require('grenache-nodejs-link');
const OrderBook = require('../../orderbook/OrderBook');

/**
 * P2PNode class represents a peer to peer node that handles requests for order submission, cancellation, and consensus checking.
 */
class P2PNode {
  /**
   * Constructs a new P2PNode instance.
   */
  constructor() {
    this.link = new Link({ grape: 'http://127.0.0.1:30001' });
    this.link.start();

    this.peer = new PeerRPCServer(this.link, { timeout: 300000 });
    this.peer.init();

    this.peerClient = new PeerRPCClient(this.link, {});
    this.peerClient.init();

    this.orderBook = new OrderBook();

    this.port = 1024 + Math.floor(Math.random() * 1000);
    this.service = this.peer.transport('server');
    this.service.listen(this.port);

    // Announcing services periodically
    setInterval(() => {
      this.link.announce('submit_order', this.service.port, {});
      this.link.announce('cancel_order', this.service.port, {});
      this.link.announce('consensus', this.service.port, {});
    }, 1000);

    this.service.on('request', this.handleRequest.bind(this));
  }

  /**
   * Handles incoming requests for order submission, cancellation, and consensus checking.
   * @param {string} rid - Request identifier.
   * @param {string} key - The key indicating the type of request (e.g., 'submit_order', 'cancel_order', 'consensus').
   * @param {Object} payload - The payload containing the data for the request.
   * @param {Object} handler - The handler for responding to the request.
   */
  handleRequest(rid, key, payload, handler) {
    if (key === 'submit_order') {
      console.log('request', rid, key, payload);
      this.orderBook.addOrder(payload.order);
      this.peerClient.request('consensus', { timeout: 10000 }, (err, data) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log('response', rid, key, data);
      });
      handler.reply(null, { msg: 'Order submitted' });
    } else if (key === 'cancel_order') {
      console.log('request', rid, key, payload);
      const success = this.orderBook.cancelOrder(payload.orderId);
      this.peerClient.request('consensus', { timeout: 10000 }, (err, data) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log('response', rid, key, data);
      });
      handler.reply(null, { success: success, msg: success ? 'Order cancelled' : 'Failed to cancel order' });
    } else if (key === 'consensus') {
      this.orderBook.checkForConsensus();
      console.log('END OF CONSENSUS');
      handler.reply(null, { msg: 'Consensus checked' });
    }
  }
}

module.exports = P2PNode;
