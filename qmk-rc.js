const PACKET_PADDING = 64

const dataToBytes = (data) => typeof data === 'string' ?
  strToBytes(data) : data;

const strToBytes = (str) => [...str.split('').map(c => c.charCodeAt(0)), 0]

const lengthToBytes = (length) => {
  const lengthBuffer = new ArrayBuffer(4)
  const lengthDataView = new DataView(lengthBuffer)
  lengthDataView.setUint32(0, length, true)
  return new Uint8Array(lengthBuffer)
}

const commandToBytes = exports.commandToBytes = (command) => {
  const { id, data } = command
  const unpadded = [
    0, id,
    ...lengthToBytes(data ? data.length : 0),
    ...(data ? dataToBytes(data) : [])
  ];
  const padding = new Array(PACKET_PADDING - (unpadded.length % PACKET_PADDING)).fill(0)
  return [ ...unpadded, ...padding ]
}
