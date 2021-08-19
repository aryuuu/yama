export const bufToHex = (buffer) => {
  var s = '', h = '0123456789ABCDEF';
  (new Uint8Array(buffer)).forEach((v) => { s += h[v >> 4] + h[v & 15]; });
  s = '0x' + s;
  return s;
}

export const hexToBuf = (hex) => {
   // remove the leading 0x
  hex = hex.replace(/^0x/, '');
  const typedArray = new Uint8Array(hex.match(/[\da-f]{2}/gi).map((h) => parseInt(h, 16)))
  return typedArray.buffer
}

export const createRoomName = (a, b) => {
  if (a < b) {
    return a + b;
  }
  return b + a;
}
