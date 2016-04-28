var util = require("util");
var io = require("socket.io");
var Player = require("./Player").Player;
var socket;
var players;

function init(){
  players = [];
  socket = io.listen(3000);
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
  client.on("move missle", onMoveMissle);
  client.on("kill player", onKillPlayer);
}

function onClientDisconnect(){
  util.log("Player has disconnected: " + this.id);
  var removePlayer = playerById(this.id);
  if(!removePlayer){
    util.log("Player not found: " + this.id);
    return;
  }

  players.splice(players.indexOf(removePlayer),1);
  this.broadcast.emit("remove player",{id: this.id});
}

function onNewPlayer(data){
  var newPlayer = new Player(data.x, data.y);
  newPlayer.id = this.id;
  // Tell all other players a new player has joined.
  this.broadcast.emit("new player", {id: newPlayer.id, x: newPlayer.getX(), y: newPlayer.getY()});
  // Tell the newly connected player about all the other players.
  var existingPlayer;
  var i;
  for(i = 0; i < players.length; i++){
    existingPlayer = players[i];
    this.emit("new player", {id: existingPlayer.id, x: existingPlayer.getX(), y: existingPlayer.getY()});
  }
  players.push(newPlayer);
  // Give the new player their id
  this.emit("get id", {id: newPlayer.id});
}

function onMoveTurret(data){
  this.broadcast.emit("move turret", {id: this.id, angle: data.angle});
}

function onMoveMissle(data){
  this.broadcast.emit("move missle", {id: this.id, x: data.x, y: data.y, r: data.r});
}

function onKillPlayer(data){
  this.broadcast.emit("remove player", {id: data.id})
}

function playerById(id){
  for(var i = 0; i < players.length; i++){
    if(players[i].id == id){
      return players[i];
    }
  }
  return false;
}

init();
