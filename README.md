# Yeah...

So I thought the idea of using git to do encrypted messages was pretty cool, so I made it happen in real time.

Right now it's still definitely in its early stages, but with time it'll get better, just like fine wine.

### To install;
1. Clone the repo
2. cd into the repo
3. run `mkdir repo` (that's where messages will go)
4. add `secrets.key.pem` and `public.pub` keys to the `certs/` folder
5. In `main.js`, change the line
```
  git.initialize('git@github.com:trezm/test_repo.git').then(function() {
```
to have whatever repo you're posting messages to instead.
6. Run `node src/main` and have fun
