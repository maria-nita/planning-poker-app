const users = [];

function userJoin(id, username, room) {
	//create user
	const user = {
		id,
		username,
		room
	};
	//add to user array
	users.push(user);
	return user;
}

function getCurrentUser(id) {
	return users.find(user => user.id === id);
}

function userLeave(id) {
	const index = users.findIndex(user => user.id === id);

	if (index !== -1) {
		//remove user that has left from users array and return that user
		return users.splice(index, 1)[0];
	}
}

function getRoomUsers(room) {
	return users.filter(users => users.room === room);
}

module.exports = {
	userJoin,
	getCurrentUser,
	userLeave,
	getRoomUsers
}