import discord
from discord.ext import commands
from common import Common
from common import ERROR_MESSAGE

class BotCog(commands.Cog, name="Bot"):

    def __init__(self, bot):
        self.bot = bot

    @commands.command(name='invite', help="Displays invite link")
    async def invite(self,ctx):
        try:
            client_id = "850047861315469362"
            # Permission integer - calculate on https://discord.com/developers/applications/ page
            # Send Messages & Embed Links & Attach Files & Read Message History & Mention Everybody & Add Reactions
            permissions = 247872
            response = f"Open a browser and go to https://discord.com/oauth2/authorize?client_id={client_id}&permissions={permissions}&scope=bot"
            await ctx.send(response)
        except Exception as e:
            Common.logger.error("Exception occured processing request", exc_info=True)
            await ctx.send(ERROR_MESSAGE)    

    @commands.command(name='set_prefix', help="Set bot prefix")
    async def set_prefix(self,ctx,new_prefix):
        try:
            print("Set new command prefix: ",new_prefix)
            self.bot.command_prefix = new_prefix
            await ctx.send(f"Set new command prefix to \"{new_prefix}\"")
        except Exception as e:
            Common.logger.error("Exception occured processing request", exc_info=True)
            await ctx.send(ERROR_MESSAGE)  

    @commands.command(name='set_logging', help="Set logging level")
    async def set_logging(self,ctx,new_level):
        try:
            new_logging_level = int(new_level)
            print("Set new logging level: ", new_logging_level)
            Common.logger.setLevel(new_logging_level)
            await ctx.send(f"Set logging level to {new_logging_level}")
        except Exception as e:
            Common.logger.error("Exception occured processing request", exc_info=True)
            await ctx.send(ERROR_MESSAGE)  

def setup(bot):
    bot.add_cog(BotCog(bot))