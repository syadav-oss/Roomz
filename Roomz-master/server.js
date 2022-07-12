const express = require("express");
const meetingRouter = require("./routes/meetingRoutes");

// setup
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
app.set("view engine", "ejs");

// Middleware
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
//video confercing
io.on('connection', socket => {
  socket.on('join-room', (roomId,userId) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-connected',userId);
    
    socket.once('disconnect', () => {
      socket.to(roomId).emit('user-disconnected',userId);
    })
    // chat event
    socket.on('chat', data => {
      socket.to(roomId).emit('chat',data);
    })

    // whiteboard
    socket.on('draw', data => {
      socket.to(roomId).emit('ondraw', {
        x : data.x,
        y : data.y
      })
    })

    socket.on('down', data => {
      socket.to(roomId).emit('ondown', {
        x : data.x,
        y : data.y
      })
    })

    // screen-sharing
    socket.on('screen-data', data => {
      data = JSON.parse(data);
      socket.to(roomId).emit('screen-data', data);
    })
  })
})

// routes
app.use(meetingRouter);
app.get("*", (req, res) => {
  res.render("404");
});

// listen
server.listen(8000);

module.exports = io;
