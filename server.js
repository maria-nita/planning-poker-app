const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {
	userJoin, 
	getCurrentUser,
	userLeave,
	getRoomUsers
} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

//set our static folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'App Admin Bot';

//run when a cleint connects
io.on('connection', socket => {
	socket.on('joinRoom', ({ username, room }) => {
		// user joins a chat room
		const user = userJoin(socket.id, username, room);
		socket.join(user.room);

		//Welcome currrent user
		// emit sends message to just the user connecting
		socket.emit('message', formatMessage(botName, `Welcome to our Chat ${username}`));

		//broadcast when a user connects to the chat
		//broadcast emit (vs just emit) emits to everyone but the user connecting
		socket.broadcast.to(user.room).emit(
			'message', 
			formatMessage(botName, `${username} joined the chat`
		));

		//send users and room info
		io.to(user.room).emit('roomUsers', {
			room: user.room,
			users: getRoomUsers(user.room)
		});
	});

	//listen for chat message emmitted from the user
	socket.on('chatMessage', msg => {
		const user = getCurrentUser(socket.id);

		// send to everybody in the same room as this user
		io.to(user.room).emit('message', formatMessage(user.username, msg));
	});

	//runs when client disconnects
	socket.on('disconnect', () => {
		const user = userLeave(socket.id);

		if (user) {
			io.to(user.room).emit(
				'message',
				formatMessage(botName, `${user.username} has left the chat`)
			);

			//update room users infoo
			io.to(user.room).emit('roomUsers', {
				room: user.room,
				users: getRoomUsers(user.room)
			});
			}
		
	});
});

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`server is running on port ${PORT}`));