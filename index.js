// -- Library imports
const bunyan = require('bunyan');
const fs = require('fs');

// -- File imports
const PublishingOrderBook = require('./publishing-order-book')
const Conversion = require('./conversion')
const Chain = require('./chain')

// -- Constant definitions
const PROFITABILITY_THRESHOLD = 1.0025
const tradeLog = bunyan.createLogger({
  name: "trade-log",
  streams: [
    {
      level: 'info',
      stream: process.stdout
    },
    {
      type: 'rotating-file',
      path: './logs/trade-log.log',
      period: '1d',
      count: 28,
    },
  ],
})

const product_board = {
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

const CHAIN_CONFIG = [
  {
    name: 'USD-BTC-ETH-USD',
    steps: [['USD', 'BTC'], ['BTC', 'ETH'], ['ETH', 'USD']],
    step_count: 3,
    commission: .0075,
  },
  {
    name: 'USD-ETH-BTC-USD',
    steps: [['USD', 'ETH'], ['ETH', 'BTC'], ['BTC', 'USD']],
    step_count: 3,
    commission: .0075,
  },
  {
    name: 'USD-LTC-BTC-USD',
    steps: [['USD', 'LTC'], ['LTC', 'BTC'], ['BTC', 'USD']],
    step_count: 3,
    commission: .0075,
  },
  {
    name: 'USD-BTC-LTC-USD',
    steps: [['USD', 'BTC'], ['BTC', 'LTC'], ['LTC', 'USD']],
    step_count: 3,
    commission: .0075,
  },
  {
    name: 'USD-LTC-BTC-ETH-USD',
    steps: [['USD', 'LTC'], ['LTC', 'BTC'], ['BTC', 'ETH'], ['ETH', 'USD']],
    step_count: 4,
    commission: .0100,
  },
  {
    name: 'USD-ETH-BTC-LTC-USD',
    steps: [['USD', 'ETH'], ['ETH', 'BTC'], ['BTC', 'LTC'], ['LTC', 'USD']],
    step_count: 4,
    commission: .0100,
  },


  // LTC
  {
    name: 'LTC-BTC-USD-LTC',
    steps: [['LTC', 'BTC'], ['BTC', 'USD'], ['USD', 'LTC']],
    step_count: 3,
    commission: .0075,
  },
  {
    name: 'LTC-USD-BTC-LTC',
    steps: [['LTC', 'USD'], ['USD', 'BTC'], ['BTC', 'LTC']],
    step_count: 3,
    commission: .0075,
  },

  // ETH
  {
    name: 'ETH-BTC-USD-ETH',
    steps: [['ETH', 'BTC'], ['BTC', 'USD'], ['USD', 'ETH']],
    step_count: 3,
    commission: .0075,
  },
  {
    name: 'ETH-USD-BTC-ETH',
    steps: [['ETH', 'USD'], ['USD', 'BTC'], ['BTC', 'ETH']],
    step_count: 3,
    commission: .0075,
  },
]


// -- Utility functions
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

// -- Running code
console.log('Starting...')
console.log('Creating order book...')
const order_book = new PublishingOrderBook(product_board);

console.log('Creating conversions...')
const conversions = {}
Object.keys(product_board).forEach(
  conversion_name => {
    const [from, to] = conversion_name.split('-')
    conversions[`${from}-${to}`] = new Conversion(from, to, order_book)
    conversions[`${to}-${from}`] = new Conversion(to, from, order_book)
  }
)

console.log('Creating chains...')
const chains = CHAIN_CONFIG.map(chain_data => {
  return new Chain(chain_data.steps.map(step => conversions[step.join('-')]))
})

console.log('Setup complete. Beginning to process data.')

// Order processing
chains.forEach(chain => {
  chain.subscribe(prediction => tradeLog.info(prediction))
})