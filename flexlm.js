// -----------------------------------------------------------------------------
//
// flexlm.js - the base class for parsing FLEXLM license files.
//
// Written by Giannis Kosnas <kosmasgiannis@gmail.com>
//
// License: http://opensource.org/licenses/MIT
//
// -----------------------------------------------------------------------------

'use strict';

var fs = require('fs');
var util = require('util');
var dateFormat=require('dateformat');

var flexlm = function flexlm (filename) {

  this.server =  null;
  this.vendors = [];
  this.features = [];

  var lic = fs.readFileSync(filename, {encoding : 'ascii'} );
  var lines = lic.split('\n');
  var i;
  var line;
  var newline = true;
  var _licarr = [];
  var currentVendor = null;
  var currentServer = null;
  var feature;

  for (i=0; i<lines.length; i++) {
    line = lines[i];
    if (line.indexOf('#') !== -1) { // Strip out comments
      line = line.substr(0, line.indexOf('#'));
    }

    line = line.trim();

    if ( line.length > 0 ) {  // Skip comments and empty lines
      if (newline) {
        _licarr.push(line);
      } else {
        _licarr[_licarr.length-1] = _licarr[_licarr.length-1].substr(0,_licarr[_licarr.length-1].length-1) + line;
      }
      newline = line.charAt(line.length-1) !== '\\';
    }
  }

  for (i=0; i < _licarr.length; i++) {

    line = _licarr[i].split(' ');
    switch (line[0].toLowerCase()) {
      case 'server' :
        if (currentServer === null) {
          currentServer = parseServer(line);
          this.server = currentServer;
        }
        break;
      case 'use_server' :
        break;
      case 'daemon' :  // same info as vendor since FLEXlm v6.0
      case 'vendor' :
        currentVendor = parseVendor(line);
        this.vendors.push(currentVendor);
        break;
      case 'increment' :
      case 'feature' :
        feature = parseFeature(line);
        if (typeof this.features[feature.vendor] == 'undefined') {
          this.features[feature.vendor] = [];
        }
        this.features[feature.vendor].push(feature);
        break;
      default : break;
    }
  }
};

flexlm.prototype = {

  getServer: function getServer() {
    return this.server;
  },
  getVendors: function getVendors() {
    var vendors = [];
    this.vendors.forEach(function(v) {
      vendors.push(v.name);
    });
    return vendors;
  },

  getVendor: function getVendor(vendor) {
    var id = this.findVendor(vendor);
    if (id !== null) {
      return this.vendors[id];
    }
    return null;
  },

  findVendor: function findVendor(vendor) {
    var vid = null;
    this.vendors.forEach(function(v, id) {
      if (v.name === vendor) {
        vid = id;
      }
    });
    return vid;
  },

  getFeatures: function getFeatures(vendor) {
    if (typeof this.features[vendor] !== 'undefined') {
      return this.features[vendor];
    }
    return null;
  },

  getFeature: function getFeature(vendor, feature) {
    var id = this.findFeature(vendor, feature);
    if (id !== null) {
      return this.features[vendor][id];
    }
    return null;
  },

  findFeature: function findFeature(vendor, feature) {

    var vf = null;
    var fid = null;
    if (typeof this.features[vendor] !== 'undefined') {
      vf = this.features[vendor];
      vf.forEach(function(f, id) {
        if (f.name === feature) {
          fid = id;
        }
      });
    }
    return fid;
  },

  findExpirations: function findExpirations(vendor) {
    var d = new Date();
    var dsnow = dateFormat(d, 'dd-mmm-yyyy');
    var dnow = Date.parse(dsnow);
    var features = this.getFeatures(vendor);
    var expired = [];
    if (features) {
      features.forEach(function(f) {
        var days;
        if (f.expDate === 'permanent') {
          days = 'never';
        } else {
          var df = Date.parse(f.expDate);
          days = Math.floor((df-dnow)/86400000);
        }
        expired.push({name : f.name, version: f.version, expires: days });
      });
    }
    return expired;
  },

  findExpired: function findExpired(vendor, days) {
    var self = this;
    var expirations = self.findExpirations(vendor);
    var expired = [];
    expirations.forEach(function(e) {
      if (e.expires !== 'never') {
        if (e.expires <= days) {
          expired.push({name : e.name, version: e.version, expires: e.expires });
        }
      }
    });
    return expired;
  },

  findAllExpirations: function findAllExpirations() {
    var expired = [];
    var self = this;
    this.getVendors().forEach(function(v) {
      self.findExpirations(v).forEach(function(e) {
        expired.push({vendor : v, feature : e.name, version: e.version, expires : e.expires});
      });
    });
    return expired;
  },

  dump: function dump() {
    console.log(util.inspect(this, {depth:null}));
  }

};

function parseVendor(line) {
  var vendor = {
    'name' : null,
    'path' : null,
    'options' : null,
    'port' : null,
  };
  if (line.length > 1) {
    vendor.name = line[1] || null;
    vendor.path = line[2] || null;
    vendor.options = line[3] || null;
    vendor.port = line[4] || null;
    return vendor;
  }
  return null;
}

function parseServer(line) {
  var server = {
    'name' : null,
    'id' : null,
    'port' : null
  };
  if (line.length > 1) {
    server.name = line[1] || null;
    server.id = line[2] || null;
    server.port = line[3] || null;
    return server;
  }
  return null;
}

function parseFeature(line) {
  var feature = {
    'name' : null,
    'version' : null,
    'vendor' : null,
    'expDate' : null,
    'licCount' : null,
  };
  if (line.length > 1) {
    feature.name = line[1] || null;
    feature.vendor = line[2] || null;
    feature.version = line[3] || null;
    feature.expDate = line[4] || null;
    feature.licCount = line[5] || null;
    var kv;
    var featurename = '';
    var joinnext = false;
    for (var i=6; i< line.length; i++) {
      if (line[i].indexOf('=') >= 0) {
        kv = line[i].split('=');
        featurename = kv[0];
        feature[featurename] = kv[1];
        joinnext = (line[i].indexOf('"') >= 0);
      } else {
        if (joinnext === false) {
          featurename = line[i];
          feature[featurename] = true;
        } else {
          feature[featurename] = feature[featurename] + ' ' + line[i];
          joinnext = ! (line[i].indexOf('"') >= 0);
        }
      }
    }
    return feature;
  }
  return null;
}

exports.flexlm = flexlm;
