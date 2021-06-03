## Installation

Install the discord.py and dotenv Python packages with:

$ pip install discord.py
$ pip install dotenv

## Setup

Edit the .env. Add your DISCORD_TOKEN to the placeholder. 
Add the API url to RPC_URL.

## Run

To run the bot run $python nano_node_bot.py. For security reasons, do not run as root. It is recommended to create a new user specifically for running the bot. 

## Add as a service

If you want the bot to run as a permanent service, add to systemd.

## Commands

Type !help in the chat to see a list of available commands.

For example, to see the current voting weight of your node type

!voting_weight

