function ITime(date) {
    this.date = date;
}

const OrderType = Object.freeze({
    MARKET: 'market',
    LIMIT: 'limit'
});

const Action = Object.freeze({
    BUY: 'BUY',
    SELL: 'SELL'
});

module.exports = {
    ITime,
    OrderType,
    Action
};
