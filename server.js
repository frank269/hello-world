var express = require('express');var path = require('path');app = express();app.use(express.static('./public'));server = require('http').Server(app);io = require('socket.io')(server),//var fileController = require('./FileController');
app.set('view engine','ejs');app.set('views', './views');
//var HelloController = require('./controller/Controller');
app.get('/index', function(req, res) {    res.sendFile(__dirname+"/views/index.html");})app.get('/home', function(req, res) {    res.sendFile(__dirname+"/views/home.html");})
app.get('/chat', function(req, res) {    res.render('demochat');})
//app.get('/', HelloController.getHelloView);
// app.get('*', function(req, res) {//     res.send("404 Not found!");// })
//fileController.manageFiles(app);
var clients=[], userName = [];client_count = 0;
io.sockets.on('connection', function (socket) {  console.log('A user connected! id:'+ socket.id);  client_count++;  socket.on('signin', function(data){      if(userName.indexOf(data)<0){        var x = {id: socket.id, name: data, available: true};        socket.emit('Successful',x);        clients.push(x);        userName.push(data);        io.emit('updateUserOnline',clients);      }else{        socket.emit('nameError');      }  })
  socket.on('connectTo', function(data){    if(data.to.available)      socket.broadcast.to(data.to.id).emit('isAcceptUser', data.from);    else {      socket.emit('userInGame');    }  })
  io.emit('numConnection',client_count);  socket.on('msg', function(data){      io.to(data.room).emit('newmsg', data.info);  })
  socket.on('I-am-ready', function(){     var thisid = socket.id;     clients.push(thisid);     clients[thisid] = '';     for(var val of clients){       if(val!= thisid && clients[val]==''){         console.log("finded!");         socket.join(val);         clients[val] = val;         clients[thisid] = val;         io.to(val).emit('setRoom', val);         break;       }     }  })  socket.on('restartG', function(data) {    socket.broadcast.to(data).emit('restartgame');  })
  socket.on('winner', function(data){    io.to(data.room).emit('setwin',data.turn);  })  socket.on('check',function(data){    socket.broadcast.to(data.room).emit('mark',data.pos);  })  socket.on('findnew', function(data){    var thisid = socket.id;    clients[thisid] = '';    socket.broadcast.to(clients[thisid]).emit('LeaveRoom');    for(var val of clients){      if(clients[val]==data){        clients[val]='';      }    }    socket.leave(data);  });   socket.on('disconnect', function(){     console.log("1 user has disconnect");     var thisid = socket.id,i;    //  socket.broadcast.to(clients[thisid]).emit('LeaveRoom');     for(i=0; i<client_count ; i++){       if(clients[i] && clients[i].id==thisid){         break;       }     }     clients.splice(i,1);     userName.splice(i,1);     client_count--;     io.emit('updateUserOnline',clients);   });});

