# node-flexlm

flexlm parses FlexNet Publisher license files.

##Installation

[![Dependency Status](https://gemnasium.com/kosmasgiannis/node-flexlm.png)](https://gemnasium.com/kosmasgiannis/node-flexlm)

[![NPM](https://nodei.co/npm/flexlm.png)](https://nodei.co/npm/flexlm/)

####Usage

    var FLEXlm = require('flexlm');

    var lic1 = new FLEXlm.flexlm('license.lic');

    console.log(lic1.getServer());
    console.log(lic1.getVendor("prime"));
    console.log(lic1.getFeature("orbit", "venus"));
    console.log(lic1.getFeatures("prime"));
    console.log(lic1.findExpirations("orbit"));
    console.log(lic1.findAllExpirations());
    console.log(lic1.findExpired("orbit", 10));

[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/kosmasgiannis/node-flexlm/trend.png)](https://bitdeli.com/free "Bitdeli Badge")
