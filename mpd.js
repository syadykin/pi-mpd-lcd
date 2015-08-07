var util = require('util');
var mpd = require('mpd');
var EventEmitter = require('events').EventEmitter;
var async = require('async');

var cmd = mpd.cmd;

function MPD(cb) {
  var that = this;

  this._client = mpd.connect({
    port: 6600,
    host: 'localhost'
  });

  this._status = {};
  this._playing = {};

  var timeout;

  function schedule() {
    if (timeout) clearTimeout(timeout);

    that._client.sendCommand(cmd('status', []), function(err, status) {
      status = mpd.parseKeyValueMessage(status);

      if (that._status.volume !== status.volume)
        that.emit('volume', +status.volume);
      if (that._status.state !== status.state)
        that.emit('player', status.state);
      if (that._status.playlist !== status.playlist ||
          that._status.song !== status.song) {
        that.emit('song', that._playing);
      }
      if (that._status.time !== status.time && status.state === 'play')
        that.emit('position', +status.time, +that._playing.Time || 0);

      that._status = status;
      if (that._status.state === 'play') timeout = setTimeout(schedule, 1000);
    });
  }

  this._client.on('ready', function() {
    that._client.on('system-player', function() {
      that._client.sendCommand(cmd('currentsong', []), function(err, info) {
        info = mpd.parseKeyValueMessage(info);
        that._playing = info;
        schedule();
      });
    });

    that._client.on('system-mixer', function() {
      schedule();
    });

    schedule();

    that._client.emit('system-mixer');
    that._client.emit('system-player');

    console.log('MOD: ready');
    cb(null, that);
  });
}

util.inherits(MPD, EventEmitter);

MPD.prototype.volume = function(change, cb) {
  var that = this;

  // change volume
  this.status(function(err, status) {
    var volume = Math.max(0, Math.min(100, +status.volume + change));
    that._client.sendCommand(cmd('setvol', [volume]), function(err) {
      cb(err, volume);
    });
  });
};

MPD.prototype.play = function(cb) {
  this._client.sendCommand(cmd('play', []), cb);
};

MPD.prototype.stop = function(cb) {
  this._client.sendCommand(cmd('stop', []), cb);
};

module.exports = MPD;
