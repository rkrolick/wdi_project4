var game = new Phaser.Game(1080, 720, Phaser.CANVAS, 'game');

var PhaserGame = function(game){
  this.launcherBase = null;
  this.launcherTurret = null;
  this.missle = null;
  this.background = null;
  this.launchPower = null;
  this.launchPowerTxt = null;
  this.aimUpKey = null;
  this.aimDownKey = null;
  this.launchBtn = null;
};

PhaserGame.prototype = {
  init: function(){
    this.game.renderer.renderSession.roundPixels = true;
    this.game.world.setBounds(0, 0, 5000, 720);
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
    // Draw sprites
    this.background = this.add.sprite(0, 0, 'background');
    this.launcher = this.add.sprite(40, 520, 'launcher');
    this.missle = this.add.sprite(this.launcher.x+20, this.launcher.y+10, 'missle');
    this.launcherTurret = this.add.sprite(this.launcher.x+20, this.launcher.y+20, 'launcherTurret');
    // Set rotation points
    this.launcherTurret.anchor.y = 1;
    this.missle.anchor.y = 1;
    // Declare input keys
    this.input.mouse.capture = true;
    this.aimUpKey = this.input.keyboard.addKey(Phaser.Keyboard.W);
    this.aimDownKey = this.input.keyboard.addKey(Phaser.Keyboard.S);
    this.moreLaunchPowerKey = this.input.keyboard.addKey(Phaser.Keyboard.F);
    this.lessLaunchPowerKey = this.input.keyboard.addKey(Phaser.Keyboard.S);
    this.launchKey = this.input.activePointer.leftButton;
    // Initialize variables
    this.missle.isActive = false;
    // Display hud
    this.launchPower = 1000;
    this.launchPowerTxt = this.add.text(10, 10, "Power: 1000", {font: "40px Arial", fill: "#FF0000"});
    this.launchPowerTxt.fixedToCamera = true;
  },

  update: function(){
    // Input checks
    if(this.aimUpKey.isDown && this.launcherTurret.angle > -90){this.moveTurret(-1);}
    if(this.aimDownKey.isDown&& this.launcherTurret.angle < 0 ){this.moveTurret( 1);}
    if(this.moreLaunchPowerKey.isDown){this.adjustLaunchPower(10);}
    if(this.lessLaunchPowerKey.isDown){this.adjustLaunchPower(-10);}
    if(this.launchKey.isDown){this.fire();}

    this.updateMissleRotation();
    this.checkMissleCollison();
  },

  moveTurret: function(degree){
    this.launcherTurret.angle += degree;
    this.missle.angle += degree;
  },

  fire: function(){
    if(this.missle.isActive){return;}
    this.missle.isActive = true;
    this.physics.arcade.enable(this.missle);
    this.physics.arcade.velocityFromRotation(this.launcherTurret.rotation, this.launchPower, this.missle.body.velocity);
    this.camera.follow(this.missle);
  },

  updateMissleRotation: function(){
    if(this.missle.isActive){
      this.missle.rotation = Math.atan2(this.missle.body.velocity.y, this.missle.body.velocity.x);
    }
  },

  adjustLaunchPower: function(adjustment){

  },

  checkMissleCollison: function(){
    if(this.missle.isActive){
      if(this.missle.y > 720){this.resetMissle();}
    }
  },

  resetMissle: function(){
    this.missle.kill();
    this.camera.follow();
    this.add.tween(this.camera).to({x:0}, 1000, "Quint", true, 1000);
  }


}

game.state.add('game', PhaserGame, true);
