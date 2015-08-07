var util = require('util');
var EventEmitter = require('events').EventEmitter;
var Gpio = require('onoff').Gpio;

function KY040(clock, data, button) {
  var that = this;

  clock = new Gpio(clock, 'in', 'both');
  data = new Gpio(data, 'in', 'both');
  button = new Gpio(button, 'in', 'both');

  button.watch(function(err, value) {
    if (err) return;
    that.emit('button', value === 0);
  });

  data.watch(function(err, data) {
    if (err) return;
    clock.read(function(err, clock) {
      if (err) return;
      that.emit('handle', data === clock ? 1 : -1);
    });
  });
}

util.inherits(KY040, EventEmitter);
module.exports = KY040;
