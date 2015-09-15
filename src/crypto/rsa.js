var fs = require('fs');
var ursa = require('ursa');

module.exports = {
  decode: decode,
  encode: encode
}

key = ursa.createPrivateKey(fs.readFileSync('./certs/secrets.key.pem'));
crt = ursa.createPublicKey(fs.readFileSync('./certs/public.pub'));

function decode(message) {
  return key.decrypt(message, 'base64', 'utf8');
}

function encode(message) {
  return crt.encrypt(message, 'utf8', 'base64');
}
