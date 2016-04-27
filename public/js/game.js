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
  this.spawnPlayerKey = null;
  this.socket = null;
  this.remotePlayers = [];
  // Temp usage until server is created.
  this.remotePlayerNum = 0;
  this.spawnDelay = 0;
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
    this.load.image('ground', 'sprites/ground.png')
  },

  create: function(){
    // Connect to server
    socket = io.connect("http://localhost", {port: 8000, transports:["websocket"]})
    // Draw sprites
    this.background = this.add.sprite(0, 0, 'background');
    this.ground = this.add.sprite(0, 670, 'ground');
    this.launcher = this.add.sprite(this.world.randomX, 595, 'launcher');
    this.missle = this.add.sprite(this.launcher.x+20, this.launcher.y+10, 'missle');
    this.launcherTurret = this.add.sprite(this.launcher.x+20, this.launcher.y+20, 'launcherTurret');
    // Set camera to follow Player
    this.camera.follow(this.launcherTurret, Phaser.Camera.FOLLOW_LOCKON);
    // Set rotation points
    this.launcherTurret.anchor.y = 0.5;
    this.missle.anchor.y = 0.5;
    this.launcher.anchor.x = 0.5;
    this.launcher.anchor.y = 0.5;
    // Set Default turret and missle angle;
    this.launcherTurret.angle = -90;
    this.missle.angle = -90;
    // Declare input keys
    this.input.mouse.capture = true;
    this.aimUpKey = this.input.keyboard.addKey(Phaser.Keyboard.A);
    this.aimDownKey = this.input.keyboard.addKey(Phaser.Keyboard.D);
    this.moreLaunchPowerKey = this.input.keyboard.addKey(Phaser.Keyboard.W);
    this.lessLaunchPowerKey = this.input.keyboard.addKey(Phaser.Keyboard.S);
    this.launchKey = this.input.activePointer.leftButton;
    this.spawnPlayerKey = this.input.keyboard.addKey(Phaser.Keyboard.X);
    // Initialize variables
    this.missle.isActive = false;
    this.launchPower = 500;
    // Display hud
    this.launchPowerTxt = this.add.text(10, 10, "Power: 500", {font: "40px Arial", fill: "#FF0000"});
    this.launchPowerTxt.fixedToCamera = true;
    // Start listening for server communications
    this.setEvenHandlers();
  },

  update: function(){
    // Input checks
    if(this.aimUpKey.isDown && this.launcherTurret.angle > -179){this.moveTurret(-1);}
    if(this.aimDownKey.isDown && this.launcherTurret.angle < -1){this.moveTurret( 1);}
    if(this.moreLaunchPowerKey.isDown && this.launchPower < 1000){this.adjustLaunchPower(10);}
    if(this.lessLaunchPowerKey.isDown && this.launchPower > 500){this.adjustLaunchPower(-10);}
    if(this.spawnPlayerKey.isDown){this.spawnRemotePlayer();}
    if(this.launchKey.isDown){this.fire();}

    this.updateMissleRotation();
    this.checkMissleCollison();

    // TODO: Remove when server is created.
    if(this.spawnDelay > 0){this.spawnDelay--;}
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
    this.launchPower += adjustment;
    this.launchPowerTxt.text = "Power: " + this.launchPower;
  },

  checkMissleCollison: function(){
    if(this.missle.isActive){
      // Get missle bounding box
      var missleBounds = this.missle.getBounds();
      // Check for collision with ground
      if(Phaser.Rectangle.intersects(missleBounds, this.ground.getBounds())){this.resetMissle();}
      // Check for outside of game area
      if(this.missle.x < 0 || this.missle.x > 5000){this.resetMissle();}
      // Check for collision with any active players.
      var enemyBounds = null;
      for(i=0; i < this.remotePlayers.length; i++){
        enemyBounds = this.remotePlayers[i].launcher.getBounds();
        if(Phaser.Rectangle.intersects(missleBounds, enemyBounds)){
          this.resetMissle();
          this.destroyEnemy(i);
        }
      }
    }
  },

  resetMissle: function(){
    this.missle.isActive = false;
    this.missle.kill();
    this.camera.follow();
    this.add.tween(this.camera).to({x:(this.launcher.x-(this.game.camera.width/2))}, 1000, "Quint", true, 1000);
    this.reloadMissle();
  },

  reloadMissle: function(){
    this.missle.body = null;
    this.missle.reset(this.launcher.x + 20, this.launcher.y + 10);
    this.missle.angle = this.launcherTurret.angle;
  },

  spawnRemotePlayer: function(){
    if(this.spawnDelay == 0){
      this.remotePlayers.push(new RemotePlayer(this.remotePlayerNum, this, this.world.randomX, 595));
      this.remotePlayerNum++;
      this.spawnDelay=10;
    }
  },

  destroyEnemy: function(i){
    this.remotePlayers[i].launcher.kill();
    this.remotePlayers[i].launcherTurret.kill();
    this.remotePlayers[i].missle.kill();
    this.remotePlayers.splice(i,1);
  },

  setEventHandlers: function(){

  }
}

game.state.add('game', PhaserGame, true);
