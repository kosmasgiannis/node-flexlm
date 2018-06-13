// -----------------------------------------------------------------------------
//
// basic.js
//
// Written by Giannis Kosmas <kosmasgiannis@gmail.com>
//
// License: http://opensource.org/licenses/MIT
//
// -----------------------------------------------------------------------------

var tap = require('tap');

var test = tap.test;

var FLEXlm = require('../flexlm.js');

// -----------------------------------------------------------------------------

test('FLEXLM', function(t) {

  var lic = new FLEXlm.flexlm('license.lic');

  t.ok(lic, 'License instance created');

  t.equal('myhost', (lic.getServer()).name, 'Server name');
  t.equal(2, (lic.getVendors()).length, 'Get all vendors');
  t.equal('prime', (lic.getVendor('prime')).name, 'Get known vendor');
  t.equal(null, lic.getVendor('unknown'), 'Get unknown vendor');
  t.deepEqual({
    name: 'venus',
    vendor: 'orbit',
    expDate: '30-nov-2013',
    licCount: '10',
    version: '2.0',
    ISSUED: '17-sep-2013',
    START: '17-sep-2013',
    SIGN: '7F69336673D2'
  }, lic.getFeature('orbit', 'venus'), 'Get feature');
  t.equal(3, (lic.getFeatures('prime')).length, 'Get all features');
  t.notOk((null == lic.findExpirations('prime')), 'Find expirations');
  t.ok((null != lic.findAllExpirations()), 'Find all expirations');

  t.end();
});

// -----------------------------------------------------------------------------
