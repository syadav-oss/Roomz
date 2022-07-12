const socket = io("/");
const videoGrid = document.getElementById("video-grid");
const videoGrid2 = document.getElementById("video-grid-2");
const message = document.getElementById("message");
const btn = document.getElementById("send");
const output = document.getElementById("output");
const chatWindow = document.getElementById("chat-window");
const canvas = document.getElementById("canvas");
const whiteBoard = document.getElementById("myboard");
const chat = document.getElementById("mychat");

whiteBoard.style.display = "none";
chat.style.display = "none";
videoGrid2.style.display = "grid";
videoGrid.style.display = "grid";

const myPeer = new Peer({
  host: "/",
  port: "8001",
});
const myVideo = document.createElement("video");
myVideo.muted = true;
let myStream;
let peers = {};

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: false,
  })
  .then((stream) => {
    addVideoStream(myVideo, stream);

    myPeer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on("user-connected", (userId) => {
      setTimeout(() => {
        connectToNewUser(userId, stream);
      }, 500);
      // console.log("user-connected: " + userId);
    });
  });

socket.on("user-disconnected", (userId) => {
   //console.log(userId,peers[userId]);
  if (peers[userId]) peers[userId].close();
});

myPeer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id);
});

function connectToNewUser(userId, stream) {
  let call = myPeer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
  call.on("close", () => {
    //console.log('closing');
    video.remove();
  });
  peers[userId] = call;
}

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });

  if (whiteBoard.style.display == "none" && videoGrid.children.length == 0) {
    videoGrid.append(video);
  } else {
    videoGrid2.append(video);
  }
}

// chat

btn.addEventListener("click", () => {
  socket.emit("chat", {
    message: message.value,
    user: user,
  });
  output.innerHTML += "<p><span>" + user + ": </span>" + message.value + "</p>";
  message.value = "";

  chatWindow.scrollTop = chatWindow.scrollHeight;
});

socket.on("chat", (data) => {
  //console.log(data.message);
  output.innerHTML +=
    "<p><span>" + data.user + ": </span>" + data.message + "</p>";
});

function toggleChat() {
  if (chat.style.display === "none") {
    chat.style.display = "block";
    videoGrid2.style.display = "none";
  } else {
    chat.style.display = "none";
    videoGrid2.style.display = "grid";
  }
}

// toggle functions

function disconnectCall() {
  socket.disconnect();
  window.location.href = "/meeting";
}

function toggleCamera() {
  if (myVideo.srcObject) {
    myVideo.srcObject = null;
  } else {
    myVideo.srcObject = myStream;
  }
}

function toggleBoard() {
  if (whiteBoard.style.display === "none") {
    whiteBoard.style.display = "block";
    videoGrid.style.display = "none";

    videoGrid2.append(videoGrid.firstChild);
  } else {
    whiteBoard.style.display = "none";
    videoGrid.style.display = "grid";

    videoGrid.append(videoGrid2.lastChild);
  }
}

canvas.width = 0.98 * window.innerWidth;
canvas.height = window.innerHeight;

let ctx = canvas.getContext("2d");
const can = document.querySelector(".col-1");

var x;
var y;
var mouseDown = false;

window.onmousedown = (e) => {
  ctx.moveTo(x, y);
  socket.emit("down", { x, y });
  mouseDown = true;
};

window.onmouseup = (e) => {
  mouseDown = false;
};

socket.on("ondraw", ({ x, y }) => {
  ctx.lineTo(x, y);
  ctx.stroke();
});

socket.on("ondown", ({ x, y }) => {
  ctx.moveTo(x, y);
});

window.onmousemove = (e) => {
  x = e.clientX;
  y = e.clientY;

  if (mouseDown) {
    socket.emit("draw", { x, y });
    ctx.lineTo(x, y);
    ctx.stroke();
  }
};
