const gdax = require('gdax')

const api_info = require('./keys.json')

const API_URI = 'https://api.gdax.com'

const EXECUTION_RATE_THRESHOLD = 1.0010
const MAX_SPEND = {
  'USD': 0.1,
  'LTC': 0.001,
  'ETH': 0.0001,
  'BTC': 0.00001,
}

const bunyan = require('bunyan');
const orderLog = bunyan.createLogger({
  name: "order-log",
  streams: [
    {
      level: 'info',
      stream: process.stdout
    },
    {
      type: 'rotating-file',
      path: './logs/order-log.log',
      period: '1d',
      count: 28,
    },
  ],
})

const liveOrderLog = bunyan.createLogger({
  name: "live-order-log",
  streams: [
    {
      level: 'info',
      stream: process.stdout
    },
    {
      type: 'rotating-file',
      path: './logs/live-order-log.log',
      period: '1d',
      count: 28,
    },
  ],
})

class Purchaser {

  constructor () {
    this.orderingEnabled = true
    const {
      key,
      secret,
      passphrase,
    } = api_info

    this.authedClient = new gdax.AuthenticatedClient(
      key,
      secret,
      passphrase,
      API_URI,
    )
  }

  evaluate(prediction) {
    if (prediction.rate > EXECUTION_RATE_THRESHOLD) this.execute(prediction)
  }

  execute(prediction) {
    // TODO: Duplicated from index. Create single src of truth
    const products = [
      'BCH-USD',
      'LTC-USD',
      'LTC-BTC',
      'ETH-USD',
      'ETH-BTC',
      'BTC-USD',
    ]

    const input_amount = Math.min(
      MAX_SPEND[prediction.from_cur],
      prediction.max_input
    )
    const expected_output = prediction.rate * input_amount

    const buy_params = []
    const sell_params = []
    let amount = input_amount

    prediction.conversions.forEach((conversion) => {
      if (conversion.name in products) {
        buy_params.push({
          'price': conversion.rate,
          'size': amount,
          'product_id': conversion.name
        })
      } else {
        sell_params.push({
          'price': 1.0 / conversion.rate,
          'size': amount,
          'product_id': this.reverseProductID(conversion.name)
        })
      }

      amount *= conversion.rate
    })

    orderLog.info(prediction)
    orderLog.info(buy_params, {'action': 'buy'})

    // LIVE ORDERING
    // For the time being, execute one order only and then switch
    // capability off until restart. This is a safeguard to check
    // that everything works before giving program more leeway
    if (this.orderingEnabled) {
      this.orderingEnabled = false

      liveOrderLog.info(prediction)
      liveOrderLog.info(buy_params, {'action': 'buy'})
      liveOrderLog.info(sell_params, {'action': 'sell'})

      buy_params.forEach((buy_param) => this.authedClient.buy(buy_param, this.handleOrderResponse))
      sell_params.forEach((sell_param) => this.authedClient.sell(sell_param, this.handleOrderResponse))
    }
  }

  handleOrderResponse(err, resp, data) {
    if (err) liveOrderLog.err(err)
    liveOrderLog.info(data)
  }

  reverseProductID(product_id) {
    const product_components = product_id.split('-')
    return product_components.slice().reverse().join('-')
  }
}

module.exports = Purchaser;