#!/usr/bin/python3

# Nano Discord bot
from pathlib import Path
from discord.ext import commands
import discord
from blocks import BlocksCog
from accounts import AccountsCog
from nodes import NodesCog
from server import ServerCog
from bots import BotCog
from common import Common

# Nano node RPC document: https://docs.nano.org/commands/rpc-protocol/
common = Common()
DISCORD_TOKEN = common.get_discord_token()

class NanoNodeBot(commands.Bot):

    def __init__(self):
        # Load discord token from .env file
        common = Common()
        DISCORD_TOKEN = common.get_discord_token()
        prefix = common.get_command_prefix()
        print("Command prefix ", prefix)
        commands.Bot.__init__(self, command_prefix=prefix,description="Nano Node Bot")
        # Add cogs
        self.add_cog(BlocksCog(self))
        self.add_cog(AccountsCog(self))
        self.add_cog(NodesCog(self))
        self.add_cog(ServerCog(self))
        self.add_cog(BotCog(self))
    
    # This is called when the bot has logged on and set everything up
    async def on_ready(self):
        # Log successful connection
        print("Bot connected")
        Common.log(f"{bot.user.name} connected")
        #node_name = await Common.get_value(ctx,'nanoNodeName')
        await bot.change_presence(activity=discord.Activity(type=discord.ActivityType.watching, name='Nano Node'))

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

# Initiate Discord bot
bot = NanoNodeBot()



# Run the bot
bot.run(DISCORD_TOKEN)