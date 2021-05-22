const PACKET_PADDING = 64

const dataToBytes = (data) => typeof data === 'string' ?
  strToBytes(data) : data;

const strToBytes = (str) => [...str.split('').map(c => c.charCodeAt(0)), 0]

const lengthToBytes = exports.lengthToBytes = (length) => {
  const lengthBuffer = new ArrayBuffer(4)
  const lengthDataView = new DataView(lengthBuffer)
  lengthDataView.setUint32(0, length, true)
  return new Uint8Array(lengthBuffer)
}

const commandToBytes = exports.commandToBytes = (command) => {
  const { id, data } = command
  const bytes = data ? dataToBytes(data) : []
  const unpadded = [
    0, id,
    ...lengthToBytes(bytes.length),
    ...bytes
  ];
  const padding = new Array(PACKET_PADDING - (unpadded.length % PACKET_PADDING)).fill(0)
  return [ ...unpadded, ...padding ]
}
