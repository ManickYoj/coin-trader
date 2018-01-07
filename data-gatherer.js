// TODO: Sanity check bid/ask prices. They don't always mean intuitive things.

const Gdax = require('gdax');
const num  = require('num');

// Extend the OrderbookSync class to trigger methods when it updates
class PublishingOrderBook extends Gdax.OrderbookSync {
  constructor() {
    super();

    this.subscribers = [];
  }

  subscribe(callback) {
    this.subscribers.push(callback)
  }

  processMessage(data) {
    super.processMessage(data);

    const { product_id } = data;
    if (product_id === undefined) return;

    // Update the products list with the bet
    products[product_id] = this.getProductData(product_id);
    products[this.reverseProductID(product_id)] = this.reverseProductData(products[product_id])

    // Trigger any subscribers
    this.subscribers.forEach((callback) => {
      callback(product_id, products)
      callback(this.reverseProductID(product_id), products)
    })
    // displayProductData()
  }

  getProductData(product_id) {
    const book = this.books[product_id];
    const best_bid = book._bids.max();
    const best_ask = book._asks.min();

    return ({
      product_id: product_id,
      bid_price: best_bid.price,
      bid_size: best_bid.orders.reduce((acc, o) => o.size.add(acc), num(0)),
      ask_price: best_ask.price,
      ask_size: best_ask.orders.reduce((acc, o) => o.size.add(acc), num(0)),
    })
  }

  reverseProductID(product_id) {
    const product_components = product_id.split('-')
    return product_components.slice().reverse().join('-')
  }

  reverseProductData(product_data) {
    return ({
      product_id: this.reverseProductID(product_data.product_id),
      ask_price: (num('1.000000000000').div(product_data.bid_price)),
      ask_size:  (num('1.000000000000').div(product_data.bid_size)),
      bid_price: (num('1.000000000000').div(product_data.ask_price)),
      bid_size:  (num('1.000000000000').div(product_data.ask_size)),
    })
  }
}


module.exports = TriggeringOrderBook;