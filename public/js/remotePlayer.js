var RemotePlayer = function (id, game, startX, startY){
  var x = startX;
  var y = startY;
  this.id = id;
  this.game = game;
  this.alive = true;
  this.launcher = this.game.add.sprite(x, y, 'launcher');
  this.missle = this.game.add.sprite(this.launcher.x+20, this.launcher.y+10, 'missle');
  this.launcherTurret = this.game.add.sprite(this.launcher.x+20, this.launcher.y+20, 'launcherTurret');
  this.launcherTurret.anchor.y = 0.5;
  this.missle.anchor.y = 0.5;
  this.launcher.anchor.x = 0.5;
  this.launcher.anchor.y = 0.5;
  this.launcherTurret.angle = -90;
  this.missle.angle = -90;

  RemotePlayer.prototype = {
    setTurretAngel: function(angle){
      this.launcherTurret.angle = angle;
      this.missle.angle = angle;
    }
  }

}
