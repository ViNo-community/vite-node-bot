import discord
from discord.ext import commands
from common import Common

class BlocksCog(commands.Cog):

    def __init__(self, bot):
        self.bot = bot

    @commands.command(name='current_block', aliases=['currentblock','cur','current'], help="Displays the current block")
    async def current_block(self,ctx):
        value = await Common.get_value(ctx,'currentBlock')
        response = f"Current block is {value}"
        await ctx.send(response)

    @commands.command(name='cemented_blocks', aliases=['cementedblocks','cemented','cem'], help="Displays the cemented block count")
    async def cemented_blocks(self,ctx):
        value = await Common.get_value(ctx,'cementedBlocks')
        response = f"Cemented block count is {value}"
        await ctx.send(response)

    @commands.command(name='unchecked_blocks', aliases=['uncheckedblocks','unchecked'], help="Displays the number of unchecked blocks")
    async def unchecked_blocks(self,ctx):
        value = await Common.get_value(ctx,'uncheckedBlocks')
        response = f"{value} unchecked blocks"
        await ctx.send(response)

    @commands.command(name='sync', aliases=['blocksync','block_sync','bsync'], help="Displays block sync")
    async def block_sync(self,ctx):
        value = await Common.get_value(ctx,'blockSync')
        response = f"Block sync is {value}%"
        await ctx.send(response)

# The setup fucntion below is neccesarry. Remember we give bot.add_cog() the name of the class in this case MembersCog.
# When we load the cog, we use the name of the file.
def setup(bot):
    bot.add_cog(BlocksCog(bot))