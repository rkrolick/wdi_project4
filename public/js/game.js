var game = new Phaser.Game(1080, 720, Phaser.CANVAS, 'game');

var PhaserGame = function(game){
  this.isAlive = null;
  this.id = null;
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
    this.load.image('ground', 'sprites/ground.png');
    this.load.spritesheet('explosion', 'sprites/explosion.png', 500, 500, 4);
    // this.load.image('explosion', 'sprites/explosion.png');
  },

  create: function(){
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
    this.isAlive = true;
    this.missle.isActive = false;
    this.launchPower = 500;
    // Display hud
    this.launchPowerTxt = this.add.text(10, 10, "Power: 500", {font: "40px Arial", fill: "#FF0000"});
    this.launchPowerTxt.fixedToCamera = true;
    // Missle explosion
    this.missleExplosion = this.add.sprite(this.launcher.x, this.launcher.y, 'explosion');
    this.missleExplosion.anchor.x = 0.5;
    this.missleExplosion.anchor.y = 0.5;
    this.missleBoom = this.missleExplosion.animations.add('boom');
    this.missleExplosion.animations.play('boom', 6, false);
    // Launcher explosion
    this.bodyExplosion = this.add.sprite(this.launcher.x, this.launcher.y, 'explosion');
    this.bodyExplosion.anchor.x = 0.5;
    this.bodyExplosion.anchor.y = 0.5;
    this.bodyBoom = this.bodyExplosion.animations.add('boom');
    this.bodyExplosion.animations.play('boom', 6, false);
    // Connect to server
    this.socket = io.connect("http://107.170.62.250:3000");
    // Listen for events
    this.setEventHandlers();
  },

  update: function(){
    // Input checks
    if(this.isAlive){
      if(this.aimUpKey.isDown && this.launcherTurret.angle > -179){this.moveTurret(-1);}
      if(this.aimDownKey.isDown && this.launcherTurret.angle < -1){this.moveTurret( 1);}
      if(this.moreLaunchPowerKey.isDown && this.launchPower < 1000){this.adjustLaunchPower(10);}
      if(this.lessLaunchPowerKey.isDown && this.launchPower > 500){this.adjustLaunchPower(-10);}
      if(this.spawnPlayerKey.isDown){this.spawnRemotePlayer();}
      if(this.launchKey.isDown){this.fire();}
    }

    this.updateMissleRotation();
    this.checkMissleCollison();

    // TODO: Remove when server is created.
    if(this.spawnDelay > 0){this.spawnDelay--;}
  },

  moveTurret: function(degree){
    this.launcherTurret.angle += degree;
    this.missle.angle += degree;
    this.socket.emit("move turret", {angle: this.launcherTurret.angle});
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
      this.socket.emit("move missle", {x: this.missle.x, y: this.missle.y, r: this.missle.rotation})
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
        enemyId = this.remotePlayers[i].id;
        if(Phaser.Rectangle.intersects(missleBounds, enemyBounds)){
          this.resetMissle();
          this.destroyEnemy(i);
          this.socket.emit("kill player", {id: enemyId});
        }
      }
    }
  },

  resetMissle: function(){
    this.missle.isActive = false;
    this.missleExplosion.x = this.missle.x;
    this.missleExplosion.y = this.missle.y;
    this.missleExplosion.animations.play("boom", 6, false);
    this.missle.kill();
    this.camera.follow();
    this.add.tween(this.camera).to({x:(this.launcher.x-(this.game.camera.width/2))}, 1000, "Quint", true, 1000);
    this.reloadMissle();
  },

  reloadMissle: function(){
    this.missle.body = null;
    this.missle.reset(this.launcher.x + 20, this.launcher.y + 10);
    this.missle.angle = this.launcherTurret.angle;
    this.socket.emit("move missle", {x: this.missle.x, y: this.missle.y, r: this.missle.rotation})
    if(!this.isAlive){this.missle.kill();}
  },

  spawnRemotePlayer: function(id,x){
    this.remotePlayers.push(new RemotePlayer(id, this, x, 595));
  },

  moveRemoteTurret: function(i, angle){
    this.remotePlayers[i].launcherTurret.angle = angle;
    this.remotePlayers[i].missle.angle = angle;
    // NOTE: Why do I get an error when I call this.remotePlayers[i].setTurretAngle ?
  },

  moveRemoteMissle: function(i, x, y, r){
    this.remotePlayers[i].missle.x = x;
    this.remotePlayers[i].missle.y = y;
    this.remotePlayers[i].missle.rotation = r;
  },

  destroyEnemy: function(i){
    // this.remotePlayers[i].bodyExplosion.x = this.remotePlayers[i].launcher.x;
    // this.remotePlayers[i].bodyExplosion.y = this.remotePlayers[i].launcher.y;
    // this.remotePlayers[i].bodyExplosion.animations.play("boom", 6, false);
    this.remotePlayers[i].launcher.kill();
    this.remotePlayers[i].launcherTurret.kill();
    this.remotePlayers[i].missle.kill();
    this.remotePlayers.splice(i,1);
  },

  destroySelf: function(){
    this.isAlive = false;
    this.bodyExplosion.x = this.launcher.x;
    this.bodyExplosion.y = this.launcher.y;
    this.bodyExplosion.animations.play("boom", 6, false);
    this.launcher.kill();
    this.launcherTurret.kill();
    if(!this.missle.isActive){this.missle.kill();}
  },

  setEventHandlers: function(){
    this.socket.on("connect", this.onSocketConnected.bind(this));
    this.socket.on("disconnect", this.onSocketDisconnect.bind(this));
    this.socket.on("get id", this.onGetId.bind(this));
    this.socket.on("new player", this.onNewPlayer.bind(this));
    this.socket.on("move turret", this.onMoveTurret.bind(this));
    this.socket.on("remove player", this.onRemovePlayer.bind(this));
    this.socket.on("move missle", this.onMoveMissle.bind(this));
  },

  onSocketConnected: function(){
    console.log("Connected to server");
    this.socket.emit("new player", {x: this.launcher.x, y: this.launcher.y});
  },
  onSocketDisconnect: function(){
    console.log("Disconnected from server");
  },
  onGetId: function(data){
    this.id = data.id;
    console.log("Your id is: " + this.id);
  },
  onNewPlayer: function(data){
    console.log("New player connected: " + data.id);
    this.spawnRemotePlayer(data.id, data.x);
  },
  onMoveTurret: function(data){
    console.log(data.id + " moved their turret");
    var index = this.indexById(data.id);
    this.moveRemoteTurret(index, data.angle);
  },
  onRemovePlayer: function(data){
    if(data.id == this.id){this.destroySelf(); return;}
    var index = this.indexById(data.id);
    this.destroyEnemy(index);
  },
  onMoveMissle: function(data){
    var index = this.indexById(data.id);
    this.moveRemoteMissle(index, data.x, data.y, data.r);
  },

  indexById(id){
    for(var i = 0; i < this.remotePlayers.length; i++){
      if(this.remotePlayers[i].id == id){
        return i;
      }
    }
    return false;
  }

}

game.state.add('game', PhaserGame, true);
