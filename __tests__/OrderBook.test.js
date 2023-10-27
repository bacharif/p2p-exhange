const { OrderType, Action } = require('../src/utils/Util');
const OrderBook = require('../src/orderbook/OrderBook');

describe('OrderBook', () => {
  let orderBook;

  beforeEach(() => {
    orderBook = new OrderBook();
  });

  test('addOrder should add order to the appropriate list', () => {
    const order = {
      type: OrderType.LIMIT,
      qty: 10,
      price: 100,
      clientId: 'client1',
      action: Action.BUY,
      id: 'order1',
      instrument: 'BTCUSD',
    };
    orderBook.addOrder(order);
    expect(orderBook.buyOrders).toContain(order);
  });

  test('cancelOrder should remove order and return true', () => {
    const order = {
      type: OrderType.LIMIT,
      qty: 10,
      price: 100,
      clientId: 'client1',
      action: Action.BUY,
      id: 'order1',
      instrument: 'BTCUSD',
    };
    orderBook.addOrder(order);
    expect(orderBook.cancelOrder('order1')).toBe(true);
    expect(orderBook.buyOrders).not.toContain(order);
  });

  test('cancelOrder should return false for non-existing order', () => {
    expect(orderBook.cancelOrder('non-existing')).toBe(false);
  });

  test('removeOrder should remove order from the appropriate list', () => {
    const order = {
      type: OrderType.LIMIT,
      qty: 10,
      price: 100,
      clientId: 'client1',
      action: Action.BUY,
      id: 'order1',
      instrument: 'BTCUSD',
    };
    orderBook.addOrder(order);
    orderBook.removeOrder(order);
    expect(orderBook.buyOrders).not.toContain(order);
  });
});