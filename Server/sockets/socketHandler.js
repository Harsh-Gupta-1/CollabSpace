
const socketHandler = (io) => {
  const roomUsers = {};
  const roomStates = {};

  const emitRoomUsers = (roomId) => {
    const users = roomUsers[roomId]
      ? Array.from(roomUsers[roomId].entries()).map(([id, username]) => ({
        id,
        username,
      }))
      : [];
    io.to(roomId).emit("room-users", { users });
  };

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("join-room", ({ roomId, username }) => {
      console.log(`${socket.id} joining room ${roomId} as ${username}`);
      socket.join(roomId);

      if (!roomUsers[roomId]) roomUsers[roomId] = new Map();
      roomUsers[roomId].set(socket.id, username);

      if (!roomStates[roomId]) {
        roomStates[roomId] = {
          messages: [],
          code: "",
          whiteboard: { objects: [], backgroundColor: "#ffffff" },
        };
      }

      io.to(roomId).emit("user-joined", { username });
      emitRoomUsers(roomId);
      socket.emit("room-state", roomStates[roomId]);
    });

    socket.on("get-users", (roomId) => {
      emitRoomUsers(roomId);
    });

    socket.on("send-message", ({ roomId, msg }) => {
      if (roomStates[roomId]) {
        roomStates[roomId].messages.push(msg);
      }
      io.to(roomId).emit("receive-message", msg);
    });

    socket.on("code-update", ({ roomId, code }) => {
      if (roomStates[roomId]) {
        roomStates[roomId].code = code;
      }
      socket.broadcast.to(roomId).emit("code-update", code);
    });

    socket.on("whiteboard-update", ({ roomId, data }) => {
      if (roomStates[roomId]) {
        if (data.type === "object-added" && data.object) {
          if (!data.object.id) {
            data.object.id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          }
          const existing = roomStates[roomId].whiteboard.objects.find(
            (obj) => obj.id === data.object.id
          );
          if (!existing) {
            roomStates[roomId].whiteboard.objects.push(data.object);
          }
        } else if (data.type === "object-modified" && data.object) {
          if (!data.object.id) {
            data.object.id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          }
          const index = roomStates[roomId].whiteboard.objects.findIndex(
            (obj) => obj.id === data.object.id
          );
          if (index !== -1) {
            roomStates[roomId].whiteboard.objects[index] = data.object;
          } else {
            roomStates[roomId].whiteboard.objects.push(data.object);
          }
        } else if (data.type === "object-removed" && data.objectId) {
          roomStates[roomId].whiteboard.objects = roomStates[roomId].whiteboard.objects.filter(
            (obj) => obj.id !== data.objectId
          );
        } else if (data.type === "clear") {
          roomStates[roomId].whiteboard.objects = [];
        } else if (data.type === "full-sync" && data.canvasData) {
          roomStates[roomId].whiteboard = data.canvasData;
        }
      }
      socket.broadcast.to(roomId).emit("whiteboard-update", { data });
    });

    socket.on("get-room-state", ({ roomId }) => {
      const state = roomStates[roomId] || {
        messages: [],
        code: "",
        whiteboard: { objects: [], backgroundColor: "#ffffff" },
      };
      socket.emit("room-state", state);
    });

    socket.on("leave-room", ({ roomId, username }) => {
      console.log(`${username} leaving room ${roomId}`);
      socket.leave(roomId);
      if (roomUsers[roomId]) {
        roomUsers[roomId].delete(socket.id);
        io.to(roomId).emit("user-left", { username });
        emitRoomUsers(roomId);
        if (roomUsers[roomId].size === 0) {
          delete roomUsers[roomId];
          delete roomStates[roomId];
        }
      }
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
      for (const roomId in roomUsers) {
        if (roomUsers[roomId].has(socket.id)) {
          const username = roomUsers[roomId].get(socket.id);
          roomUsers[roomId].delete(socket.id);
          io.to(roomId).emit("user-left", { username });
          emitRoomUsers(roomId);
          if (roomUsers[roomId].size === 0) {
            delete roomUsers[roomId];
            delete roomStates[roomId];
          }
          break;
        }
      }
    });
  });
};

export default socketHandler;