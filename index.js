require('dotenv').config()
var genericPool = require('generic-pool');
const cors = require('micro-cors')()
var IOTA = require("iota.lib.js")
const { send, json } = require('micro')


const factory = {
  create: function(){
   return new Promise(function(resolve, reject){
     // Create IOTA instance directly with provider
      const iota = new IOTA({
        provider: process.env.IOTA
      })
      resolve(iota)
    })
  },
  destroy: function(iota){
    return new Promise(function(resolve, reject){
      resolve()
    })
  }
}

var myPool = genericPool.createPool(factory, {min: 2, max: 10})

const fundAddress = async (iota, address) => {
  var transfers = [{
    address: address, value: parseInt(process.env.AMOUNT), tag: `TANGLEWORKSFAUCET`
  }]

  return new Promise((resolve, reject) => {
      iota.api.prepareTransfers(process.env.SEED,
        transfers, (e, trytes) => {
        if (e) {
          console.log(e)
          reject(e)
        } else {
          console.log(trytes)
          resolve(trytes)
        }
      })
  })
}

module.exports = cors(async (req, res) => {
  console.log("Request Recieved")    
  const js = await json(req)
  // Get new pool 
  const resourcePromise = myPool.acquire()
  // Pass back the IOTA object
  resourcePromise.then(async (iota) => {
    console.log("Generating an address for: ", js.address)    
    const trytes = await fundAddress(iota, js.address)
    send(res, 200, trytes)
  })
  .catch((err) => {
     console.log(err)
     return err
  });
})
