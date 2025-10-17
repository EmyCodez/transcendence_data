import "./style.css";
import { io } from "socket.io-client";

const apiBase = import.meta.env.VITE_API_URL || "/api";

const app = document.getElementById("app")!;
app.innerHTML = `
  <div class="min-h-screen flex flex-col items-center justify-center bg-gray-50">
    <h1 class="text-4xl font-bold mb-6">🏓 ft_transcendence — Starter</h1>
    <div class="space-y-4">
      <button id="health" class="px-4 py-2 bg-blue-600 text-white rounded">Ping Backend</button>
      <div id="out" class="text-gray-700"></div>
      <div class="mt-6">
        <button id="connect" class="px-4 py-2 bg-green-600 text-white rounded">Connect Socket</button>
        <div id="socketStatus" class="mt-2 text-sm text-gray-600"></div>
      </div>
    </div>
  </div>
`;

document.getElementById("health")?.addEventListener("click", async () => {
  try {
    const res = await fetch(`${apiBase}/health`);
    const data = await res.json();
    (document.getElementById("out")!).textContent = JSON.stringify(data);
  } catch (err) {
    (document.getElementById("out")!).textContent = String(err);
  }
});

let socket: any = null;
document.getElementById("connect")?.addEventListener("click", () => {
  if (socket && socket.connected) {
    socket.disconnect();
    (document.getElementById("socketStatus")!).textContent = "Disconnected";
    socket = null;
    return;
  }
  socket = io("/", { path: "/socket.io" });
  (document.getElementById("socketStatus")!).textContent = "Connecting...";
  socket.on("connect", () => {
    (document.getElementById("socketStatus")!).textContent = "Connected: " + socket.id;
    socket.emit("join_room", "lobby");
  });
  socket.on("joined", (room: string) => {
    console.log("joined", room);
  });
  socket.on("player_move", (d: any) => {
    console.log("player_move", d);
  });
  socket.on("disconnect", () => {
    (document.getElementById("socketStatus")!).textContent = "Disconnected";
  });
});
