var Player = function(startX, startY){
  var x = startX;
  var y = startY;
  var turretAngle = -90;
  var id;

  var getX = function(){
    return x;
  };

  var getY = function(){
    return y;
  };

  var getA = function(){
    return turretAngle;
  };

  var setX = function(n){
    x = n;
  };

  var setY = function(n){
    y = n;
  };

  var setA = function(n){
    a = n;
  };

  return{
    getX: getX,
    getY: getY,
    getA: getA,
    setX: setX,
    setY: setY,
    setA: setA,
    id: id
  }
};

exports.Player = Player;
