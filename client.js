const myUsername = prompt("Please enter your name (Username is unique)! ") || "Anonymous";
const socket = new WebSocket(
  `ws://localhost:8080/start_web_socket?username=${myUsername}`,
);

socket.onmessage = (m) => {

  const data = JSON.parse(m.data);
  switch (data.event) {
    case "update-users":
      // refresh displayed user list
      let userListHtml = "";
      for (const username of data.usernames) {
        userListHtml += `<div>
         <p>
          ${username} online now
         </p> 
         </div>`;
      }
      document.getElementById("users").innerHTML = userListHtml;
      break;

    case "send-message":
        sendMessage(data.username, data.message);
      break;
  }
};

const sendMessage = (username, message) => {
  // displays new message
  document.getElementById(
    "conversation",
  ).innerHTML += 
    `
    <div class="user__message">
      <h5>
        ${username}
      </h5>
      <span class="message_text">
         <p>${message}</p>
      </span>
      <br/>
    </div>`
  ;
}


const sendData = () => {
  const inputElement = document.getElementById("data");
  let message = inputElement.value;
  inputElement.value = "";
  socket.send(
    JSON.stringify({
      event: "send-message",
      message: message,
    }),
  );
}
// on page load
window.onload = () => {
  const show = document.querySelector('.show_input');

  // when the client hits the ENTER key
  document.getElementById("data").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      sendData();
    }
  });

  // when the client click send
  show.addEventListener('click', () => {
    sendData();
  })
};