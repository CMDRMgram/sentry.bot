const Discord = require("discord.js");
const {requestInfo} = require('../../../socket/taskManager')
const { botIdent, hasSpecifiedRole, botLog } = require('../../../functions')
const config = require('../../../config.json')

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName('roles_req')
        .setDescription('Select player')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user you want to check roles on from multiple configured servers.')
                .setRequired(true)
        ),
    
    permissions: 0,
    async execute(interaction) {
        let approvalRanks = null
        let approvalRanks_string = null
        if (process.env.MODE != "PROD") {
            approvalRanks = config[botIdent().activeBot.botName].general_stuff.testServer.rolesRequestQuery_testServer
            approvalRanks_string = approvalRanks.map(rank => rank.rank_name).join(', ').replace(/,([^,]*)$/, ', or$1');
        }
        else {
            approvalRanks = config[botIdent().activeBot.botName].rolesRequestQuery
            approvalRanks_string = approvalRanks.map(rank => rank.rank_name).join(', ').replace(/,([^,]*)$/, ', or$1');
        }
        const member = interaction.member;
        if (hasSpecifiedRole(member, approvalRanks) == 0) {
            botLog(interaction.guild,new Discord.EmbedBuilder()
            .setDescription(`${interaction.member.displayName} does not have access. Requires ${approvalRanks_string}`)
            .setTitle(`/roles_req ${interaction.options.getSubcommand()}`)
            ,2
            )
            await interaction.editReply({ content: `You do not have the roles to add to the participation tracker. Contact ${approvalRanks_string}`, ephemeral: true });
            return
        }
        if (process.env.SOCKET_TOKEN) { 
            try {
                let embedChannel = null
                if (process.env.MODE != "PROD") {
                    embedChannel = config[botIdent().activeBot.botName].general_stuff.testServer.bot_approvals_chan
                    console.log("[CAUTION]".bgYellow, "rolesRequest embed channel required. Check config.json file. guardianai.general_stuff.bot_approvals_chan. Using testServer input if available")  
                }
                else {
                    embedChannel = config[botIdent().activeBot.botName].general_stuff.bot_approvals_chan
                }
                const { options } = interaction
                let person_asking = interaction.user.id
                const subject = options.getUser('user')
                const member = guild.members.cache.get(subject.id)
                let roles = member.roles.cache.map(role=>role.name)
                roles = roles.filter(x=>x != '@everyone')
                // commandChan: [interaction.channel.id],
                let rolePackage = { 
                    commandAsk: "roles_req",
                    commandChan: [embedChannel],
                    type: "roles_request",
                    user: subject, 
                    roles: roles,
                    person_asking: person_asking  
                }
                const data = await requestInfo(rolePackage)
                return interaction.reply({ content:`Checking roles of ${rolePackage.user} on other configured servers.`, ephemeral: true })
            }
            catch(e) {
                console.log(e)
            }
        }
        else {
            return interaction.reply({ content:`Socket Token not configured. Contact administrator.`, ephemeral: true })
        }
    } 
};