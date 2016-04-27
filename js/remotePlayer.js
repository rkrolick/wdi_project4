var RemotePlayer = function (index, game, startX, startY){
  var x = startX;
  var y = startY;

  this.game = game;
  this.alive = true;
  this.launcher = this.game.add.sprite(x, y, 'launcher');
  this.launcher.anchor.x = 0.5;
  this.launcher.anchor.y = 0.5;
}
