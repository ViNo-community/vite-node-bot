module.exports = {
	name: 'ping',
	description: 'Ping the bot [This will be removed soon]',
	execute(message, args) {
		message.channel.send('Pong.');
	},
};