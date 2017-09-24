var express = require('express');
var path = require('path');
app = express();
app.use(express.static('./public'));
server = require('http').Server(app);
io = require('socket.io')(server);

app.set('view engine','ejs');
app.set('views', './views');


app.get('/index', function(req, res) {
    res.sendFile(__dirname+"/views/index.html");
})
app.get('/home', function(req, res) {
    res.sendFile(__dirname+"/views/home.html");
})

app.get('/chat', function(req, res) {
    res.render('demochat');
})


var clients=[], userName = [], userRooms = [];

io.sockets.on('connection', function (socket) {
  console.log('A user connected! id:'+ socket.id);

  socket.on('signin', function(data){
    if(userName.indexOf(data)<0){
      var x = {id: socket.id, name: data, room: ''};
      socket.emit('Successful',x);
      clients.push(x);
      userName.push(data);
      io.emit('updateUserOnline',clients);
    }else{
      socket.emit('nameError');
    }
  })

  socket.on('connectTo', function(data){
    var fr = userName.indexOf(data.fr.name);
    var t = userName.indexOf(data.t.name);
    if(!clients[t].room){
      var x = data.t.id;
      clients[t].room = clients[fr].room = x;
      var k = {p1:data.fr.name, p2:data.t.name, isPlay: false};
      userRooms[x] = k;
      socket.join(x);
      io.to(x).emit('isAcceptUser', clients[fr]);
      io.emit('updateUserOnline',clients);
    }else {
      /*socket.emit('userInGame');*/
    }
  })

  socket.on('onCancel', function(data){
      var fr = userName.indexOf(userRooms[data].p1);
      var t = userName.indexOf(userRooms[data].p2);
      delete userRooms[data];
      clients[fr].room = clients[t].room = '';
      io.to(data).emit('canceled');
      io.emit('updateUserOnline',clients);
      var frsk = io.sockets.connected[clients[fr].id];
      frsk.leave(data);
  })

  socket.on('onAccept', function(data){
      io.to(data).emit('startG');
  })

  socket.on('msg', function(data){
    io.to(data.room).emit('newmsg', data.info);
  })

  socket.on('restartG', function(data) {
    userRooms[data].isPlay = true;
    socket.broadcast.to(data).emit('restartgame');
  })
  socket.on('winner', function(data){
    io.to(data.room).emit('setwin',data.turn);
  })
  socket.on('check',function(data){
    socket.broadcast.to(data.room).emit('mark',data.pos);
  })

  socket.on('findnew', function(data){
    socket.broadcast.to(data).emit('LeaveRoom');
    var fr = userName.indexOf(userRooms[data].p1);
    var t = userName.indexOf(userRooms[data].p2);
    delete userRooms[data];
    clients[fr].room = clients[t].room = '';
    io.emit('updateUserOnline',clients);
    var frsk = io.sockets.connected[clients[fr].id];
    frsk.leave(data);
  });

  socket.on('disconnect', function(){
    console.log("1 user has disconnect");
    var thisid = socket.id,i;
    var client_count = userName.length;

    for(i=0; i<client_count ; i++){
      if(clients[i].id==thisid){
        break;
      }
    }
    if(i<client_count){
      var tmp = clients[i].room;
      if(tmp){
        io.to(tmp).emit('LeaveRoom');
        var fr = userName.indexOf(userRooms[tmp].p1);
        var t = userName.indexOf(userRooms[tmp].p2);
        delete userRooms[tmp];
        if(thisid == clients[fr].id){
          clients[t].room = '';
        }else{
          clients[fr].room = '';
          var frsk = io.sockets.connected[clients[fr].id];
          frsk.leave(tmp);
        }
      }

      clients.splice(i,1);
      userName.splice(i,1);
      io.emit('updateUserOnline',clients);
  }
  });
});

server.listen(process.env.PORT || 3000);
