# Nano Discord bot

import sys
import asyncio
import json
import os
import discord
import requests
from dotenv import load_dotenv
from discord.ext import commands

# Nano node RPC document: https://docs.nano.org/commands/rpc-protocol/

''''
Current commands:
- Node Uptime
- Voting Weight
- Current Block
'''

# Load discord token from .env file
load_dotenv()
DISCORD_TOKEN = os.getenv('DISCORD_TOKEN')
DISCORD_GUILD = os.getenv('DISCORD_GUILD')
RPC_URL = os.getenv('RPC_URL')
timeout=2.5

bot = commands.Bot(command_prefix='.')

@bot.event
async def on_ready():
    print(f"Bot connected")

@bot.command(name='uptime', help="Displays node uptime")
async def uptime(ctx):
    r = requests.get(RPC_URL)
    content = json.loads(r.text)
    response = f"System uptime is {content['systemUptime']}"
    await ctx.send(response)

@bot.command(name='voting_weight', help="Displays voting weight")
async def voting_weight(ctx):
    r = requests.get(RPC_URL)
    content = json.loads(r.text)
    response = f"Voting weight is {content['votingWeight']}"
    await ctx.send(response)

@bot.command(name='current_block', help="Displays the current block")
async def block(ctx):
    r = requests.get(RPC_URL)
    content = json.loads(r.text)
    response = f"Current block is {content['currentBlock']}"
    await ctx.send(response)

bot.run(DISCORD_TOKEN)