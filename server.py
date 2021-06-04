import discord
from discord.ext import commands
from common import Common
from common import ERROR_MESSAGE

class ServerCog(commands.Cog, name="Server"):

    def __init__(self, bot):
        self.bot = bot

    @commands.command(name='server', help="Displays summary of server information")
    async def server(self,ctx):
        try:
            node_name = await Common.get_value(ctx,'nanoNodeName')
            server_load =  await Common.get_value(ctx,'systemLoad')
            usedMem = await Common.get_value(ctx,'usedMem')
            totalMem = await Common.get_value(ctx,'totalMem')
            percent = int(usedMem) / int(totalMem) * 100
            server_uptime = await Common.get_value(ctx,'systemUptime')
            node_uptime = await Common.get_value(ctx,'nodeUptimeStartup')
            # TODO: Put into own function
            # Turn seconds into days, hours, minutes, seconds
            time = int(node_uptime)
            # Break down into days, hours, minutes, seconds
            day = time // (24 * 3600)
            time = time % (24 * 3600)
            hours = time // 3600
            time %= 3600
            minutes = time // 60
            time %= 60
            seconds = time
            pretty_node_uptime = f"{day} days, {hours} hours, {minutes} minutes, and {seconds} seconds"
            response = (
                f"**Node Name:** {node_name}\n"
                f"**Server Load:** {server_load}\n"
                f"**Memory Usage:** {usedMem} MB / {totalMem} MB : {percent:.2f}%\n"
                f"**Server Uptime:** {server_uptime}\n"
                f"**Node Uptime:** {pretty_node_uptime}"
            )
            await ctx.send(response)
        except Exception as e:
            Common.logger.error("Exception occured processing request", exc_info=True)
            await ctx.send(ERROR_MESSAGE)    

    @commands.command(name='server_uptime', aliases=['serveruptime','sup'], help="Displays server uptime")
    async def server_uptime(self,ctx):
        try:
            value = await Common.get_value(ctx,'systemUptime')
            response = f"Server uptime is {value}"
            await ctx.send(response)
        except Exception as e:
            Common.logger.error("Exception occured processing request", exc_info=True)
            await ctx.send(ERROR_MESSAGE)     

    @commands.command(name='server_load', aliases=['serverload','systemload','load'], help="Displays server load")
    async def server_load(self,ctx):
        try:
            value = await Common.get_value(ctx,'systemLoad')
            response = f"Server load is {value}"
            await ctx.send(response)
        except Exception as e:
            Common.logger.error("Exception occured processing request", exc_info=True)
            await ctx.send(ERROR_MESSAGE)          

    @commands.command(name='mem_usage', aliases=['memory_usage','memusage','memory','mem'], help="Displays memory usage")
    async def mem_usage(self,ctx):
        try:
            usedMem = await Common.get_value(ctx,'usedMem')
            totalMem = await Common.get_value(ctx,'totalMem')
            percent = int(usedMem) / int(totalMem) * 100
            response = f"Memory usage is {usedMem} MB / {totalMem} MB : {percent:.2f}%"
            await ctx.send(response)
        except Exception as e:
            Common.logger.error("Exception occured processing request", exc_info=True)
            await ctx.send(ERROR_MESSAGE)     

    @commands.command(name='hostname', aliases=['host'], help="Displays host name")
    async def node_name(self,ctx):
        try:
            value = await Common.get_value(ctx,'nanoNodeName')
            response = f"Node hostname is {value}"
            await ctx.send(response)
        except Exception as e:
            Common.logger.error("Exception occured processing request", exc_info=True)
            await ctx.send(ERROR_MESSAGE)     

def setup(bot):
    bot.add_cog(ServerCog(bot))