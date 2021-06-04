#!/usr/bin/python3

# Nano Discord bot
from pathlib import Path
from discord.ext import commands
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

# Bot is ready
@bot.event
async def on_ready():
    # Log successful connection
    Common.log(f"{bot.user.name} connected")

# Command not found. Not a big deal, log it and ignore it.
@bot.event
async def on_command_error(ctx, error):
    print(f"{ctx.message.author} tried {ctx.invoked_with} Error: ", error)
    Common.log(f"{ctx.message.author} tried {ctx.invoked_with} Error: {error}")

# Add cogs
bot.add_cog(BlocksCog(bot))
bot.add_cog(AccountsCog(bot))
bot.add_cog(NodesCog(bot))
bot.add_cog(ServerCog(bot))
bot.add_cog(BotCog(bot))

# Run the bot
bot.run(DISCORD_TOKEN)