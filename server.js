import { Application, Router } from "https://deno.land/x/oak/mod.ts";

const connectedClients = new Map();
const app = new Application();
const port = 8080;
const router = new Router();

// send a message to all connected clients
function broadcast(message) {

  for (const client of connectedClients.values()) {

    client.send(message);
  }
}

// send updated users list to all connected clients
function updateUser() {
  const usernames = [...connectedClients.keys()];


  broadcast(
    JSON.stringify({
      event: "update-users",
      usernames: usernames,
    }),
  );
}

router.get("/start_web_socket", async (ctx) => {

  const socket = await ctx.upgrade();

  const username = ctx.request.url.searchParams.get("username");
  
  if (connectedClients.has(username)) {
    socket.close(1008, `Username ${username} is already taken`);
    return;
  }

  socket.username = username;

  connectedClients.set(username, socket);

  socket.onopen = () => {
    updateUser();
  };

  // when a client disconnects, remove them from the connected clients list
  // and broadcast the active users list
  socket.onclose = () => {
    connectedClients.delete(socket.username);
    
    updateUser();
  };

  // broadcast new message if someone sent one
  socket.onmessage = (m) => {
    const data = JSON.parse(m.data);
    switch (data.event) {
      case "send-message":
        broadcast(
          JSON.stringify({
            event: "send-message",
            username: socket.username,
            message: data.message,
          }),
        );
        break;
    }
  };
});



app.use(router.routes());
app.use(router.allowedMethods());
app.use(async (context) => {
  await context.send({
    root: `${Deno.cwd()}/`,
    index: "./index.html",
  });
});

console.log("Listening at http://localhost:" + port);
await app.listen({ port });