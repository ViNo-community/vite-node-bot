import os
from discord.errors import HTTPException
from dotenv import load_dotenv
import requests
import logging
import json
import datetime
from pathlib import Path

ERROR_MESSAGE = "Could not process request. Please check log files."

class Common():

    load_dotenv()
    discord_token= os.getenv('discord_token')
    rpc_url = os.getenv('rpc_url')
    client_id = os.getenv('client_id')
    command_prefix = os.getenv('command_prefix')
    logging_level = int(os.getenv('logging_level'))
    filename = datetime.datetime.now().strftime("%Y%m%d") + "_nano_node_bot.log"
    logdir = Path(__file__).resolve().parent / "logs" 
    # Make directory if it doesn't already exist
    if not os.path.exists(logdir):
        try:
            os.makedirs(logdir)
        except OSError as e:
            print(f"Error creating {logdir} :", e)
            exit()
    logfile = logdir / filename
    logging.basicConfig(filename=logfile, format='%(asctime)-10s - %(levelname)s - %(message)s', level=logging_level)
    logger = logging.getLogger(__name__)

    def __init__(self):
        pass

    def get_command_prefix(self):
        return self.command_prefix
        
    def get_discord_token(self):
        return self.discord_token

    def get_rpc_url(self):
        return self.rpc_url

    def get_client_id(self):
        return self.client_id

    # Helper function for changing seconds into nice formatted string of 
    # number of days, hours, minutes, and seconds
    @staticmethod
    def get_days_from_secs(secs):
        # Turn seconds into days, hours, minutes, seconds
        time = int(secs)
        # Break down into days, hours, minutes, seconds
        day = time // (24 * 3600)
        time = time % (24 * 3600)
        hours = time // 3600
        time %= 3600
        minutes = time // 60
        time %= 60
        seconds = time
        return f"{day} days, {hours} hours, {minutes} minutes, and {seconds} seconds"

    # Helper function for generic logging
    @staticmethod
    def log(msg):
        Common.logger.info(msg)

    @staticmethod
    def log_error(msg):
        Common.logger.error(msg)

    # Helper function for logging bot commands
    # <- {User} : {command}
    @staticmethod
    def logit(ctx):
        Common.logger.info(f"-> {ctx.message.author} : {ctx.command}")
        
    # Helper function for getting value from JSON response
    @staticmethod
    async def get_value(ctx, param):
        answer = ""
        try:
            # Log query
            Common.logit(ctx)
            # Grab response from RPC_URL
            r = requests.get(Common.rpc_url, timeout=2.50)
            if r.status_code == 200:
                # Parse JSON
                content = json.loads(r.text)
                # Grab value named param
                answer = content[param]
                # Log answer 
                Common.logger.info(f"<- {answer}")
            else:
                raise Exception("Could not connect to API")
        except Exception as ex:
            raise ex
        return answer
