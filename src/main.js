(function() {
  var git = require('./transport').git;
  var crypto = require('./crypto').rsa;
  var readline = require('readline');

  git.initialize('git@github.com:trezm/test_repo.git').then(function() {
    console.log('Connected to repo');
  });

  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> '
  });

  rl.prompt();

  rl.on('line', function(line) {
    switch (line) {
      case 'exit':
        process.exit(0);
        break;
      default:
        _writeMessage(line)
          .then(function() {
            rl.prompt();
          });
    }
  });

  _beginLoop();

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

          rl.prompt();
        })
    }, 10000);
  }
})()
