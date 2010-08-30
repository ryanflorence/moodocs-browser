// like rm -rf
// http://github.com/isaacs/npm/blob/master/lib/utils/rm-rf.js

var fs = require("fs")
  , path = require("path")
  , sys = require("sys")

function rm (p, cb_) {

  if (!p) return cb(new Error("Trying to rm nothing?"))

  var cb = function (er) {
    if (er) {
      console.log(p, "rm fail")
      console.log(er.message, "rm fail")
    }
    cb_(null, er)
  }

  fs.lstat(p, function (er, s) {
    if (er) return cb()
    if (s.isFile() || s.isSymbolicLink()) {
      fs.unlink(p, cb)
    } else {
      fs.readdir(p, function (er, files) {
        if (er) return cb(er)
        ;(function rmFile (f) {
          if (!f) fs.rmdir(p, cb)
          else rm(path.join(p, f), function (_, er) {
            if (er) return cb(er)
            rmFile(files.pop())
          })
        })(files.pop())
      })
    }
  })
}

module.exports = rm;
