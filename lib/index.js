"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require('express')();
var server = require('http').createServer(app);
var options = {
    cors: {
        origin: '*'
    }
};
var io = require('socket.io')(server, options);
io.on("connection", function (socket) {
    console.log(socket.id);
});
server.listen(4000, function () {
    console.log("Running on http://localhost:4000");
});
