
A node to read from the UPS server.
It uses the [node-nut] node.js package.

# Installation
```
npm install node-red-contrib-nutups
```

# Configuration

Apart from the usual name, 
the node has `host`,`port`,`upsname` and vars properties. 
These default to `localhost`, `3493`, `ups`, ``  respectively.

# Usage

An incoming message triggers a read of the UPS.
The message payload is filled with the var name and value
read from the UPS.
