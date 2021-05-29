import os
from dotenv import load_dotenv

class Config():

    discord_token=""
    rpc_url=""

    def __init__(self):
        # Load discord token from .env file
        load_dotenv()
        self.discord_token= os.getenv('DISCORD_TOKEN')
        self.rpc_url = os.getenv('RPC_URL')

    def get_discord_token(self):
        return self.discord_token

    def get_rpc_url(self):
        return self.rpc_url