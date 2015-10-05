var fs = require('fs');
var Git = require('simple-git');
var crypto = require('../crypto').rsa;

/* global readline, Promise */

module.exports = {
  fetch: fetch,
  initialize: initialize,
  push: push,
  setup: setup
}

function setup() {
  var repoName;
  var repoUrl;

  return _getRepoUrl()
    .then(function(_repoUrl) {
      repoUrl = _repoUrl;
      return _getRepoName();
    })
    .then(function(_repoName) {
      repoName = _repoName;
      return initialize({
        repoUrl: repoUrl,
        repoName: repoName
      });
    });
}

/**
 * Prompt the user for the remote repo url
 * @return {Promise} promise - resolve will have the url
 */
function _getRepoUrl() {
  return new Promise(function(resolve) {
    readline.question('Please enter the url of the git repository.  This should begin with either "git@" or "https://": ', resolve);
  });
}

function _getRepoName() {
  return new Promise(function(resolve) {
    readline.question('What do you want to name this chatroom? ', resolve);
  });
}

/**
 * Initialize the transport with any given parameters
 * @param {Object} params - Options for this initializer, can include repoUrl
 * @return {Promise} promise - Completion promise
 */
function initialize(params) {
  var promise = new Promise(function(resolve) {
      resolve();
  });

  try {
      var stats = fs.lstatSync(params.repoName);
      if (stats.isDirectory()) {

      } else {
        console.log('Yikes...', params.repoName, 'isn\'t a directory, but it does exist. Try deleting it before proceeding.');
      }
  }
  catch (e) {
      promise = _cloneDirectory(params.repoUrl, params.repoName);
  }
  finally {
    return promise
      .then(function() {
        return _changeDirectory(params.repoName);
      });
  }
}

/**
 * Fetches any new messages from the repository
 * @return {Promise} promise - A promise whose resolver contains any results
 */
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

/**
 * Pushes a message to the repository
 * @return {Promise} promise - Promise once pushing is complete
 */
function push(message) {
  return _writeMessage(message)
    .then(function(writtenFileName) {
        return _addFiles(writtenFileName);
    })
    .then(_commitFiles)
    .then(_push)
}

/**
 * Pulls and merges any changes that have happened in the origin
 * @return {Promise} promise
 */
function _syncWithOrigin() {
  var git = Git();

  return new Promise(function(resolve) {
    git.pull('origin', 'master', function() {
      resolve();
    });
  });
}

/**
 * Reads all files in given array of file names
 * @param {[string]} files - The names of files to be read
 * @return {Promise} promise - resolver has the contents of the files
 */
function _readFiles(files) {
  return Promise.all(files.map(function(file) {
    return new Promise(function(resolve) {
      fs.readFile('./' + file, 'utf8', function(err, results) {
        resolve(results);
      });
    });
  }))
}

/**
 * Find what file names are new from the origin and what are old
 * @return {Promise} promise - resolver has differing file names
 */
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

/**
 * Fetches changes from git repo
 * @return {Promise} promise
 */
function _fetch() {
  var git = Git();

  return new Promise(function(resolve) {
    git.fetch(resolve);
  });
}

/**
 * Clone a remote repo
 * @param {string} repoUrl - The repo url
 * @param {stringm} repoName - The local repo name
 * @return {Promise} promise
 */
function _cloneDirectory(repoUrl, repoName) {
    var cloneGit = Git()

    return new Promise(function(resolve) {
        cloneGit.clone(repoUrl, repoName, resolve);
    });
}

/**
 * Add new files to current git repo
 * @return {Promise} promise
 */
function _addFiles(filename) {
    var git = Git();

    return new Promise(function(resolve) {
        git.add(filename, resolve);
    });
}

/**
 * Commit the files with a message that's just the date
 * @return {Promise} promise
 */
function _commitFiles() {
    var git = Git();

    return new Promise(function(resolve) {
       git.commit(Date.now(), resolve);
    });
}

/**
 * Push and changes to the remote master repo
 * @param {string} remote - The remote repo
 * @param {string} branch - The remote branch
 * @return {Promise} promise
 */
function _push(remote, branch) {
    var git = Git();
    remote = remote || 'origin';
    branch = branch || 'master';

    return new Promise(function(resolve) {
       git.push(remote, branch, resolve);
    });
}

/**
 * Write message to file
 * @param {string} message - Message to write to file
 * @param {string} filename - (Optional) name of file to write
 * @return {Promise} promise
 */
function _writeMessage(message, filename) {
    var timestamp = Date.now();
    filename = filename || timestamp + '.txt';

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

/**
 * Change the current directory
 * @param {string} directory - (Optional) will default to 'test_repo'
 * @return {Promise} promise
 */
function _changeDirectory(directory) {
    directory = directory || 'test_repo';

    return new Promise(function(resolve) {
        process.chdir(directory);
        resolve();
    });
}
