import discord
from discord.ext import commands
from common import Common

class ServerCog(commands.Cog, name="Server"):

    def __init__(self, bot):
        self.bot = bot

    @commands.command(name='server_uptime', aliases=['serveruptime','sup'], help="Displays server uptime")
    async def server_uptime(self,ctx):
        value = await Common.get_value(ctx,'systemUptime')
        response = f"Server uptime is {value}"
        await ctx.send(response)

    @commands.command(name='server_load', aliases=['serverload','systemload','load'], help="Displays server load")
    async def server_load(self,ctx):
        value = await Common.get_value(ctx,'systemLoad')
        response = f"Server load is {value}"
        await ctx.send(response)

    @commands.command(name='mem_usage', aliases=['memory_usage','memusage','memory','mem'], help="Displays memory usage")
    async def mem_usage(self,ctx):
        usedMem = await Common.get_value(ctx,'usedMem')
        totalMem = await Common.get_value(ctx,'totalMem')
        percent = int(usedMem) / int(totalMem) * 100
        response = f"Memory usage is {usedMem} MB / {totalMem} MB : {percent:.2f}%"
        await ctx.send(response)

    @commands.command(name='hostname', aliases=['host','name','node'], help="Displays host name")
    async def node_name(self,ctx):
        value = await Common.get_value(ctx,'nanoNodeName')
        response = f"Node hostname is {value}"
        await ctx.send(response)

def setup(bot):
    bot.add_cog(ServerCog(bot))