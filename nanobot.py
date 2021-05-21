# Nano Discord bot

import asyncio
import websockets
import json

async def connect():
    uri = "wss://ws.mynano.ninja"
    async with websockets.connect(uri) as websocket:
        params = {
            'action': 'subscribe',
            'topic': 'confirmation',
            'ack': True
        }

        await websocket.send(json.dumps(params))
        while True:
            answer = await websocket.recv()
            answer = json.loads(answer)
            print(answer)

# Main bot loop
asyncio.get_event_loop().run_until_complete(connect())