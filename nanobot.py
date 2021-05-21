# Nano Discord bot

import sys
import asyncio
import websockets
import json
import os
import discord
from dotenv import load_dotenv

# Nano node RPC document: https://docs.nano.org/commands/rpc-protocol/

# Send RPC to node
def send(method, params): 
    print("Method: " + method + " Params: " + params)

# Get account balance information for given account
def account_balance(account):
    message = {
        "action": "account_balance",
        "account": account
    }
    return json.dumps(message)

# Get account info for given account
def account_info(account):
    message = {
        "action": "account_info",
        "account": account
    }
    return json.dumps(message)
    
def subscription():
    message = {
        'action': 'subscribe',
        'topic': 'confirmation',
        'ack': True
    } 
    return json.dumps(message)

async def connect(uri):
    async with websockets.connect(uri) as websocket:
        # Send acknowledgement
        await websocket.send(subscription())
        while True:
            answer = await websocket.recv()
            answer = json.loads(answer)
            print(answer)

chatbot = discord.Client()

@chatbot.event
async def on_ready():
  print('We have logged in as {0.user}'.format(chatbot))

@chatbot.event
async def on_message(message):
  if message.author == chatbot.user:
    return

  if message.content.startswith('$balance'):
    print("Get balance")
   # await message.channel.send(quote)

# Load environmental variables
load_dotenv()
discord_token = os.getenv('discord_token')
print(f"Discord token: {discord_token}")
# Grab uri from command line
uri = "wss://ws.mynano.ninja"
if(len(sys.argv) == 2):
    uri = sys.argv[1]

# Main bot loop
asyncio.get_event_loop().run_until_complete(connect(uri))