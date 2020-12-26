const http = require('http')
const HID = require('node-hid');
var devices = HID.devices();

const VENDOR_ID = 0x3297
const PRODUCT_ID = 0xC6CE
const USAGE = 0x61
const USAGE_PAGE = 0xFF60

const CHANNEL_BITS = 2
const PROGRESS_BITS = 6

const onerror = (err) => {
  console.log(err)
  process.exit(1)
}

const device = devices.find(d =>
  d.vendorId === VENDOR_ID &&
  d.productId === PRODUCT_ID &&
  d.usage === USAGE &&
  d.usagePage === USAGE_PAGE
)

if (!device) {
  console.error('device not found')
  console.log(devices)
  process.exit(2)
}

console.log('device found', device)
const kbd = new HID.HID(device.path)
kbd.on('error', onerror)

const server = http.createServer((req, res) => {
  const splitUrl = req.url.split('/').filter(Boolean)
  if (req.method !== 'POST' || splitUrl.length != 2 || splitUrl[0] !== 'progress') {
    res.writeHead(404)
    return res.end()
  }

  const channel = parseInt(splitUrl[1], 10)
  let buf = ''
  req.on('readable', () => {
    const r = req.read()
    if (r !== null) buf += r
    else {
      const cmd = (channel | (parseInt(buf, 10) << CHANNEL_BITS))
      kbd.write([ 0, cmd ])
      res.writeHead(200)
      return res.end()
    }
  })
})
server.listen(9916)
