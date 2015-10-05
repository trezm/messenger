var fs = require('fs');
var ursa = require('ursa');
var shell = require('shelljs');

/* global Promise, readline */

module.exports = {
  decode: decode,
  encode: encode,
  setup: setup
}

function decode(message) {
  var key = ursa.createPrivateKey(fs.readFileSync('../certs/key.pem'));
  return key.decrypt(message, 'base64', 'utf8');
}

function encode(message) {
  var crt = ursa.createPublicKey(fs.readFileSync('../certs/key.pub'));
  return crt.encrypt(message, 'utf8', 'base64');
}

/**
 * Sets up everything necessary to use rsa
 * @return {Promise} promise
 */
function setup() {
  return _checkForPrivateKey()
}

function _checkForPrivateKey() {
  return new Promise(function(resolve, reject) {
    fs.lstat('../certs/key.pem', function(err, stats) {
      if (!err && stats.isFile()) {
        resolve();
      } else {
        shell.exec("openssl genrsa -out ../certs/key.pem 2048; openssl rsa -in ../certs/key.pem -pubout -out ../certs/key.pub", { silent: false }, function(code) {
          if (code !== 0) {
            reject();
          } else {
            resolve();
          }
        });
      }
    });
  });
}
