import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";

function waitForElm(selector) {
  return new Promise(resolve => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver(mutations => {
      if (document.querySelector(selector)) {
        resolve(document.querySelector(selector));
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
}


function addTip(div, options) {
  let curTip = document.createElement("div");

  curTip.className = "tip";
  curTip.id = options["id"];

  let tipUser = document.createElement("p");

  tipUser.className = "username";
  tipUser.innerText = options["username"];

  let tipContent = document.createElement("p");

  tipContent.className = "content";
  tipContent.innerText = options["content"];

  let likeButton = document.createElement("button");

  likeButton.className = "button likeButton";
  likeButton.innerText = "Like (" + options["likes"] + ")";

  div.appendChild(curTip);
  curTip.appendChild(tipUser);
  curTip.appendChild(tipContent)
  curTip.appendChild(likeButton);
}

let socket = null;
let interval = null;

function init() {
  if (interval) {
    clearInterval(interval);
  }
  waitForElm('#stateChange').then((elm) => {
    console.log('Element is ready');
    console.log(elm.textContent);
    interval = setInterval(() => {
      if (!document.getElementById("stateChange")) {
        console.log("Element doesn't exist");
        socket = null;
        init();
      }
    });

    const PUIUser = document.getElementById("PUIUser");
    const PUIAuth = document.getElementById("PUIAuth");
    const PUILogin = document.getElementById("PUILogin");
    const PUISignup = document.getElementById("PUISignup");
    const LoginAgain = document.getElementById("SignIn");
    const LoginScreen = document.getElementById("NotLoggedIn");
    const TipsScreen = document.getElementById("LoggedIn");
    const ConnectingScreen = document.getElementById("Connecting");
    const ConnectingTitle = document.getElementById("LoadTitle");
    const ConnectingSubtitle = document.getElementById("LoadSubtitle");
    const TipInput = document.getElementById("TipInput");
    const TipSubmit = document.getElementById("TipSubmit");
    const TipBox = document.getElementById("TipBox");
    let isLoginPage = false;

    LoginAgain.addEventListener("click", () => {
      LoginScreen.removeAttribute("hidden");
      TipsScreen.setAttribute("hidden", "");
      LoginAgain.setAttribute("hidden", "");
      ConnectingScreen.setAttribute("hidden", "");
    });

    PUILogin.addEventListener("click", () => {
      ConnectingTitle.innerText = "Logging in...";
      ConnectingSubtitle.innerText = "Please wait, we're logging you in...";
      ConnectingScreen.removeAttribute("hidden");
      LoginScreen.setAttribute("hidden", "");
      TipsScreen.setAttribute("hidden", "");
      isLoginPage = true;
      socket.emit("auth", { "username": PUIUser.value, "password": PUIAuth.value });
    });

    PUISignup.addEventListener("click", () => {
      window.open("https://cloudwebv2.skywarspro15.repl.co/", "Sign up to PowerUI Cloud", "width=360,height=640");
    });

    let socket = io("https://typhoonwatch-tips.tranch-research.repl.co");

    TipSubmit.addEventListener("click", () => {
      let curInput = TipInput.value;
      console.log(curInput);
      if (localStorage.getItem("user")) {
        socket.emit("addTip", { "username": localStorage.getItem("user"), "password": localStorage.getItem("auth"), "content": curInput });
      }
    });

    ConnectingScreen.removeAttribute("hidden");

    socket.on("connect", () => {
      while (TipBox.lastElementChild) {
        TipBox.removeChild(TipBox.lastElementChild);
      }
      console.log("Connected to server");
      if (localStorage.getItem("user") == null) {
        LoginScreen.removeAttribute("hidden");
        TipsScreen.setAttribute("hidden", "");
        ConnectingScreen.setAttribute("hidden", "");
      } else {
        ConnectingTitle.innerText = "Logging in...";
        ConnectingSubtitle.innerText = "Please wait, we're logging you in...";
        ConnectingScreen.removeAttribute("hidden");
        LoginScreen.setAttribute("hidden", "");
        TipsScreen.setAttribute("hidden", "");
        socket.emit("auth", { "username": localStorage.getItem("user"), "password": localStorage.getItem("auth") });
      }
    });

    socket.on("authStatus", (data) => {
      console.log(data);
      if (data["result"] == "success") {
        if (isLoginPage) {
          localStorage.setItem("user", PUIUser.value);
          localStorage.setItem("auth", PUIAuth.value);
        }
        ConnectingScreen.setAttribute("hidden", "");
        TipsScreen.removeAttribute("hidden");
        LoginScreen.setAttribute("hidden", "");
        socket.emit("getTips", { "username": localStorage.getItem("user"), "password": localStorage.getItem("auth") });
      } else {
        ConnectingTitle.innerText = "Authentication failed";
        ConnectingSubtitle.innerText = data["reason"];
        ConnectingScreen.removeAttribute("hidden");
        LoginAgain.removeAttribute("hidden");
        localStorage.removeItem("user");
        localStorage.removeItem("auth");
      }
      isLoginPage = false;
      PUIUser.value = "";
      PUIAuth.value = "";
    });

    socket.on("curTips", (tips) => {
      console.log(tips);
      tips.forEach((tip) => {
        addTip(TipBox, { "id": tip["id"], "username": tip["username"], "content": tip["content"], "likes": tip["likes"] });
        let tipDiv = document.getElementById(tip["id"]);
        let likeButton = tipDiv.querySelector(".button.likeButton");
        likeButton.addEventListener("click", () => {
          socket.emit("likeTip", { "username": localStorage.getItem("user"), "password": localStorage.getItem("auth"), "id": tip["id"] });
        });
      });

      socket.on("newTip", (data) => {
        console.log(data);
        addTip(TipBox, { "id": data["id"], "username": data["username"], "content": data["content"], "likes": 0 });
        let tipDiv = document.getElementById(data["id"]);
        let likeButton = tipDiv.querySelector(".button.likeButton");
        likeButton.addEventListener("click", () => {
          socket.emit("likeTip", { "username": localStorage.getItem("user"), "password": localStorage.getItem("auth"), "id": data["id"] });
        })
      });

      socket.on("likeUpdate", (data) => {
        console.log(data);
        let tipDiv = document.getElementById(data["id"]);
        let curLikeButton = tipDiv.querySelector(".button.likeButton");
        curLikeButton.innerHTML = "Like (" + data["count"] + ")";
      });

      socket.on("postFail", (reason) =>{
        alert(reason)
      });

    });

  });
}

init();



