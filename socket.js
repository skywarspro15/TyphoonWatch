import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";

var button = document.getElementById("sendButton");
var messages = document.getElementById("messages");
var fullData = "";
var bubbleCreated = false;
var typingEnabled = false;
var respBubble;
var messageHistory = [];
var socket;
var uInput = document.getElementById("uInput");

function sendMessage() {
  let inputText = uInput.value;

  if (inputText.trim() == "" || typingEnabled == false) {
    return;
  }

  uInput.value = "";

  let sendBubble = document.createElement("div");
  sendBubble.className = "message user";
  sendBubble.innerText = inputText;
  messages.appendChild(sendBubble);

  sendBubble.scrollIntoView({ behavior: "smooth" });
  let status = document.createElement("div");
  messages.appendChild(status);
  status.innerHTML = "🤔 Reading the page...";
  socket.emit("ground", {
    "site": "https://lifelabsproject.tk",
    "prompt": inputText,
  });
}

button.addEventListener("click", sendMessage);
uInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    sendMessage();
  }
});
socket = io("wss://DaisyGPT-Realtime.tranch-research.repl.co");

socket.on("connect", () => {
  let status = document.createElement("div");
  status.innerHTML = "🤔 Reading the page...";
  messages.appendChild(status);
  socket.emit("ground", {
    "site": document.referrer,
    "prompt":
      "You're now in a conversation with a user. Greet them and introduce yourself.",
  });
});

socket.on("groundingPrompt", (prompt) => {
  let status = document.createElement("div");
  status.innerHTML = "✅ Generating a response...";
  messages.appendChild(status);
  messageHistory.push({
    "role": "user",
    "content": prompt,
  });
  socket.emit("begin", {
    "site": document.referrer,
    "prompt": prompt,
    "context": messageHistory,
  });
});

socket.on("state", (state) => {
  console.log(state);
});

socket.on("error", (err) => {
  console.error(err);
});

socket.on("recv", (data) => {
  console.log(data);
  fullData = fullData + data["data"];

  if (!bubbleCreated) {
    respBubble = document.createElement("div");
    respBubble.className = "message gpt";
    respBubble.innerText = fullData;
    messages.appendChild(respBubble);
    bubbleCreated = true;
  } else {
    respBubble.innerText = fullData;

    respBubble.scrollIntoView();
  }
});

socket.on("done", () => {
  typingEnabled = true;
  bubbleCreated = false;
  messageHistory.push({
    "role": "assistant",
    "type": "custom",
    "content": fullData,
  });
  fullData = "";
  respBubble.scrollIntoView({ behavior: "smooth" });
});
