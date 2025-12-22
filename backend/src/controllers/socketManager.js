import e from "express";
import { Server } from "socket.io";

let connections = {};
let messages = {};
let timeOnline = {};

export const connectToSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            allowedHeaders: ["*"],
            credentials: true
        }
    });

    io.on("connection", (socket) => {

        socket.on("join-call", (path) => {

            // FIXED undefined check
            if (connections[path] === undefined) {
                connections[path] = [];
            }

            connections[path].push(socket.id);
            socket.join(path);

            // FIXED Date.now()
            timeOnline[socket.id] = Date.now();

            // FIXED loop (i → a)
            for (let a = 0; a < connections[path].length; a++) {
                if (connections[path][a] !== socket.id) {
                    io.to(connections[path][a]).emit("user-joined", socket.id);
                }
            }
        });


        socket.on("signal", (toId, message) => {
            io.to(toId).emit("signal", socket.id, message);
        });


        socket.on("chat-message", (data, sender) => {

            // FIXED reduce callback
            const [matchingRoom, found] = Object.entries(connections).reduce(
                ([room, isFound], [roomKey, roomValue]) => {

                    if (!isFound && roomValue.includes(socket.id)) {
                        return [roomKey, true];
                    }

                    return [room, isFound];
                },
                ["", false]
            );

            if (found === true) {

                // FIXED undefined check
                if (messages[matchingRoom] === undefined) {
                    messages[matchingRoom] = [];
                }

                messages[matchingRoom].push({
                    sender: sender,
                    "data": data,
                    "socket-id-sender": socket.id
                });

                console.log("messages:", messages, matchingRoom, ":", sender, data);

                connections[matchingRoom].forEach(elem => {
                    if (elem !== socket.id) {
                        io.to(elem).emit("chat-message", {
                            sender: sender,
                            message: data,
                            socketIdSender: socket.id
                        });
                    }
                });

                io.to(matchingRoom).emit("chat-message", {
                    sender: sender,
                    message: data
                });
            }
        });


        socket.on("disconnect", () => {

            // FIXED Date.now()
            var diffTime = Math.abs(Date.now() - timeOnline[socket.id]);

            var key;

            // FIXED entries loop
            for (const [k, v] of Object.entries(connections)) {

                for (let a = 0; a < v.length; a++) {

                    if (v[a] === socket.id) {

                        key = k;

                        for (let a = 0; a < connections[key].length; a++) {
                            io.to(connections[key][a]).emit("user-disconnected", socket.id);
                        }

                        var index = connections[key].indexOf(socket.id);

                        if (index > -1) {
                            connections[key].splice(index, 1);
                        }
                    }
                }
            }
        });

    });

};
