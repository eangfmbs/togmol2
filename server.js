var express = require('express');
var app     = express();
var http    = require('http').createServer(app);
var io      = require('socket.io')(http);
var morgan  = require('morgan');
var mongoose= require('mongoose');
var bodyParser = require('body-parser');
var router     = express.Router();
var appRoute   = require('./app/routes/api')(router, io);
var path       = require('path');
var passport   = require('passport');
var social     = require('./app/passport/passport')(app, passport); //mean that we are passing 2 values from the server file to passport.js file is app that is belong to express and passport
var port    = process.env.PORT || 8080;

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({limit:'20mb', extended: true }));
app.use(bodyParser.json({limit: '20mb'}));
app.use(express.static(__dirname+'/public'));
app.use('/api', appRoute);

mongoose.Promise = global.Promise;
var uri = 'mongodb://localhost:27017/togmoldb';
mongoose.connect(uri, { useMongoClient: true }, function(error) {
    if(error){
        console.log("Cannot connect to mongodb!");
    } else{

      // io.on('connection', function(socket) {
      //     console.log('Client connected...');
      //     socket.on('join', function(data) {
      //         console.log(data);
      //     });
      //     var i = 0;
      //     setInterval(function(){
      //       socket.emit('notification',{
      //         notification: i
      //       });
      //       i++;
      //     },1000);
      //     let token = socket.handshake.query.token;
      //     global.activeSocketUser[token] = socket;
      //     // console.log("what is global: ", global.activeSocketUser[token]);
      //     socket.on('disconnect', function(){
      //       let token = socket.handshake.query.token;
      //       global.activeSocketUser[token] = null;
      //     })
      //     console.log('the token: ', token)
      // });



        console.log("Connection Successfully!");
    }
})



app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname,'/public/app/views/index.html'));
})





// The 'io.on' is listenin
// app.listen(port, function(){
//     console.log("Running server on port "+port)
// });
http.listen(port, function(){
  console.log("Running server with socket.io on port "+port)
})
