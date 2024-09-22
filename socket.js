import { Server as WebSocketServer } from 'socket.io';
import {Group} from './models/groupSchema.js';
import {User} from './models/userSchema.js';

const setupSocket = (server) => {
    const io = new WebSocketServer(server, {
        cors: {
            oorigin: "https://swiftchat.b-cdn.net",
            methods: ["GET", "POST"],
            credentials: true // Allow credentials (cookies, authorization headers, etc.)
        },
    });

    const allUsers = {}; // Store connected users

    io.on('connection', (socket) => {
        console.log(`Someone connected to socket server and socket id is ${socket.id}`);

        // Handle user joining
        socket.on('join-user', (username) => {
            console.log(`${username} joined socket connection`);
            allUsers[username] = { username, id: socket.id };
            io.emit('joined', allUsers);
        });

        // Handle incoming messages
        socket.on('send-message', ({ recipientUsername, message }) => {
            const recipientSocketId = allUsers[recipientUsername]?.id;
            if (recipientSocketId) {
                io.to(recipientSocketId).emit('receive-message', message);
                console.log(`Message sent to ${recipientSocketId}: ${message}`);
            } else {
                console.log(`Recipient ${recipientUsername} not found`);
            }
        });

        // Handle WebRTC signaling messages
        socket.on('signal', (data) => {
            const { type, offer, answer, candidate, receiverId } = data;
            if (type === 'offer') {
                socket.to(receiverId).emit('signal', { type: 'offer', offer, senderId: socket.id });
            } else if (type === 'answer') {
                socket.to(receiverId).emit('signal', { type: 'answer', answer, senderId: socket.id });
            } else if (type === 'ice-candidate') {
                socket.to(receiverId).emit('signal', { type: 'ice-candidate', candidate, senderId: socket.id });
            }
        });

        // WebRTC-specific events complete
        socket.on('offer', ({ from, to, offer }) => {
            console.log(from,to);
            const recipientSocketId = to;
            if (recipientSocketId) {
                io.to(recipientSocketId).emit('offer', { from, offer });
            }
        });

        socket.on('answer', ({ from, to, answer }) => {
            const recipientSocketId = allUsers[to]?.id;
            if (recipientSocketId) {
                io.to(recipientSocketId).emit('answer', { from, answer });
            }
        });

        socket.on('icecandidate', ({ from, to, candidate }) => {
            const recipientSocketId = allUsers[to]?.id;
            if (recipientSocketId) {
                io.to(recipientSocketId).emit('icecandidate', { from, candidate });
            }
        });

        socket.on('end-call', ({ from, to }) => {
            io.to(allUsers[to]?.id).emit('end-call', { from, to });
        });

        socket.on('call-ended', (caller) => {
            const [from, to] = caller;
            io.to(allUsers[from]?.id).emit('call-ended', caller);
            io.to(allUsers[to]?.id).emit('call-ended', caller);
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log('User disconnected', socket.id);
            // Remove the user from the list if they disconnect
            for (const [username, user] of Object.entries(allUsers)) {
                if (user.id === socket.id) {
                    delete allUsers[username];
                    io.emit('joined', allUsers);
                    break;
                }
            }
        });

        const socketmember = [];

        const userSocket = async (id) => {
            const user = await User.findById(id);
            return user.socketId;
        };
        
        const fetchGroupMemberSocket = async (groupId) => {
            const group = await Group.findById(groupId);
            // Clear previous socket members
            socketmember.length = 0; // Reset the array
        
            await Promise.all(group.members.map(async (id) => {
                const iid = await userSocket(id); // Await the result
                if (iid) socketmember.push(iid); // Push to array if valid
            }));
        
            return socketmember;
        };
        
        socket.on('send-message-group', async ({ groupId, messageContent, senderSocketId,userId,senderName }) => {
            // Fetch the socket IDs of group members
            await fetchGroupMemberSocket(groupId);
            // Emit the message to each member's socket
            console.log(socketmember)
            socketmember.forEach((s) => {
                if(s!=senderSocketId){
                console.log(s);
                io.to(s).emit('received-message-from-group', {userId,senderName,messageContent }); // Use 'receive-message' as the event name
                }
            });
        });
        
    });
};

export default setupSocket;

