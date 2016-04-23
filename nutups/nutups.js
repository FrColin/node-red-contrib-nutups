
module.exports = function(RED) {
    "use strict";
    var Nut = require('node-nut');
    
    function NUTUPSNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.upsname = config.upsname;
        node.vars = config.vars;
        
        node.status({fill:"grey",shape:"dot",text:"connecting..."});
        
        var oNut = new Nut(config.port, config.host);
        
        oNut.on('error', function(err) {
            node.status({fill:"yellow",shape:"dot",text:err});
        
        });
        
        oNut.on('close', function() {
            node.status({fill:"red",shape:"ring",text:"disconnected"});
            node.ups = undefined;
        });
        oNut.on('ready', function() {
            node.ups = oNut;
            node.status({fill:"green",shape:"dot",text:"connected"});
        });
        oNut.start();
        
        this.on('input', function(msg) {
            if (node.ups ) {
                node.ups.GetUPSVars(node.upsname, function(varlist) {
                    var payload = {};
                    var arrayLength = node.vars.length;
                    for (var i = 0; i < arrayLength; i++) {
                        var varname = node.vars[i];
                        //RED.log.debug('VAR '+varname+' = '+varlist[varname]);
                        payload[varname] = varlist[varname];
                        
                    }
                    msg.payload = payload;
                    node.send(msg);
                 });
                
                
            } else {
                msg.payload = 'NUT Not Ready';
                return msg;
            }
            
        });
        this.on('close', function() {
            // tidy up any state
            if ( node.ups ) {
                node.ups.close();
                node.ups = undefined;
            }
            
        });
    }
    RED.nodes.registerType('nutups', NUTUPSNode);
    RED.httpAdmin.get("/nutups/allvars",function(req,res) {
        var blacklist = new RegExp("/(?:address|crc8|errata|family|id|locator|r_[a-z]+)$");
        if (!req.query.host) {
            return res.status(400).send({'error': "Missing 'host' parameter in query string"});
        } else if (!req.query.port) {
            return res.status(400).send({'error': "Missing 'port' parameter in query string"});
        } else if (!req.query.upsname) {
            return res.status(400).send({'error': "Missing 'upsname' parameter in query string"});
        }
        var oNut = new Nut(req.query.port, req.query.host);

        oNut.on('error', function(err) {
            RED.log.debug('There was an error: ' + err);
        });
        
        oNut.on('close', function() {
            RED.log.debug('Connection closed.');
        });
        oNut.on('ready', function() {
            var self = this;
            
            oNut.GetUPSVars(req.query.upsname, function(varlist) {
                var output = [];
                for (var property in varlist) {
                    output.push(property);
                }
                res.send({'varCount': output.length, 'vars': output});   
                res.end();             
                self.close();
            
                });
            });
        
        oNut.start();
        
     });
}
