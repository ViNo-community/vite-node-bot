# Nano Discord bot
import asyncio
import json
import os
import discord
import requests
import logging
import datetime
from blocks import BlocksCog
from accounts import AccountsCog
from common import Common
from pathlib import Path
from discord.ext import commands

# Nano node RPC document: https://docs.nano.org/commands/rpc-protocol/

# Load discord token from .env file
common = Common()
DISCORD_TOKEN = common.get_discord_token()

# Initiate Discord bot
bot = commands.Bot(command_prefix='.')

# Bot is ready
@bot.event
async def on_ready():
    # Log successful connection
    Common.log(f"{bot.user.name} connected")

# TODO: Put into Node cog - address, version, uptime, server_uptime
####

@bot.command(name='address', aliases=['addr','node_address','nodeaddress'], help="Displays node address")
async def address(ctx):
    value = await Common.get_value(ctx,'nanoNodeAccount')
    response = f"Node address is {value}"
    await ctx.send(response)

@bot.command(name='version', aliases=['ver'], help="Displays node version")
async def version(ctx):
    value = await Common.get_value(ctx,'version')
    response = f"Node version is {value}"
    await ctx.send(response)

@bot.command(name='uptime', aliases=['up','nodeuptime','node_uptime'], help="Displays node uptime")
async def uptime(ctx):
    value = await Common.get_value(ctx,'nodeUptimeStartup')
    time = int(value)
    # Break down into days, hours, minutes, seconds
    day = time // (24 * 3600)
    time = time % (24 * 3600)
    hours = time // 3600
    time %= 3600
    minutes = time // 60
    time %= 60
    seconds = time
    response = f"Node uptime is {day} days, {hours} hours, {minutes} minutes, and {seconds} seconds"
    await ctx.send(response)

@bot.command(name='server_uptime', aliases=['serveruptime','sup'], help="Displays server uptime")
async def server_uptime(ctx):
    value = await Common.get_value(ctx,'systemUptime')
    response = f"Server uptime is {value}"
    await ctx.send(response)

@bot.command(name='server_load', aliases=['serverload','systemload','load'], help="Displays server load")
async def server_load(ctx):
    value = await Common.get_value(ctx,'systemLoad')
    response = f"Server load is {value}"
    await ctx.send(response)

#TODO: Double-check units for usedMem, totalMem values. Guessing it's MB. 
@bot.command(name='mem_usage', aliases=['memory_usage','memusage','memory','mem'], help="Displays memory usage")
async def mem_usage(ctx):
    usedMem = await Common.get_value(ctx,'usedMem')
    totalMem = await Common.get_value(ctx,'totalMem')
    percent = int(usedMem) / int(totalMem) * 100
    response = f"Memory usage is {usedMem} MB / {totalMem} MB : {percent:.2f}%"
    await ctx.send(response)

@bot.command(name='node_name', aliases=['nodename','hostname','host','name','node'], help="Displays node name")
async def node_name(ctx):
    value = await Common.get_value(ctx,'nanoNodeName')
    response = f"Node hostname is {value}"
    await ctx.send(response)
####

# Command not found. Not a big deal, log it and ignore it.
@bot.event
async def on_command_error(ctx, error):
    print(f"{ctx.message.author} tried {ctx.invoked_with} Error: ", error)
    Common.log(f"{ctx.message.author} tried {ctx.invoked_with} Error: {error}")

# Add cogs
bot.add_cog(BlocksCog(bot))
bot.add_cog(AccountsCog(bot))

# Run the bot
bot.run(DISCORD_TOKEN)