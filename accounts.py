import discord
from discord.ext import commands
from common import Common
from common import ERROR_MESSAGE

class AccountsCog(commands.Cog, name="Accounts"):

    def __init__(self, bot):
        self.bot = bot

    @commands.command(name='account', aliases=['acc'], help="Displays summary of account information")
    async def account(self,ctx):
        try:
            account = await Common.get_value(ctx,'nanoNodeAccount')
            representative =  await Common.get_value(ctx,'repAccount')
            balance = await Common.get_value(ctx,'accBalanceMnano')
            pending = await Common.get_value(ctx,'accPendingMnano')
            voting_weight = await Common.get_value(ctx,'votingWeight')
            response = (
                f"**Account:** {account}\n"
                f"**Representative:** {representative}\n"
                f"**Balance:** {balance:.2f} nano\n"
                f"**Pending:**: {pending: .2f} nano\n"
                f"**Voting Weight**: {voting_weight: .2f} nano"
            )
            await ctx.send(response)
        except Exception as e:
            Common.logger.error("Exception occured processing request", exc_info=True)
            await ctx.send(ERROR_MESSAGE)      

    @commands.command(name='balance', aliases=['bal','show_balance'], help="Displays account balance")
    async def balance(self,ctx):
        try:
            value = await Common.get_value(ctx,'accBalanceMnano')
            response = f"Account balance is {value:.2f} nano"
            await ctx.send(response)
        except Exception as e:
            Common.logger.error("Exception occured processing request", exc_info=True)
            await ctx.send(ERROR_MESSAGE)      

    @commands.command(name='pending', aliases=['show_pending'], help="Displays account pending")
    async def pending(self,ctx):
        try:
            value = await Common.get_value(ctx,'accPendingMnano')
            response = f"Account pending is {value:.2f} nano"
            await ctx.send(response)
        except Exception as e:
            Common.logger.error("Exception occured processing request", exc_info=True)
            await ctx.send(ERROR_MESSAGE)     

    @commands.command(name='representative', aliases=['rep','show_rep','show_representative'], help="Displays representative")
    async def representative(self,ctx):
        try:
            value = await Common.get_value(ctx,'repAccount')
            response = f"Representative: {value}"
            await ctx.send(response)
        except Exception as e:
            Common.logger.error("Exception occured processing request", exc_info=True)
            await ctx.send(ERROR_MESSAGE)      

    @commands.command(name='voting_weight', aliases=['votingweight','weight','voting'], help="Displays voting weight")
    async def voting_weight(self,ctx):
        try:
            value = await Common.get_value(ctx,'votingWeight')
            response = f"Voting weight is {value:.2f} nano"
            await ctx.send(response)
        except Exception as e:
            Common.logger.error("Exception occured processing request", exc_info=True)
            await ctx.send(ERROR_MESSAGE)       

def setup(bot):
    bot.add_cog(AccountsCog(bot))