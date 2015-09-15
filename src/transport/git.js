var fs = require('fs');
var Git = require('simple-git');
var Promise = require('promise');
var crypto = require('../crypto').rsa;

module.exports = {
  fetch: fetch,
  initialize: initialize,
  push: push
}

var REPO_NAME = './repo';

// Initialize here
function initialize(repoUrl) {
  var promise = new Promise(function(resolve) {
      resolve();
  });

  try {
      var stats = fs.lstatSync(REPO_NAME);
      if (stats.isDirectory()) {

      }
  }
  catch (e) {
      promise = _cloneDirectory(repoUrl);
  }
  finally {
    return promise
      .then(_changeDirectory);
  }
}

function fetch() {
  var files;

  return _fetch()
    .then(_findNewFiles)
    .then(function(_files) {
      files = _files;
      return _syncWithOrigin();
    })
    .then(function() {
      return _readNewFiles(files);
    })
}

function push(message) {
  return _writeMessage(message)
    .then(function(writtenFileName) {
        return _addFiles(writtenFileName);
    })
    .then(_commitFiles)
    .then(_push)
}

function _syncWithOrigin() {
  var git = Git();

  return new Promise(function(resolve) {
    git.pull('origin', 'master', function() {
      resolve();
    });
  });
}

function _readNewFiles(files) {
  return Promise.all(files.map(function(file) {
    return new Promise(function(resolve) {
      fs.readFile('./' + file, 'utf8', function(err, results) {
        resolve(results);
      });
    });
  }))
}

function _findNewFiles() {
  var git = Git();

  return new Promise(function(resolve) {
    git.diff(['--name-only', 'origin/master'], function(err, results) {
      resolve(results.split('\n').filter(function(result) {
        return result.length > 0;
      }));
    });
  });
}

function _fetch() {
  var git = Git();

  return new Promise(function(resolve) {
    git.fetch(resolve);
  });
}

function _cloneDirectory(repoUrl) {
    var cloneGit = Git()

    return new Promise(function(resolve) {
        cloneGit.clone(repoUrl, REPO_NAME, resolve);
    });
}

function _addFiles(filename) {
    var git = Git();

    return new Promise(function(resolve) {
        git.add(filename, resolve);
    });
}


function _commitFiles() {
    var git = Git();

    return new Promise(function(resolve) {
       git.commit(Date.now(), resolve);
    });
}

function _push() {
    var git = Git();

    return new Promise(function(resolve) {
       git.push('origin', 'master', resolve);
    });
}

function _writeMessage(message) {
    var timestamp = Date.now();
    var filename = timestamp + '.txt';

    var promise = new Promise(function(resolve, reject) {
        fs.writeFile(filename, '[' + timestamp + '] ' + message, function (err) {
          if (err) {
            return reject(err);
          }
          resolve(filename);
        });
    });

    return promise;
}

function _changeDirectory() {
    return new Promise(function(resolve) {
        process.chdir('./test_repo');
        resolve();
    });
}
