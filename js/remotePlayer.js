var RemotePlayer = function (index, game, startX, startY){
  var x = startX;
  var y = startY;

  this.game = game;
  this.alive = true;
  this.game.add.sprite(x, y, 'launcher');
}
