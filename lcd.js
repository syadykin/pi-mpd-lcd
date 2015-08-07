var async = require('async');
var util = require('util');
var Lcd = require('lcd');

var LCD = function(mpd, cb) {
  var that = this;
  this._lcd = new Lcd({rs: 7, e: 8, data: [25, 24, 23, 18], cols: 40, rows: 2});
  this._mpd = mpd;
  this._state = '';
  this._playing = {};
  this._status = {};

  process.on('SIGINT', function () {
    that._lcd.close();
  });


  this._lcd.on('ready', function() {

    that._mpd.on('player', function(state) {
      console.log('player', state);
    });

    that._mpd.on('volume', function(volume) {
      if (that._state === 'info') {
        that._lcd.setCursor(32, 1);
        var size = Math.floor(7 * volume / 100);
        var ch = '';
        for(var x = 0; x < size; x++)
          ch += '#';
        for (x = size; x < 7; x++)
          ch += ' ';
        that._lcd.print(ch);
      }
    });

    that._mpd.on('song', function(song) {
      console.log('song', song);
    });

    that._mod.on('position', function() {
      console.log('position', arguments);
    });

    console.log('LCD: ready');
    cb(null, that);
  });
};

LCD.prototype.info = function(cb) {
  var that = this;

  if (that._state !== 'info') {
    async.waterfall([
      that._lcd.clear.bind(that._lcd),
      function(cb) {
        that._lcd.setCursor(0, 1);
        that._lcd.print('[                        ] Vol [       ]', cb);
      },
      function(printed, cb) {
        that._state = 'info';
        cb();
      }
    ], cb);
  } else {
    cb();
  }
};

module.exports = LCD;
