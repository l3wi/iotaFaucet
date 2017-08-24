require('dotenv').config()

var IOTA = require("iota.lib.js")
const { json } = require('micro')

// Create IOTA instance directly with provider
const iota = new IOTA({
  provider: process.env.IOTA
})

const seed = process.env.SEED

const fundAddress = async (address) => {
  var transfers = [{
    address,  value: 400
  }]

  return new Promise(function(resolve, reject) {
    iota.api.prepareTransfers(seed,
      transfers, (e, r) => {
      if (e) {
        reject(e)
      } else {
        console.log(r)
        resolve(r)
      }
    })
  })
}

module.exports = async (req, res) => {
  const js = await json(req)
  console.log(js.address)
  return await fundAddress(js.address)
}
