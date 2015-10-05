(function() {
  var git = require('./transport').git;
  var crypto = require('./crypto').rsa;
  var fs = require('fs');
  var readlineModule = require('readline');
  GLOBAL.readline = readlineModule.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> '
  });

  git.setup()
    .then(function() {
      console.log('Connected to repo');
      return _setupCrypto();
    })
    .then(function() {
      readline.prompt();

      readline.on('line', function(line) {
        switch (line) {
          case 'exit':
            process.exit(0);
            break;
          default:
            _writeMessage(line)
              .then(function() {
                readline.prompt();
              });
        }
      });

      _beginLoop();
    });

  function _setupCrypto() {
    return crypto.setup();
  }

  function _writeMessage(message) {
    return git.push(crypto.encode(message));
  }

  function _beginLoop() {
    setInterval(function() {
      git.fetch()
        .then(function(messages) {
          console.log('');

          for (var i = 0; i < messages.length; i++) {
            var message = messages[i];
            var timestampRegExp = /^(\[\d+\]\s)(.*$)/;
            var match = timestampRegExp.exec(message);
            var timestamp = match[1];
            var data = match[2];
            console.log(timestamp + crypto.decode(data));
          }

          readline.prompt();
        })
    }, 10000);
  }
})()
