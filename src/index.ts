import { HTTP_RPC } from '@vite/vitejs-http';
import { WS_RPC } from '@vite/vitejs-ws';
import { ViteAPI } from '@vite/vitejs';

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

// Maps command name => map of [ username => timestamp ]
const cooldowns = new Map(); 	// Map command name => cooldown for anti-spam
const DEFAULT_COOLDOWN : number = 1000; 	// Default cooldown period (1000 ms = 1s)

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
		input = input.replace(/@/g, '@\u200b');
		message.channel.send('I do not know what ' + input + ' means.');
		return;
	} 
	// Grab command by name
	var command = client.commands.get(input) || client.aliases.get(input); 
	// Check for cooldowns entry for this command, add it if doesn't exist yet
	if(!cooldowns.has(command.name)) {
		// Add to cooldowns map
		console.log("Adding new cooldown mapping for " + command.name);
		cooldowns.set(command.name, new Discord.Collection());
	}
	// Grab timestamps map for this command and compare against current time
	const currentTime : number = Date.now();
	const timestamps = cooldowns.get(command.name);
	console.log("Current time: " + currentTime + " Timestamps for " + command.name + " : " + [...timestamps.entries()]);
	const cooldownPeriod : number = (command.cooldown) || DEFAULT_COOLDOWN; // Get cooldown period (ms) for command, or 2000ms (2s) as default
	console.log(command.name + " has a cooldown period of " + cooldownPeriod);
	if(timestamps.has(message.author.id)) {
		const expireTime = timestamps.get(message.author.id) + cooldownPeriod;
		// Check if cooldown period has passed yet
		if(currentTime < expireTime) {
			// Tell user to wait a bit longer
			const timeLeft = (expireTime - currentTime) / 1000; 
			return message.reply(` please wait ${timeLeft.toFixed(2)} more seconds before using ${command.name}`);
		}
	}
	// Set timestamps[user] = now
	timestamps.set(message.author.id,currentTime);
	// After cooldownPeriod has elasped, delete timestamp for user
	setTimeout(() => timestamps.delete(message.author.id), cooldownPeriod);
	// Grab command and execute it
	try {
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