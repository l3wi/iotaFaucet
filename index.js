require("dotenv").config()
var genericPool = require("generic-pool")
var IOTA = require("iota.lib.js")
const express = require("express")
var cors = require("cors")
var bodyParser = require("body-parser")
var app = express()

app.use(bodyParser.json())

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  )
  next()
})
// const cors = require("micro-cors")()

// const { send, text } = require("micro")

const factory = {
  create: function() {
    return new Promise(function(resolve, reject) {
      // Create IOTA instance directly with provider
      const iota = new IOTA({
        provider: process.env.IOTA
      })
      resolve(iota)
    })
  },
  destroy: function(iota) {
    return new Promise(function(resolve, reject) {
      resolve()
    })
  }
}

var myPool = genericPool.createPool(factory, { min: 2, max: 10 })

const fundAddress = async (iota, address) => {
  var transfers = [
    {
      address: address,
      value: parseInt(process.env.AMOUNT),
      tag: `SATOSHIDEMO`
    }
  ]

  return new Promise((resolve, reject) => {
    iota.api.prepareTransfers(
      process.env.SEED,
      transfers,
      { security: 2 },
      (e, trytes) => {
        if (e) {
          console.log(e)
          reject(e)
        } else {
          console.log(trytes)
          resolve(trytes)
        }
      }
    )
  })
}

app.post("/", async (req, res, next) => {
  const resourcePromise = myPool.acquire()
  // Pass back the IOTA object
  resourcePromise
    .then(async iota => {
      console.log("Generating an address for: ", req.body.address)
      const trytes = await fundAddress(iota, req.body.address)
      res.json(trytes)
    })
    .catch(err => {
      console.log(err)
      return err
    })
})

app.listen(3000, function() {
  console.log("Listening on port 3000")
})
