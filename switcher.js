var mdns = require('mdns');
var udp = require('dgram');
var _ = require('lodash');

var on = new Buffer([ 0, 0, 0 ]),
    off = new Buffer([ 0, 60, 0 ]); // 1 minute

var sequence = [
  mdns.rst.DNSServiceResolve(),
  'DNSServiceGetAddrInfo' in mdns.dns_sd ? mdns.rst.DNSServiceGetAddrInfo() : mdns.rst.getaddrinfo({families:[4]}),
  mdns.rst.makeAddressesUnique()
];

var browser = mdns.createBrowser(mdns.udp('switcher'), {resolverSequence: sequence});

var services = {};

browser.on('serviceUp', function(service) {
  services[service.fullname] = service;
});

browser.on('serviceDown', function(service) {
  delete services[service.fullname];
});

browser.start();

var Switcher = function(mpd) {
  mpd.on('player', function(status) {
    var msg = status === 'play' ? on : off;

    _.each(services, function(service) {
      service.addresses.forEach(function(ip) {
        var client = udp.createSocket('udp4');
        client.send(msg, 0, msg.length, service.port, ip, function(err, bytes) {
          if (err) console.log(err);
          console.log('UDP message sent to ' + ip +':'+ service.port);
          client.close();
        });
      });
    });
  });
};

module.exports = Switcher;

// discover all available service types
//var all_the_types = mdns.browseThemAll(); // all_the_types is just another browser...