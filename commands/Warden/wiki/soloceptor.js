const Discord = require("discord.js");

module.exports = {
    data: new Discord.SlashCommandBuilder()
	.setName('soloceptor')
	.setDescription('Where to duel interceptors'),
    // .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    permissions: 0,
    hidden: false,
    execute (interaction) {
        const returnEmbed = new Discord.EmbedBuilder()
		.setColor('#FF7100')
		.setTitle("**Solo Interceptor Hunting**")
		.setDescription(`The following are systems that we recommend for solo interceptor duels:`)
        .addFields(
		{name: "`Asterope`, `Merope`, and `Sterope II`", value: "Our go-to hunting grounds in the Pleiades Nebula. Has stations if you don't have a Fleet Carrier and are close to the Bubble. Sterope II is a recommended Hydra hunting ground.", inline: false},
		{name: "`Musca Dark Region HM-V c2-17`", value: "Coalsack Nebula. No station in-system or nearby, but contains high spawn density of higher-threat NHSSes if you have a Fleet Carrier to operate out of. Also has material traders within approximately ~30 LY's.", inline: false},
		{name: "`Pleiades Sector MI-S B4-0`", value: "Historically known as The Zoo, it used to be the only system where solo Hydras could be found; it is still a recommended Hydra hunting ground.", inline: false})

        const buttonRow = new Discord.ActionRowBuilder()
        .addComponents(new Discord.ButtonBuilder().setLabel('Learn more about Non-Human Signal Sources (NHSS)').setStyle(Discord.ButtonStyle.Link).setURL('https://wiki.antixenoinitiative.com/en/nhss'),)

        interaction.reply({ embeds: [returnEmbed.setTimestamp()], components: [buttonRow] });
    }
}
