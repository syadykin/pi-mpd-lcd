// daemonize
require('daemon')();

var _ = require('lodash');
var async = require('async');
//var KY040 = require('./ky-040');
var MPD = require('./mpd');
//var LCD = require('./lcd');
var SW = require('./switcher');
// clk, data, sw
//var handle = new KY040(22, 27, 4);

console.log('init');

async.waterfall([
  function(cb) {
    new MPD(cb);
  },
/*  function(mpd, cb) {
    new LCD(mpd, function(err, lcd) {
      cb(err, mpd, lcd);
    });
  },
  function(mpd, lcd, cb) {
    handle
      .on('handle', function(dir) {
        mpd.volume(2 * dir, _.noop);
      })
      .on('button', function(state) {
        if (state) return;
        mpd.status(function(err, status) {
          if (err) return;
          if (status.state === 'play')
            mpd.stop(_.noop);
          else
            mpd.play(_.noop);
        });
      });

    lcd.info(cb);
  }*/
  function(mpd, cb) {
    new SW(mpd);
    cb();
  }
], function() {
  console.log(arguments);
});
