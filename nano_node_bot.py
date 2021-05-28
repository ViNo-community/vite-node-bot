# Nano Discord bot

import asyncio
import json
import os
import discord
import requests
import logging
import datetime
from pathlib import Path
from dotenv import load_dotenv
from discord.ext import commands

# Nano node RPC document: https://docs.nano.org/commands/rpc-protocol/

# Set up logging
filename = datetime.datetime.now().strftime("%Y%m%d%H%M%S") + "_nano_node_bot.log"
logfile = Path(__file__).resolve().parent / "logs" / filename
logging.basicConfig(filename=logfile, format='%(asctime)-10s - %(levelname)s - %(message)s', level=logging.INFO)

# Load discord token from .env file
load_dotenv()
DISCORD_TOKEN = os.getenv('DISCORD_TOKEN')
DISCORD_GUILD = os.getenv('DISCORD_GUILD')
RPC_URL = os.getenv('RPC_URL')

# Initiate Discord bot
bot = commands.Bot(command_prefix='.')

# Bot is ready
@bot.event
async def on_ready():
    logging.info("Bot connected")
    print(f"Bot connected. Log file:", logfile)

# Helper function for getting value from JSON response
async def get_value(param):
    answer = ""
    try:
        # Log query
        logging.info(f"Request for: {param}")
        # Grab response from RPC_URL
        r = requests.get(RPC_URL, timeout=2.50)
        # Parse JSON
        content = json.loads(r.text)
        # Grab value named param
        answer = content[param]
        # Log answer
        logging.info(f"Answer: {answer}")
    except Exception as ex:
        # Log exception with stack trace
        logging.error("Exception occured", exc_info=True)
    return answer

@bot.command(name='version', help="Displays node version")
async def version(ctx):
    value = await get_value('version')
    response = f"Node version is {value}"
    await ctx.send(response)

@bot.command(name='uptime', help="Displays node uptime")
async def uptime(ctx):
    value = await get_value('nodeUptimeStartup')
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

@bot.command(name='server_uptime', help="Displays server uptime")
async def server_uptime(ctx):
    value = await get_value('systemUptime')
    response = f"Server uptime is {value}"
    await ctx.send(response)

@bot.command(name='voting_weight', help="Displays voting weight")
async def voting_weight(ctx):
    value = await get_value('votingWeight')
    response = f"Voting weight is {value:.2f} nano"
    await ctx.send(response)

@bot.command(name='current_block', help="Displays the current block")
async def current_block(ctx):
    value = await get_value('currentBlock')
    response = f"Current block is {value}"
    await ctx.send(response)

@bot.command(name='cemented_blocks', help="Displays the cemented block count")
async def cemented_blocks(ctx):
    value = await get_value('cementedBlocks')
    response = f"Cemented block count is {value}"
    await ctx.send(response)

@bot.command(name='sync', help="Displays block sync")
async def block_sync(ctx):
    value = await get_value('blockSync')
    response = f"Block sync is {value}%"
    await ctx.send(response)

bot.run(DISCORD_TOKEN)