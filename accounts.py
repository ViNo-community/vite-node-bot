import discord
from discord.ext import commands
from common import Common

class AccountsCog(commands.Cog, name="Accounts"):

    def __init__(self, bot):
        self.bot = bot

    @commands.command(name='balance', aliases=['bal','show_balance'], help="Displays account balance")
    async def balance(self,ctx):
        value = await Common.get_value(ctx,'accBalanceMnano')
        response = f"Account balance is {value:.2f} nano"
        await ctx.send(response)

    @commands.command(name='representative', aliases=['rep','show_rep','show_representative'], help="Displays representative")
    async def representative(self,ctx):
        value = await Common.get_value(ctx,'repAccount')
        response = f"Representative: {value}"
        await ctx.send(response)

    @commands.command(name='num_peers', aliases=['numpeers','peers'], help="Displays number of peers")
    async def num_peers(self,ctx):
        value = await Common.get_value(ctx,'numPeers')
        response = f"{value} peers"
        await ctx.send(response)

    @commands.command(name='voting_weight', aliases=['votingweight','weight','voting'], help="Displays voting weight")
    async def voting_weight(self,ctx):
        value = await Common.get_value(ctx,'votingWeight')
        response = f"Voting weight is {value:.2f} nano"
        await ctx.send(response)

def setup(bot):
    bot.add_cog(AccountsCog(bot))