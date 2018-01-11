const Prediction = require('./prediction')

class Chain {
  constructor(conversions) {
    this.listeners = []

    this.conversions = conversions
    this.from_cur = conversions[0].from_cur
    this.to_cur = conversions[conversions.length - 1].to_cur
    this.name = conversions.map(
      conversion => conversion.from_cur
    ).join('-') + `-${this.to_cur}`

    this.rate = null
    this.max_input = null

    // Subscribe to updates from conversions
    this.conversions.forEach(
      conversion => conversion.subscribe(
        conversion => this.update(conversion)
      )
    )
  }

  update(conversion) {
    // Exit early if not all of the conversions are ready
    if (this.conversions.some(conversion => !conversion.ready())) return

    this.rate = this.conversions.reduce(
      (amount, conversion) => conversion.convert(amount),
      1.0   // Initial amount
    )

    const max_output = this.conversions.reduce(
      (amount, conversion) => conversion.convert(Math.min(amount, conversion.max_input)),
      Infinity
    )

    this.max_input = max_output / this.rate

    // Spin-off prediction
    const prediction = new Prediction(this)
    this.listeners.forEach(listener => listener(prediction))
  }

  subscribe(callback) {
    this.listeners.push(callback)
  }

  toData() {
    const {
      name,
      from_cur,
      to_cur,
      rate,
      max_input,
      conversions,
    } = this

    return {
      name,
      from_cur,
      to_cur,
      rate,
      max_input,
      conversions: conversions.map(conversion => conversion.toData()),
    }
  }
}

module.exports = Chain