'use strict';

const { v4: uuidv4 } = require('uuid');
const P2PClient = require('../src/p2p/client/P2PClient');

const client = new P2PClient();

//TODO: I can used the key of the request
const id = uuidv4();

const simpleOrder = {
    id: id,
    type: 'buy',
    instrument: "BTCUSD",
    price: 105,
    quantity: 15,
    client: 'client1'
};

client.submitOrder(simpleOrder, (err, data) => {
    if (err) {
        console.error(err);
        process.exit(-1);
    }
    console.log(data);
    client.cancelOrder(id, (err, data) => {
        if (err) {
            console.error(err);
            process.exit(-1);
        }
        console.log(data);
    });
});
