const num  = require('num');
var fs = require('fs');

function pad(number) {
  if (number < 10) return '0' + number
  else return number
}

class Chain {
  constructor(steps) {
    this.steps = steps.map(step => new Step(step[0], step[1]))
    this.step_names = this.steps.map(step => step.name)
    this.name = this.step_names.join(', ')
  }

  calculable(product_board) {
    return (this.step_names.every(name => {
      return (name in product_board) &&
      product_board[name] !== undefined &&
      product_board[name].ask_price !== undefined
    }))
  }

  profitability(product_board) {
    return this.steps.reduce((total, step) => {
      const rate = product_board[step.name].ask_price
      return step.calculate(total, rate)
    }, num(100)) - 100
  }

  snapshot(product_board, timestamp = new Date()) {
    // Going old school because there's no clean way
    // to do this with map/reduce. Probably a code smell
    var step_snapshots = []
    var total = num(100)
    for (var i = 0; i < this.steps.length; i++) {
      var step = this.steps[i]
      step_snapshots.push(step.snapshot(
        total,
        product_board[step.name].ask_price,
        timestamp,
      ))
      var total = step_snapshots[i].to_amount
    }

    return {
      name: this.name,
      timestamp,
      steps: step_snapshots,
      profitability: this.profitability(product_board),
    }
  }

  log(snapshot) {
    const ts = snapshot.timestamp
    fs.appendFile(
      `logs/${ts.getUTCFullYear()}-${pad(ts.getUTCMonth()+1)}-${pad(ts.getUTCDate())}.txt`,
      this.toString(snapshot),
    function (err) {
      if (err) throw err;
    });
  }

  update(product_id, product_board) {
    if (
      this.step_names.includes(product_id) && // If update is relevant
      this.calculable(product_board)
    ) {
      const profitability = this.profitability(product_board)
      const snapshot = this.snapshot(product_board)
      this.display(snapshot)
      if (profitability > 0 ) this.log(snapshot)
    }
  }

  toString(snapshot) {
    return(
`TRADE: ${snapshot.name} at ${snapshot.timestamp}
PROFITABILITY: ${snapshot.profitability}%
--
${snapshot.steps.map(step => step.instructions).join('\n')}
-----
`
    )
  }

  display(snapshot) {
    console.log(` TRADE: ${snapshot.name}`)
    const profitabilityColor = snapshot.profitability > 0 ? "\x1b[32m" : "\x1b[31m"
    process.stdout.write(` PROFITABILITY: `)
    console.log(profitabilityColor, `${snapshot.profitability}%`)
    console.log("\x1b[0m", `--`)
    snapshot.steps.forEach(step => console.log(step.instructions))
    console.log('-----')
  }
}

class Step {
  constructor(from_cur, to_cur) {
    this.from_cur = from_cur,
    this.to_cur = to_cur
    this.name = this.from_cur + '-' + this.to_cur

    // GDax charges .30% on LTC and ETH exchanges, only .25% on BTC
    if (
      ['ETH', 'LTC'].includes(from_cur) ||
      ['ETH', 'LTC'].includes(to_cur)
    ) this.commission_rate = num(.0030)
    else this.commission_rate = num(.0025)
  }

  calculate(from_amount, rate) {
    const to_amount_raw = from_amount * rate
    const commission = to_amount_raw * this.commission_rate
    const to_amount = to_amount_raw - commission
    return to_amount
  }

  snapshot(from_amount, rate, timestamp = new Date()) {
    // Duplicated logic so that commission is accessible
    const to_amount_raw = from_amount * rate
    const commission = to_amount_raw * this.commission_rate
    const to_amount = to_amount_raw - commission

    return ({
      name: this.name,
      from_amount,
      to_amount,
      commission,
      rate,
      timestamp,
      to_cur: this.to_cur,
      from_cur: this.from_cur,
      instructions: this._toString(
        from_amount,
        to_amount,
        rate,
        commission
      ),
    })
  }

  _toString(from_amount, to_amount, rate, commission) {
    return (
`STEP ${this.name}
  Convert:
    ${from_amount} ${this.from_cur} to
    ${to_amount} ${this.to_cur} at
    ${rate} ${this.from_cur}/${this.to_cur}
    (${commission} ${this.to_cur} commission lost)`
    )
  }
}

module.exports = Chain;