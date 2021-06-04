#!/usr/bin/python3

# Nano Discord bot
from pathlib import Path
from discord.ext import commands
import discord
import os
from dotenv import load_dotenv
import requests
import json
from blocks import BlocksCog
from accounts import AccountsCog
from nodes import NodesCog
from server import ServerCog
from bots import BotCog
from common import Common

class NanoNodeBot(commands.Bot):

    online = True
    discord_token = ""
    rpc_url = ""
    client_id = ""
    cmd_prefix = ""
    permission = 0

    def __init__(self):
        # Load discord token from .env file
        load_dotenv()
        self.discord_token= os.getenv('discord_token')
        self.rpc_url = os.getenv('api_url')
        self.client_id = os.getenv('client_id')
        self.cmd_prefix = os.getenv('command_prefix')
        self.permission = int(os.getenv('permission'))
        # Init set command prefix and description
        commands.Bot.__init__(self, command_prefix=self.cmd_prefix,description="Nano Node Bot")
        # Add plug-ins
        self.add_cog(BlocksCog(self))
        self.add_cog(AccountsCog(self))
        self.add_cog(NodesCog(self))
        self.add_cog(ServerCog(self))
        self.add_cog(BotCog(self))
        # Run bot
        self.run(self.discord_token)
    
    # This is called when the bot has logged on and set everything up
    async def on_ready(self):
        # Log successful connection
        print("Bot connected")
        Common.log(f"{bot.user.name} connected")
        # Toggle online. 
        self.set_online(True)
        self.bot.change_presence(activity=discord.Activity(type=discord.ActivityType.watching, name='Node Online'))
        #node_name = await self.bot.get_value('nanoNodeName')
        #print("Node Name: ")
        #value = await self.bot.get_value('repAccount')
        #await bot.change_presence(activity=discord.Activity(type=discord.ActivityType.watching, name='Nano Online'))

    # This is called when the bot sees an unknown command
    async def on_command_error(self, ctx, error):
        Common.log_error(f"{ctx.message.author} tried unknown command {ctx.invoked_with} Error: {error}")
        await ctx.send(f"I do not know what {ctx.invoked_with} means.")

    # This is called when the bot has an error
    async def on_error(self, ctx, error):
        print("Bot encountered error: ", error)
        Common.log_error("Error: {error}")

    # This is called when the bot disconnects
    async def on_disconnect(self):
        print("Bot disconnected")
        # Log successful connection
        Common.log_error(f"{bot.user.name} disconnected.")

    # Helper function for getting value from response
    async def get_value(self, param):
        answer = ""
        try:
            # Grab response from API_URL
            r = requests.get(self.get_api_url(), timeout=2.50)
            if r.status_code == 200:
                # Parse JSON
                content = json.loads(r.text)
                # Grab value named param
                answer = content[param]
                # Log answer 
                Common.logger.info(f"<- {answer}")
            else:
                raise Exception("Could not connect to API")
        except Exception as ex:
            raise ex
        return answer
    
    # Get online status of node
    async def get_online(self):
        return self.online

    # Set online status of node
    async def set_online(self, param):
        self.online = param

    def get_api_url(self):
        return self.rpc_url

    def get_client_id(self):
        return self.client_id

    def get_permission_int(self):
        return self.permission

    def get_discord_token(self):
        return self.discord_token

# Initiate Discord bot
bot = NanoNodeBot()