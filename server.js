var express = require('express');
var path = require('path');
app = express();
app.use(express.static('./public'));
server = require('http').Server(app);
io = require('socket.io')(server),
//var fileController = require('./FileController');

app.set('view engine','ejs');
app.set('views', './views');

//var HelloController = require('./controller/Controller');

app.get('/index', function(req, res) {
    res.sendFile(__dirname+"/views/index.html");
})
app.get('/home', function(req, res) {
    res.sendFile(__dirname+"/views/home.html");
})

app.get('/chat', function(req, res) {
    res.render('demochat');
})

//app.get('/', HelloController.getHelloView);

// app.get('*', function(req, res) {
//     res.send("404 Not found!");
// })

//fileController.manageFiles(app);

var clients=[];
client_count = 0;

io.sockets.on('connection', function (socket) {
  console.log('A user connected! id:'+ socket.id);
  client_count++;
  io.emit('numConnection',client_count);
  socket.on('msg', function(data){
      io.to(data.room).emit('newmsg', data.info);
  })

  socket.on('I-am-ready', function(){
     var thisid = socket.id;
     clients.push(thisid);
     clients[thisid] = '';
     for(var val of clients){
       if(val!= thisid && clients[val]==''){
         console.log("finded!");
         socket.join(val);
         clients[val] = val;
         clients[thisid] = val;
         io.to(val).emit('setRoom', val);
         break;
       }
     }
  })
  socket.on('restartG', function(data) {
    socket.broadcast.to(data).emit('restartgame');
  })


  socket.on('winner', function(data){
    io.to(data.room).emit('setwin',data.turn);
  })
  socket.on('check',function(data){
    socket.broadcast.to(data.room).emit('mark',data.pos);
  })
  socket.on('findnew', function(data){
    var thisid = socket.id;
    clients[thisid] = '';
    socket.broadcast.to(clients[thisid]).emit('LeaveRoom');
    for(var val of clients){
      if(clients[val]==data){
        clients[val]='';
      }
    }
    socket.leave(data);
  });
   socket.on('disconnect', function(){
     console.log("1 user has disconnect");
     client_count--;
     var thisid = socket.id;
     var room = clients[thisid];
     socket.broadcast.to(clients[thisid]).emit('LeaveRoom');
     for(var val of clients){
       if(clients[val]==room){
         clients[val]='';
       }
     }
     delete clients[thisid];
     clients.splice(clients.indexOf(thisid),1);
     io.emit('numConnection',client_count);
   });
});

server.listen(process.env.PORT || 3000);
