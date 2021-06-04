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

# Load discord token from .env file
common = Common()
DISCORD_TOKEN = common.get_discord_token()
prefix = common.get_command_prefix()
print("Command prefix ", prefix)

# Initiate Discord bot
bot = commands.Bot(command_prefix=prefix)

# This is called when the bot has logged on and set everything up
@bot.event
async def on_ready():
    # Log successful connection
    Common.log(f"{bot.user.name} connected")
    #node_name = await Common.get_value(ctx,'nanoNodeName')
    await bot.change_presence(activity=discord.Activity(type=discord.ActivityType.watching, name='Nano Node'))

# Error. Log.
@bot.event
async def on_error(ctx, error):
    Common.log_error("Error: {error}")

# Command not found. Tell user command does not exist and then log it. 
@bot.event
async def on_command_error(ctx, error):
    Common.log_error(f"{ctx.message.author} tried unknown command {ctx.invoked_with} Error: {error}")
    await ctx.send(f"I do not know what {ctx.invoked_with} means")

@bot.event
async def on_disconnect():
    print("Bot disconnected")
    # Log successful connection
    Common.log_error(f"{bot.user.name} disconnected.")

# Add cogs
bot.add_cog(BlocksCog(bot))
bot.add_cog(AccountsCog(bot))
bot.add_cog(NodesCog(bot))
bot.add_cog(ServerCog(bot))
bot.add_cog(BotCog(bot))

# Run the bot
bot.run(DISCORD_TOKEN)