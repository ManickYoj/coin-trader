const PublishingOrderBook = require('./publishing-order-book')
const Chain = require('./chain')

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

// Running code
const order_book = new PublishingOrderBook(product_board);
const chains = CHAIN_CONFIG.map(chain_data => {
  const chain = new Chain(chain_data.steps)
  order_book.subscribe((product_id, product_board) => {chain.update(product_id, product_board)})
  return chain
})