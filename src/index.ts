import { HTTP_RPC } from '@vite/vitejs-http';
import { WS_RPC } from '@vite/vitejs-ws';
import { ViteAPI } from '@vite/vitejs';

const url = require('url').Url;

const fs = require('fs');                   // Loads the Filesystem library
const Discord = require('discord.js');      // Loads the discord API library
const Config = require('../config.json');    // Loads the configuration values

const client = new Discord.Client(); // Initiates the client
client.botConfig = Config; // Stores the config inside the client object so it's auto injected wherever we use the client
client.botConfig.rootDir = __dirname; // Stores the running directory in the config so we don't have to traverse up directories.
const network = Config.network;
var viteNode : string = "";

// Check if MAINNET or TESTNET
if(network == "MAINNET") {
	console.log("Setting viteNode to MAINNET " + Config.mainNode);
	viteNode = Config.mainNode;
} else if(network == "TESTNET") {
	console.log("Setting viteNode to TESTNET " + Config.testNode);
	viteNode = Config.testNode;
} else {
	console.log("Invalid network specified: " + network + ". Please set network in config.json to either MAINNET or TESTNET");
	process.exit(0);
}
console.log("Using " + viteNode + " for " + network);

// Determine whether to set up HTTP or WS
var provider;
if(viteNode.startsWith("http")) {
	console.log("Loading " + client.botConfig.network + "  with http node " + viteNode);
	provider = new HTTP_RPC(viteNode);
} else if(viteNode.startsWith("ws")) {
	console.log("Loading " + client.botConfig.network + "  with ws node " + viteNode);
	provider = new WS_RPC(viteNode);
} else {
	console.log("Invalid protocol for node: " + viteNode + ". Please add https:// or wss://");
	process.exit(0);
}

// Set up ViteAPI
export var viteClient = new ViteAPI(provider, () => {
    console.log('Vite client successfully connected: ');
});

// Starts the bot and makes it begin listening to events.
client.on('ready', () => {
    // Log successful login
    console.log("Vite Node Bot Online as " + client.user.username + 
        " with prefix " + client.botConfig.prefix);
    let statusMessage = "say " + client.botConfig.prefix + "help | Online";
    // Set the client user's presence
    client.user.setPresence({ activity: { name: statusMessage}, status: "online" })
    .catch(console.error);
});

// Dynamically load commands from commands directory
client.commands = new Discord.Collection();
client.aliases = new Discord.Collection()
const commandFiles = fs.readdirSync('./dist/commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	// Grab command
	const command = require(`./commands/${file}`);
	const commandName = file.split(".")[0];
  console.log("Adding new command " + commandName + " from file \"" + file + "\"");
	client.commands.set(commandName, command);
	// Add aliases if there are any
	if (command.aliases) {
			console.log("Aliases found for " + command.name);
			command.aliases.forEach(alias => {
				console.log("Adding alias " + alias + " for " + command.name);
					client.aliases.set(alias, command);
			});
	};
}

// Dynamically run commands
client.on('message', message => {
	// Grab and watch for our prefix
	const prefix = client.botConfig.prefix;
	if (!message.content.startsWith(prefix) || message.author.bot) return;
	// Parse user input
	const args = message.content.slice(prefix.length).trim().split(/ +/);
	var input : string = args.shift().toLowerCase();
	// Check if it has this command
	if (!client.commands.has(input) && !client.aliases.has(input)) {
		// Command not found. Report an error and return
		console.error("Unknown command: " + input);
		// Strip out @ because Kaffin is a dumbass
		input = input.replace(/@/g, "_");
		message.channel.send('I do not know what ' + input + ' means.');
		return;
	} 
	// Grab command and execute it
	try {
		var command = client.commands.get(input) || client.aliases.get(input); 
		command.execute(message, args);
	} catch (error) {
		console.error(error);
		message.channel.send('There was an error trying to execute ' + command.name);
	}
});

// Log the bot in using the token provided in the config file
client.login(client.botConfig.token)
.catch((err) => {
    console.log(`Failed to authenticate with Discord network: "${err.message}"`)
});