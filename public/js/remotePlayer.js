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
  // // Missle explosion
  // this.missleExplosion = this.add.sprite(this.launcher.x, this.launcher.y, 'explosion');
  // this.missleExplosion.anchor.x = 0.5;
  // this.missleExplosion.anchor.y = 0.5;
  // this.missleBoom = this.missleExplosion.animations.add('boom');
  // this.missleExplosion.animations.play('boom', 6, false);
  // // Launcher explosion
  // this.bodyExplosion = this.add.sprite(this.launcher.x, this.launcher.y, 'explosion');
  // this.bodyExplosion.anchor.x = 0.5;
  // this.bodyExplosion.anchor.y = 0.5;
  // this.bodyBoom = this.bodyExplosion.animations.add('boom');
  // this.bodyExplosion.animations.play('boom', 6, false);

  RemotePlayer.prototype = {
    setTurretAngle: function(angle){
      this.launcherTurret.angle = angle;
      this.missle.angle = angle;
    }
  }

}
