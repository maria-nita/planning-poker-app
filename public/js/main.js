const chatElements = {
	chatForm: document.querySelector('#chat-form'),
	chatMessages: document.querySelector('.chat-messages'),
	chatUsers: document.querySelector('#users'),
	roomName: document.querySelector('#room-name')
}

//grab username and room from url
// using qs library cdn
const { username, room } = Qs.parse(location.search, {
	ignoreQueryPrefix: true
});

const socket = io();

//get room and users
socket.on('roomUsers', ({ room, users }) => {
	outputRoomName(room);
	outputUsers(users);
});

//join chat room, emit to server the user and room name
socket.emit('joinRoom', { username, room });

// Message from server
socket.on('message', message => {
	console.log(message);
	insertMessage(message);

	//scroll down
	chatElements.chatMessages.scrollTop = chatElements.chatMessages.scrollHeight;
});

//message submit
chatElements.chatForm.addEventListener('submit', (e) => {
	e.preventDefault();

	//get input from the dom form element
	const msgInput = e.target.elements.msg;
	const msg = msgInput.value;

	//send message to server
	socket.emit('chatMessage', msg);

	//clear message input after send
	msgInput.value = '';
	msgInput.focus();
});

function insertMessage(message) {
	const div = document.createElement('div');
	div.classList.add('message');
	div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
	<p class="text">
		${message.text}
	</p>`;
	chatElements.chatMessages.appendChild(div);
}

function outputRoomName(room) {
	chatElements.roomName.innerText = room;
}

function outputUsers(users) {
	chatElements.chatUsers.innerHTML = `
		${users.map(user => `<li>${user.username}</li>`).join('')}
	`;
}