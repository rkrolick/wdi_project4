var game = new Phaser.Game(1080, 720, Phaser.CANVAS, 'game');

var PhaserGame = function(game){
  this.launcherBase = null;
  this.launcherTurret = null;
  this.missle = null;
  this.background = null;
  this.strength = null;
  this.strengthTxt = null;
  this.aimUpKey = null;
  this.aimDownKey = null;
  this.launchBtn = null;
};

PhaserGame.prototype = {
  init: function(){
    this.game.renderer.renderSession.roundPixels = true;
    this.game.world.setBounds(0, 0, 1080, 720);
    this.physics.startSystem(Phaser.Physics.ARCADE);
    this.physics.arcade.gravity.y = 200;
  },

  preload: function(){
    this.load.image('launcher', 'sprites/launcher.png');
    this.load.image('launcherTurret', 'sprites/launcherTurret.png');
    this.load.image('background', 'sprites/background.png');
    this.load.image('missle', 'sprites/missle.png');
  },

  create: function(){
    this.background = this.add.sprite(0, 0, 'background');
    this.launcher = this.add.sprite(40, 520, 'launcher');
    this.missle = this.add.sprite(this.launcher.x+20, this.launcher.y+10, 'missle');
    this.launcherTurret = this.add.sprite(this.launcher.x+20, this.launcher.y+20, 'launcherTurret');
    this.launcherTurret.anchor.y = 1;
    this.missle.anchor.y = 1;

    this.launchKey = this.input.mouse.capture = true;
    this.aimUpKey = this.input.keyboard.addKey(Phaser.Keyboard.W);
    this.aimDownKey = this.input.keyboard.addKey(Phaser.Keyboard.S);
    this.launchKey = this.input.activePointer.leftButton;

    this.missle.isActive = false;
  },

  update: function(){
    if(this.aimUpKey.isDown && this.launcherTurret.angle > -90){
      this.moveTurret(-1);
    }
    if(this.aimDownKey.isDown && this.launcherTurret.angle < 0){
      this.moveTurret(1);
    }
    if(this.launchKey.isDown && !this.missle.isActive){
      this.missle.isActive = true;
      this.fire();
    }
    this.updateMissleRotation();
  },

  moveTurret: function(degree){
    this.launcherTurret.angle += degree;
    this.missle.angle += degree;
  },

  fire: function(){
    this.physics.arcade.enable(this.missle);
    this.physics.arcade.velocityFromRotation(this.launcherTurret.rotation, 500, this.missle.body.velocity);
    this.missle.initialY = this.missle.body.velocity.y;
  },

  updateMissleRotation(){
    if(this.missle.isActive){
      this.missle.rotation = Math.atan2(this.missle.body.velocity.y, this.missle.body.velocity.x);
    }
  }


}

game.state.add('game', PhaserGame, true);
