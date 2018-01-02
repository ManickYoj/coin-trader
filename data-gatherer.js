// TODO: Sanity check bid/ask prices. They don't always mean intuitive things.

const Gdax = require('gdax');
const num  = require('num');

const products = {
  'BCH-USD': {},
  // 'LTC-EUR': {},
  'LTC-USD': {},
  'LTC-BTC': {},
  // 'ETH-EUR': {},
  'ETH-USD': {},
  'ETH-BTC': {},
  // 'BTC-GBP': {},
  // 'BTC-EUR': {},
  'BTC-USD': {},
}

function displayProductData() {
  console.log("UPDATE:  ")
  Object.values(products).forEach(product => {
    Object.entries(product).forEach(property => {
      console.log(`${property[0]}: ${property[1].toString()}`)
    })
    console.log("--")
  })
  console.log("")
  console.log("")
}

// Extend the OrderbookSync class to trigger methods when it updates
class TriggeringOrderBook extends Gdax.OrderbookSync {
  processMessage(data) {
    super.processMessage(data);

    const { product_id } = data;
    if (product_id === undefined) return;

    // Update the products list with the bet
    products[product_id] = this.getProductData(product_id);
    products[this.reverseProductID(product_id)] = this.reverseProductData(products[product_id])
    displayProductData()
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

const orderbookSync = new TriggeringOrderBook(Object.keys(products));
module.exports = TriggeringOrderBook;