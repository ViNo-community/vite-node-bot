# Nano Discord bot

import asyncio
import websockets
import json

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

async def connect():
    uri = "wss://ws.mynano.ninja"
    async with websockets.connect(uri) as websocket:
        # Send acknowledgement
        await websocket.send(subscription())
        while True:
            answer = await websocket.recv()
            answer = json.loads(answer)
            print(answer)

# Main bot loop
asyncio.get_event_loop().run_until_complete(connect())