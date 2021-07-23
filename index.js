const fs = require('fs');                   // Loads the Filesystem library
const Discord = require('discord.js');      // Loads the discord API library
const Config = require('./config.json');    // Loads the configuration values
const { prefix, token } = require('./config.json');

const client = new Discord.Client(); // Initiates the client
client.botConfig = Config; // Stores the config inside the client object so it's auto injected wherever we use the client
client.botConfig.rootDir = __dirname; // Stores the running directory in the config so we don't have to traverse up directories.

const cooldowns = new Discord.Collection(); // Creates an empty list for storing timeouts so people can't spam with commands

// Starts the bot and makes it begin listening to events.
client.on('ready', () => {
    console.log('Vite Node Bot Online');
});

// Dynamically load commands from commands directory
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	// set a new item in the Collection
	// with the key as the command name and the value as the exported module
    console.log("Adding new command " + command.name);
	client.commands.set(command.name, command);
}
// Dynamically run commands
client.on('message', message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).trim().split(/ +/);
	const command = args.shift().toLowerCase();

	if (!client.commands.has(command)) return;

	try {
		client.commands.get(command).execute(message, args);
	} catch (error) {
		console.error(error);
		message.reply('there was an error trying to execute that command!');
	}
});

// Log the bot in using the token provided in the config file
client.login(client.botConfig.token).catch((err) => {
    console.log(`Failed to authenticate with Discord network: "${err.message}"`);
});