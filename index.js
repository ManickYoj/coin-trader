const Gdax = require('gdax');
const publicClient = new Gdax.PublicClient();

const PRODUCT_LIST = [
  'BCH-USD',
  'LTC-EUR',
  'LTC-USD',
  'LTC-BTC',
  'ETH-EUR',
  'ETH-USD',
  'ETH-BTC',
  'BTC-GBP',
  'BTC-EUR',
  'BTC-USD',
]


const chains = [
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
  // {
  //   name: 'USD-ETH-LTC-USD',
  //   steps: [['USD', 'ETH'], ['ETH', 'LTC'], ['LTC', 'USD']],
  //   step_count: 3,
  //   commission: .0075,
  // },
  // {
  //   name: 'USD-LTC-ETH-USD',
  //   steps: [['USD', 'LTC'], ['LTC', 'ETH'], ['ETH', 'USD']],
  //   step_count: 3,
  //   commission: .0075,
  // },
  // {
  //   name: 'USD-LTC-ETH-BTC-USD',
  //   steps: [['USD', 'LTC'], ['LTC', 'ETH'], ['ETH', 'BTC'], ['BTC', 'USD']],
  //   step_count: 4,
  //   commission: .0100,
  // },
  {
    name: 'USD-LTC-BTC-ETH-USD',
    steps: [['USD', 'LTC'], ['LTC', 'BTC'], ['BTC', 'ETH'], ['ETH', 'USD']],
    step_count: 4,
    commission: .0100,
  },
  // {
  //   name: 'USD-BTC-LTC-ETH-USD',
  //   steps: [['USD', 'BTC'], ['BTC', 'LTC'], ['LTC', 'ETH'], ['ETH', 'USD']],
  //   step_count: 4,
  //   commission: .0100,
  // },
  // {
  //   name: 'USD-BTC-ETH-LTC-USD',
  //   steps: [['USD', 'BTC'], ['BTC', 'ETH'], ['ETH', 'LTC'], ['LTC', 'USD']],
  //   step_count: 4,
  //   commission: .0100,
  // },
  {
    name: 'USD-ETH-BTC-LTC-USD',
    steps: [['USD', 'ETH'], ['ETH', 'BTC'], ['BTC', 'LTC'], ['LTC', 'USD']],
    step_count: 4,
    commission: .0100,
  },
  // {
  //   name: 'USD-ETH-LTC-BTC-USD',
  //   steps: [['USD', 'ETH'], ['ETH', 'LTC'], ['LTC', 'BTC'], ['BTC', 'USD']],
  //   step_count: 4,
  //   commission: .0100,
  // },
  {
    name: 'USD-ETH-EUR-LTC-USD',
    steps: [['USD', 'ETH'], ['ETH', 'EUR'], ['EUR', 'LTC'], ['LTC', 'USD']],
    step_count: 4,
    commission: .0100,
  },
  {
    name: 'USD-ETH-EUR-BTC-USD',
    steps: [['USD', 'ETH'], ['ETH', 'EUR'], ['EUR', 'BTC'], ['BTC', 'USD']],
    step_count: 4,
    commission: .0100,
  },
  {
    name: 'USD-BTC-EUR-LTC-USD',
    steps: [['USD', 'BTC'], ['BTC', 'EUR'], ['EUR', 'LTC'], ['LTC', 'USD']],
    step_count: 4,
    commission: .0100,
  },
  {
    name: 'USD-BTC-EUR-ETH-USD',
    steps: [['USD', 'BTC'], ['BTC', 'EUR'], ['EUR', 'ETH'], ['ETH', 'USD']],
    step_count: 4,
    commission: .0100,
  },
  {
    name: 'USD-LTC-EUR-BTC-USD',
    steps: [['USD', 'LTC'], ['LTC', 'EUR'], ['EUR', 'BTC'], ['BTC', 'USD']],
    step_count: 4,
    commission: .0100,
  },
  {
    name: 'USD-LTC-EUR-ETH-USD',
    steps: [['USD', 'LTC'], ['LTC', 'EUR'], ['EUR', 'ETH'], ['ETH', 'USD']],
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

function promisifyGetOrderBook (product_name) {
  publicClient.productID = product_name  // Crappy workaround for buggy library

  return new Promise((resolve, reject) => {
    publicClient.getProductOrderBook(product_name, (error, response, book) => {
      if (error) reject(error)
      else resolve(book)
    })
  })
}

let orderCache = {}

function getBestOrder (products) {
  return new Promise((resolve, reject) => {
    let product_name = products.join('-')
    const reverse_order_book = PRODUCT_LIST.indexOf(product_name) === -1
    if (reverse_order_book) product_name = products.slice().reverse().join('-')

    // Use cache if available to avoid hitting rate limit
    if (product_name in orderCache) {
      resolve(orderCache[product_name])
    }

    promisifyGetOrderBook(product_name).then(book => {
      if (reverse_order_book) {
        // Sells, ie buys of the reverse exchange, happen at bid price
        price = (1 / parseFloat(book.bids[0][0])).toFixed(10)
        volume = book.bids[0][1]
      } else {
        // Buys happen at ask price
        price = book.asks[0][0]
        volume = book.asks[0][1]
      }

      const order = {
        price,
        volume,
      }

      // Cache
      orderCache[product_name] = order
      resolve(order)

    }).catch(reject)
  })
}

function calculateChain (chain) {
  return Promise.all(chain.steps.map(step => getBestOrder(step)))
    .then(book => {
      const chain_result = book.reduce((accumulator, el) => ({
        price: (accumulator.price * el.price),
        // Faulty
        // volume: Math.min(accumulator.volume, el.volume),
      }))
      chain.profit = chain_result.price - chain.commission - 1

      // Log result in green if profitable, red otherwise
      console.log(` TRADE: ${chain.name}`)
      const profitColor = chain.profit > 0 ? "\x1b[32m" : "\x1b[31m"
      process.stdout.write(` PROFIT: `)
      console.log(profitColor, `${(chain.profit*100).toFixed(2)}%`)
      console.log("\x1b[0m", `---`)
    }).catch(err => console.error(err))
}

function chainTicker(chain, interval) {
  // Execute 1 tick immediately on activation
  orderCache = {}
  calculateChain(chain)

  // Tick continuously once per interval after
  setInterval(() => {
    orderCache = {}; calculateChain(chain)
  }, interval, chain)
}

function chainsTicker() {
  interval = chains.length * 1000
  chains.forEach((chain, index) => {
    setTimeout(chainTicker, index * 1000, chain, interval)
  })
}

// -- Executing code
// chains.forEach(chain => calculateChain(chain))
chainsTicker()

// Automated chain generation code. Not operational.
// function getProducts() {
//   return new Promise((resolve, reject) => {
//     publicClient.getProducts((err, resp, data) => {
//       if (err) reject(err);
//       else resolve(data)
//     })
//   })
// }
//
// function generateChains (base, available_steps, chain, depth_remaining) {
//   if (depth_remaining == 0) return chain.filter(chain => chain[chain.length - 1][1] === base)
//   console.log(depth_remaining)
//   console.log(chain)

//   return generateChains(base, available_steps, available_steps.map(step => [...chain, step]), depth_remaining - 1)
// }

// function chains (products, maxSteps = 2, base = 'USD') {
//   let available_steps = []
//   products.forEach(product => {
//     pt_one = product.substring(0, 3)
//     pt_two = product.substring(4, 7)
//     available_steps.push([pt_one, pt_two])
//     available_steps.push([pt_two, pt_one])
//   })

//   generateChains(base, available_steps, [], maxSteps).filter(chain => chain[0][0] === base)
// }

// getProducts().then(blobs => {
//   const products = blobs.map(blob => blob.id)
//   chains(products)
// }).catch((err) => {
//   console.error(err)
// });
