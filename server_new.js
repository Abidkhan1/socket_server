const app = require("express")();
const axios = require('axios');
const httpServer = require("http").createServer(app);
const options = { /* ... */ };
app.use(require('cors')())
const io = require("socket.io")(httpServer, {
  origins:["127.0.0.1:3000","http://www.omnicode.tech/wego/socket","http://www.omnicode.tech/wego/socket:3000"],
  path: '/',
  serveClient: false,
  // below are engine.IO options
  pingInterval: 20000,
  pingTimeout: 5000,
  cookie: false,
  transports: ['polling', 'websocket'],
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});


// {
//   origins:["127.0.0.1:8000"],
//   path: '/',
//   serveClient: false,
//   // below are engine.IO options
//   pingInterval: 20000,
//   pingTimeout: 5000,
//   cookie: false
// }

const url = "http://omnicode.tech/wego/dev";

app.use( (req, res, next) => {
   res.header("Access-Control-Allow-Origin", "*");
   res.header("Access-Control-Allow-Credentials", "true");
   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
   next();
});


// http.listen(3000, function(){
//     console.log('Listening on Port 3000');
// });

app.get('/', (req, res) => {
  res.send('<h1>Socket server is running, open for client connections.</h1>');
});

io.on("connection", socket => {

   console.log('server connected');

   socket.on("hello_conect",()=>{
    console.log('Hello from client.');
    socket.emit("server_emit");
  });

  socket.emit("server_emit",()=>{
    console.log('server_emit fired');
  });

    socket.on('user_connected',function(user_id){
        console.log('user connected id : '+user_id);
        socket.emit('received');
    })

    socket.on('mobile_event',function(user_id){
        console.log('Mobile Event Received with user_id : '+user_id);
        socket.emit('mobile_event_received','Mobile Event Received successfully.');
    })

    socket.on('add_ride',function(data){
        let obj = JSON.parse(data);

        console.log('add_ride Data : ',obj);
        var options = {
            headers: {
                'User-Agent': 'axios'
            }
        };
        //make Axios call to add new ride
        axios.post(url+"/weGO/api/add_new_ride",obj)
        .then(response=>{
          console.log('response:',response.data.data.ride_id);
          socket.emit('new_ride_created',JSON.stringify({
            ride_id:response.data.data.ride_id,
          }));
        })
        .catch(err=>{
          console.log('error:',err);
        })
    })//add ride listener

    socket.on('new_location',function(data){
      //this will provide user_id, lat, long
        let obj = JSON.parse(data);
        console.log('new_location Data : ',obj);
        var options = {
            headers: {
                'User-Agent': 'axios'
            }
        };
        //make Axios call to add new ride
        axios.post(url+"/weGO/api/update_user_location",obj)
        .then(response=>{
          console.log('update_user_location response:');
          socket.emit('location_updated','Location updated successfully');
        })
        .catch(err=>{
          console.log('error:',err);
        })
    })//new_location listener

})

var socket_server_ip = 'http://localhost:3000';
// const socket_server_ip = 'https://40d471b2f64c.ngrok.io';

const socket = require("socket.io-client")(socket_server_ip);
// const socket = require("socket.io-client")("http://omnicode.tech/wego/dev:1026");

socket.on("connect_error", (err) => {
  console.log(`connect_error due to ${err.message}`);
});

socket.on("disconnect", () => {
  console.log('Socket disconnected');
});




httpServer.listen(3000, function(){
    console.log('Listening on Port 3000');
});
