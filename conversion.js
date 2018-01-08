/**
 * The conversion from one currency to another. To be used via its subscriber
 * interface. This class is a tool; it doesn't store data on particular orders.
 */
class Conversion {
  constructor(from_cur, to_cur, product_data_source) {
    this.listeners = []
    this.name = from_cur + '-' + to_cur
    this.from_cur = from_cur
    this.to_cur = to_cur
    if (
      ['ETH', 'LTC'].includes(from_cur) ||
      ['ETH', 'LTC'].includes(to_cur)
    ) this.commission = .0030
    else this.commission = .0025

    this.rate = null
    this.max_input = null

    product_data_source.subscribe(this.name, (product_data) => this.update(product_data))
  }

  ready() {
    return this.rate && this.max_input
  }

  subscribe(callback) {
    this.listeners.push(callback)
  }

  // Subscribed to the relevant product board
  update(product_data) {
    this.rate = parseFloat(product_data.ask_price.toString())
    this.max_input = parseFloat(product_data.ask_size.toString())
    this.listeners.forEach(listener => listener(this))
  }

  convert(amount) {
    if (!this.ready()) throw `Conversion ${this.name} not yet ready to calculate.`
    return (amount * this.rate) * (1-this.commission)
  }
}

module.exports = Conversion