'use strict'

const { commandToBytes } = require('./qmk-rc.js')
const http = require('http')
const HID = require('node-hid');
const jsonBody = require('body/json')
const sendJson = require('send-data/json')

var devices = HID.devices();

const DEFAULT_USAGE = {
  usage: 0x61,
  usagePage: 0xFF60
}

const DEVICES = {
  planck: {
    vendorId: 0x3297,
    productId: 0xC6CE,
  },
  corne: {
    vendorId: 18003,
    productId: 1,
  }
}

const target = process.argv[2]

if (target && !DEVICES[target]) {
  console.log('no such device known')
  process.exit(3)
}

const onerror = (err) => {
  console.log(err)
  process.exit(1)
}


const writeCommand = (kbd, command) => {
  const bytes = commandToBytes(command)
  kbd.write(bytes)
  return bytes
}

const device = devices.find(d =>
  (target ?
    (d.vendorId === DEVICES[target].vendorId &&
    d.productId === DEVICES[target].productId) : true)
  &&
    d.usage === DEFAULT_USAGE.usage &&
    d.usagePage === DEFAULT_USAGE.usagePage
)

if (!device) {
  console.error('device not found (is the device connected? is raw HID enabled?)')
  console.log(devices)
  process.exit(2)
}

console.log('device found', device)

const kbd = new HID.HID(device.path)
kbd.on('error', onerror)

const server = http.createServer((req, res) => {
  if (req.method !== 'POST' || req.url !== '/command') {
    res.writeHead(404)
    return res.end()
  }

  jsonBody(req, res, (err, body) => {
    if (err) {
      return sendJson(req, res, {
        statusCode: 400,
        body: { message: 'Bad Request' }
      })
    }

    if (typeof body.id === 'undefined' || !body.data) {
      return sendJson(req, res, {
        statusCode: 400,
        body: { message: '`id` and `data` fields are required' }
      })
    }

    const bytesSent = writeCommand(kbd, body)
    return sendJson(req, res, {
      statusCode: 200,
      body: {
        message: 'Command sent',
        bytes: bytesSent
      }
    })
  })
})
server.listen(9916)
