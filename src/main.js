'use strict';

var Git = require("simple-git");

Git().clone('https://github.com/steveukx/git-js.git', './test', function() {
  var testRepoGit = Git('./test');
  console.log('arguments:', arguments);
  process.chdir('./test');
  console.log('directory:', process.cwd());
  testRepoGit.status(function() {
    console.log('arguments:', arguments);
  });
});
