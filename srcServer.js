var express = require('express');
var path = require('path');
var opn = require('opn');

var port = 5456
var app = express();

app.use(express.static(__dirname));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, function (err) {
    if (err) {
        console.log(err);
    } else {
        opn('http://localhost:' + port);
    }
});