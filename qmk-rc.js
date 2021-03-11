const strToBytes = (str) => str.split('').map(c => c.charCodeAt(0))

const lengthToBytes = (length) => {
  const lengthBuffer = new ArrayBuffer(4)
  const lengthDataView = new DataView(lengthBuffer)
  lengthDataView.setUint32(0, length, true)
  return new Uint8Array(lengthBuffer)
}

const commandToBytes = exports.commandToBytes = (command) => {
  const { id, data } = command
  return [ 0, id, ...lengthToBytes(data.length), ...strToBytes(data) ]
}
