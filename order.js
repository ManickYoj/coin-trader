class Order {
  constructor(chain, timestamp = new Date()) {
    this.name = `${chain.name} at ${timestamp}`
    this.timestamp = timestamp

    this.from_cur = chain.from_cur
    this.to_cur = chain.to_cur

    this.rate = chain.rate
    this.max_input = chain.max_input
    this.max_output = this.calculate(this.max_input)
  }

  calculate(amount) {
    return this.rate * this.max_input
  }

  toData() {
    return {
      name: this.name,
      timestamp: this.timestamp,
      rate: this.rate,
      max_input: this.max_input,
      max_output: this.max_output,
      from_cur: this.from_cur,
      to_cur: this.to_cur,
    }
  }

  execute() {}
}

module.exports = Order