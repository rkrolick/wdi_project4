var util = require("util");
var io = require("socket.io");
var socket;
var players;

function init(){
  players = [];
  socket = io.listen(8000);
  setEventHandlers();
}

var setEventHandlers = function(){
  socket.sockets.on("connection", onSocketConnection);
};

function onSocketConnection(client){
  util.log("New player has connected: " + client.id);
  client.on("disconnect", onClientDisconnect);
  client.on("new player", onNewPlayer);
  client.on("move turret", onMoveTurret);
}

function onClientDisconnect(){
  util.log("Player has disconnected: " + this.id);
}

function onNewPlayer(data){

}

function onMoveTurret(data){
  
}

init();
