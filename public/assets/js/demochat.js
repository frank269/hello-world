var socket = io("http://localhost:3000");
const SIZE = 20;
var turnX = false, yourturn = true;
var board = new Array(SIZE);
var lastx=-1, lasty=-1;
var user,enemy, text='', clients = [], isOnGame = false;
var acceptScreen, registerScreen, winscreen;

function search(){
  alert("xin lỗi, tính năng chưa hoàn thiện!");
}
function signin(){
  var name = document.getElementById('textName');
  if(name.value){
    socket.emit('signin',name.value);
    name.value = "";
  }
}
function accept(){
  socket.emit('onAccept',user.room);
}
function cancel(){
  socket.emit('onCancel',user.room);
}
socket.on('canceled', function(){
    acceptScreen.style.display = "none";
});
socket.on('nameError', function(){
  $("#error").html("Name invalid, Try again!");
});

socket.on('Successful', function(data){
  $("#error").html("");
  $("#userName").html(data.name);
  registerScreen.style.display = "none";
  $("#welcomeScreen").show();
  user = data;
});

function connectTo(i) {
  enemy = clients[i];
  socket.emit('connectTo',{fr:user, t: enemy});
}
socket.on('updateUserOnline', function(data){
  clients = data;
  if(!user || isOnGame) return;
  var mes='', len = data.length;
  $("#numConnection").text(len);
  for(var i=0; i<len ; i++){
    if(!data[i].room && data[i].name != user.name)
      mes += '<li><span class="user" onclick="connectTo('+i+')">'+data[i].name+'</span></li>';
  }
  $("#userAvailable").html(mes);
});

socket.on('isAcceptUser',function (data){
    if(data.name == user.name){
      $("#btnAccept").hide();
      $("#enemyName").html("waitting your friend to play the game!");
    }else{
      enemy = data;
      $("#btnAccept").show();
      $("#enemyName").html('user <span class = "error">'+enemy.name+'</span>  invite you to play the game!');
    }
    user.room = data.room;
    acceptScreen.style.display = "block";
})

socket.on('startG',function () {
  acceptScreen.style.display = "none";
  clearBoard();
   $("#welcomeScreen").hide();
  $("#mainScreen").show();
  isOnGame = true;
  $("#chatlog").html("");
});

$(document).ready(function(){
  registerScreen = document.getElementById('registerScreen');
  acceptScreen = document.getElementById('AcceptScreen');
  winscreen = document.getElementById('winBox');
  registerScreen.style.display = "block";
  $("#textName").focus();
  createnewgrid();
});

function createnewgrid() {
  var html = '',pos;
  for(var i=0; i<SIZE; i++){
    board[i] = new Array(SIZE);
    for(var j=0; j<SIZE; j++){
      pos=i*SIZE+j;
      html+='<button class="btn" id="btn'+pos+'" onclick="check('+i+','+j+')"></button>';
      board[i][j]=0;
    }
    html += '<br/>'
  }
  $("#board").html(html);
}

function check(i,j) {
  if(isOnGame&&board[i][j]==0&&yourturn){
    socket.emit('check',{room: user.room, pos:{x:i,y:j}});
    mark(i,j);
    yourturn = false;
    $("#myturn").text("Enemy's");
    if(checkwin(i,j)){
      socket.emit('winner',{room: user.room, turn:yourturn});
    }
  }
}
socket.on('mark',function(data){
  mark(data.x,data.y);
  $("#myturn").text("Your");
  yourturn = true;
  //$("#board").effect( "shake" );
})

function mark(i,j){
    var pos=i*SIZE+j;
    if(lastx!=-1){
      var lastpos=lastx*SIZE+lasty;
      if(board[lastx][lasty]==1){
        $("#btn"+lastpos).addClass("lastX");
      }else{
        $("#btn"+lastpos).addClass("lastO");
      }
    }
    if(turnX){
      $("#btn"+pos).addClass("checkX");
      board[i][j]=1;
    }else{
      $("#btn"+pos).addClass("checkO");
      board[i][j]=-1;
    }
    turnX = !turnX;
    lastx = i;
    lasty = j;
}

function checkwin(x,y){
  for(var i=0;i<4;i++){
    if(checkline(x,y,i)) return true;
  }
  return false;
}
var dx=[1,1,0,1],
    dy=[0,1,1,-1];
function checkline(px,py,k){
  var count=1,i,x,y,val=board[px][py];
  for(i=1;i<5;i++){
    x=px+i*dx[k];
    y=py+i*dy[k];
    if(y>-1 && y<SIZE && x<SIZE && board[x][y]==val){
      count++;
    }else break;
  }
  for(i=1;i<5;i++){
    x=px-i*dx[k];
    y=py-i*dy[k];
    if(y>-1 && y<SIZE && x>-1 && board[x][y]==val){
      count++;
    }else break;
  }
  if(count>4) return true;
  else return false;
}



socket.on('setwin',function(data){
  if(data==yourturn){
    $("#isWin").text("You win!");
  }else {
    $("#isWin").text("You lose!");
  }
  document.getElementById('winBox').style.display = "block";
  isOnGame = false;
});

$(document).keypress(function(e) {
    if(e.which == 13) {
      if(isOnGame)
        $("#chat").click();
      else
        $("#btnRegister").click();
    }
});

function sendMessage(){
  var msg = document.getElementById('name').value;
    if(msg){
        socket.emit('msg',{room:user.room, info:{user: user.name, message: msg}});
        document.getElementById('name').value = "";
    }else{
      $("#error-container").text("Please enter text!");
    }
}

socket.on('newmsg', function(data){
      var mes = '<pre><b>' + data.user + '</b> says: <xmp>' + data.message + '</xmp></pre>';
      $("#chatlog").append(mes);
      $("#chatlog")[0].scrollTop = $("#chatlog")[0].scrollHeight;
})


socket.on('LeaveRoom',function () {
  alert("Your friend disconnected! restart the game");
  isOnGame = false;
  winscreen.style.display = "none";
  $("#mainScreen").hide();
  $("#welcomeScreen").show();
  enemy={};
});


var restart = false;

function restartgame() {
  $("#restart").hide();
  $("#findnew").hide();
  $("#isWin").text("waitting for your friend accept ...");
  socket.emit('restartG',user.room);
  restart = true;
}

socket.on('restartgame', function() {
  if(restart){
    clearBoard();
    $("#restart").show();
    $("#findnew").show();
    winscreen.style.display = "none";
    socket.emit('restartG',user.room);
    isOnGame = true;
  }
})

function findnew() {
  isOnGame = false;
  winscreen.style.display = "none";
  $("#mainScreen").hide();
  $("#welcomeScreen").show();
  socket.emit("findnew", user.room);
  enemy={};
}

function clearBoard() {
  restart = false;
  turnX = false;
  yourturn = true;
  lastx=-1;
  lasty=-1;
  $("#myturn").text("Your");
  for(var i=0; i<SIZE; i++){
    for(var j=0; j<SIZE; j++){
      if(board[i][j]==0) continue;
      pos=i*SIZE+j;
      if(board[i][j]==1){
        $("#btn"+pos).removeClass("checkX");
        $("#btn"+pos).removeClass("lastX");
      }else{
        $("#btn"+pos).removeClass("checkO");
        $("#btn"+pos).removeClass("lastO");
      }
      board[i][j]=0;
    }
  }
}
