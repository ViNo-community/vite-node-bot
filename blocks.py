import discord
from discord.ext import commands
from common import Common
from common import ERROR_MESSAGE

class BlocksCog(commands.Cog, name="Blocks"):

    def __init__(self, bot):
        self.bot = bot

    @commands.command(name='current_block', aliases=['currentblock','cur','current'], help="Displays the current block")
    async def current_block(self,ctx):
        try:
            value = await Common.get_value(ctx,'currentBlock')
            response = f"Current block is {value}"
            await ctx.send(response)
        except Exception as e:
            Common.logger.error("Exception occured processing request", exc_info=True)
            await ctx.send(ERROR_MESSAGE)     

    @commands.command(name='cemented_blocks', aliases=['cementedblocks','cemented','cem'], help="Displays the cemented block count")
    async def cemented_blocks(self,ctx):
        try:
            value = await Common.get_value(ctx,'cementedBlocks')
            response = f"Cemented block count is {value}"
            await ctx.send(response)
        except Exception as e:
            Common.logger.error("Exception occured processing request", exc_info=True)
            await ctx.send(ERROR_MESSAGE)  

    @commands.command(name='unchecked_blocks', aliases=['uncheckedblocks','unchecked'], help="Displays the number of unchecked blocks")
    async def unchecked_blocks(self,ctx):
        try:
            value = await Common.get_value(ctx,'uncheckedBlocks')
            response = f"{value} unchecked blocks"
            await ctx.send(response)
        except Exception as e:
            Common.logger.error("Exception occured processing request", exc_info=True)
            await ctx.send(ERROR_MESSAGE)  

    @commands.command(name='sync', aliases=['blocksync','block_sync','bsync'], help="Displays block sync")
    async def block_sync(self,ctx):
        try:
            value = await Common.get_value(ctx,'blockSync')
            response = f"Block sync is {value}%"
            await ctx.send(response)
        except Exception as e:
            Common.logger.error("Exception occured processing request", exc_info=True)
            await ctx.send(ERROR_MESSAGE)  

# The setup fucntion below is neccesarry. Remember we give bot.add_cog() the name of the class
# When we load the cog, we use the name of the file.
def setup(bot):
    bot.add_cog(BlocksCog(bot))