class Prediction {
  constructor(chain, timestamp = new Date()) {
    this.name = `${chain.name} at ${timestamp}`
    this.timestamp = timestamp

    this.from_cur = chain.from_cur
    this.to_cur = chain.to_cur

    this.rate = chain.rate
    this.max_input = chain.max_input
    this.max_output = this.calculate(this.max_input)
    this.conversions = chain.conversions.map(
      conversion => conversion.toData()
    )
  }

  calculate(amount) {
    return this.rate * this.max_input
  }

  toData() {
    const {
      name,
      timestamp,
      rate,
      max_input,
      max_output,
      from_cur,
      to_cur,
      conversions,
    } = this

    return {
      name,
      timestamp,
      rate,
      max_input,
      max_output,
      from_cur,
      to_cur,
      conversions,
    }
  }

  execute() {}
}

module.exports = Prediction