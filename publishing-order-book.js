const gdax = require('gdax');
const num  = require('num');
const deepEqual  = require('fast-deep-equal');

// Extend the OrderbookSync class to trigger methods when it updates
class PublishingOrderBook extends gdax.OrderbookSync {
  constructor(product_board) {
    super(Object.keys(product_board));

    this.subscribers = {};
    this.product_board = product_board
  }

  subscribe(product_id, callback) {
    if (product_id in this.subscribers) this.subscribers[product_id].push(callback)
    else this.subscribers[product_id] = [callback]
  }

  processMessage(data) {
    super.processMessage(data);

    const { product_id } = data;
    if (product_id === undefined) return;
    const reverse_product_id = this.reverseProductID(product_id)

    const prev_values = Object.assign({}, this.product_board[product_id])

    // Update the products list with the bet
    this.product_board[product_id] = this.getProductData(product_id);
    this.product_board[reverse_product_id] = this.reverseProductData(this.product_board[product_id])

    // Return early if no changes have been made to the best prices on the board
    if (deepEqual(prev_values, this.product_board[product_id])) return

    // Trigger any subscribers
    if (product_id in this.subscribers) {
      this.subscribers[product_id].forEach(
        callback => callback(this.product_board[product_id])
      )
    }

    if (reverse_product_id in this.subscribers) {
      this.subscribers[reverse_product_id].forEach(
        callback => callback(this.product_board[reverse_product_id])
      )
    }
  }

  getProductData(product_id) {
    const book = this.books[product_id];
    const best_bid = book._bids.max();
    const best_ask = book._asks.min();


    return (
      {
        product_id: product_id,
        bid_price: best_bid.price,
        bid_size: best_bid.orders.reduce((acc, o) => o.size.add(acc), num(0)),
        ask_price: best_ask.price,
        ask_size: best_ask.orders.reduce((acc, o) => o.size.add(acc), num(0)),
      }
    )
  }

  reverseProductID(product_id) {
    const product_components = product_id.split('-')
    return product_components.slice().reverse().join('-')
  }

  reverseProductData(product_data) {
    return ({
      product_id: this.reverseProductID(product_data.product_id),
      ask_price: (num('1.000000000000').div(product_data.bid_price)),
      ask_size:  product_data.bid_size * product_data.bid_price,
      bid_price: (num('1.000000000000').div(product_data.ask_price)),
      bid_size:  product_data.ask_size * product_data.ask_price,
    })
  }
}


module.exports = PublishingOrderBook;