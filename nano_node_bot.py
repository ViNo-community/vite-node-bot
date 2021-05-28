# Nano Discord bot

import sys
import asyncio
import json
import os
import discord
import requests
import logging
from pathlib import Path
from dotenv import load_dotenv
from discord.ext import commands

# Nano node RPC document: https://docs.nano.org/commands/rpc-protocol/

# Load discord token from .env file
load_dotenv()
DISCORD_TOKEN = os.getenv('DISCORD_TOKEN')
DISCORD_GUILD = os.getenv('DISCORD_GUILD')
RPC_URL = os.getenv('RPC_URL')

# Initiate Discord bot
bot = commands.Bot(command_prefix='.')

# Set up logging
logfile = Path(__file__).resolve().parent / "nano_node_bot.log"
logging.basicConfig(filename=logfile, format='%(name)s - %(asctime)s - %(levelname)s - %(message)s')

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

@bot.event
async def on_ready():
    logging.info("Bot connected")
    print(f"Bot connected. Log file: ", logfile)

@bot.command(name='version', help="Displays node version")
async def version(ctx):
    r = requests.get(RPC_URL)
    content = json.loads(r.text)
    response = f"Node version is {content['version']}"
    # response = await get_value('version')
    await ctx.send(response)

@bot.command(name='uptime', help="Displays node uptime")
async def uptime(ctx):
    r = requests.get(RPC_URL)
    content = json.loads(r.text)
    time = int(content['nodeUptimeStartup'])
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
    r = requests.get(RPC_URL)
    content = json.loads(r.text)
    response = f"System uptime is {content['systemUptime']}"
    # response = await get_value('systemUptime')
    await ctx.send(response)

@bot.command(name='voting_weight', help="Displays voting weight")
async def voting_weight(ctx):
    r = requests.get(RPC_URL)
    content = json.loads(r.text)
    response = f"Voting weight is {content['votingWeight']}"
    await ctx.send(response)

@bot.command(name='current_block', help="Displays the current block")
async def current_block(ctx):
    r = requests.get(RPC_URL)
    content = json.loads(r.text)
    response = f"Current block is {content['currentBlock']}"
    await ctx.send(response)

@bot.command(name='cemented_blocks', help="Displays the cemented block count")
async def cemented_blocks(ctx):
    r = requests.get(RPC_URL)
    content = json.loads(r.text)
    response = f"Cemented blocks is {content['cementedBlocks']}"
    await ctx.send(response)

@bot.command(name='sync', help="Displays block sync")
async def block_sync(ctx):
    r = requests.get(RPC_URL)
    content = json.loads(r.text)
    response = f"Block sync is {content['blockSync']}%"
    await ctx.send(response)

bot.run(DISCORD_TOKEN)