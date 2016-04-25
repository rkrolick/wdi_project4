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
    this.missle = this.add.sprite(this.launcher.x+15, this.launcher.y-30, 'missle');
    this.launcherTurret = this.add.sprite(this.launcher.x+10, this.launcher.y-20, 'launcherTurret');
    this.aimUpKey = this.input.keyboard.addKey(Phaser.Keyboard.W);
    this.aimDownKey = this.input.keyboard.addKey(Phaser.Keyboard.S);
  },

  update: function(){
    if(this.aimUpKey.isDown){
      this.launcherTurret.angle--;
      this.missle.angle--;
    }
    if(this.aimDownKey.isDown){
      this.launcherTurret.angle++;
      this.missle.angle++;
    }
  },
}

game.state.add('game', PhaserGame, true);
