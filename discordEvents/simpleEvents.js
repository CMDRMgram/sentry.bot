const { botLog, botIdent, getRankEmoji, hasSpecifiedRole } = require('../functions')
const Discord = require('discord.js')

const database = require(`../${botIdent().activeBot.botName}/db/database`)
const config = require('../config.json')

let leadership_embedChannel = null
let requestor_embedChannel = null
let generalstaff = null
let colonel = null
let major = null
let captain = null
let knowledge_proficiency = []
let graderRank = []
let saveBulkMessages
let removeBulkMessages
let promoter_rank
let final_comments_required = 2
let allRanks = null
if (botIdent().activeBot.botName == "GuardianAI") {
    ({ saveBulkMessages, removeBulkMessages } = require('../commands/GuardianAI/promotionRequest/prFunctions'))
    if (process.env.MODE != "PROD") {
        console.log("[CAUTION]".bgYellow, "knowledge proficiency embed channel required. Check config.json file. guardianai.general_stuff.knowledge_proficiency. Using testServer input if available")
        leadership_embedChannel = config[botIdent().activeBot.botName].general_stuff.testServer.knowledge_proficiency.leadership_embedChannel
        requestor_embedChannel = config[botIdent().activeBot.botName].general_stuff.testServer.knowledge_proficiency.requestor_embedChannel
        knowledge_proficiency = Object.values(config[botIdent().activeBot.botName].general_stuff.testServer.knowledge_proficiency).map(i=>i)
        generalstaff = config[botIdent().activeBot.botName].general_stuff.testServer.allRanks_testServer.find(r=>r.rank_name === 'General Staff').id
        colonel = config[botIdent().activeBot.botName].general_stuff.testServer.allRanks_testServer.find(r=>r.rank_name === 'Colonel').id
        major = config[botIdent().activeBot.botName].general_stuff.testServer.allRanks_testServer.find(r=>r.rank_name === 'Major').id
        captain = config[botIdent().activeBot.botName].general_stuff.testServer.allRanks_testServer.find(r=>r.rank_name === 'Captain').id
        graderRank.push({"General Staff":generalstaff,"Colonel":colonel,"Major":major,"Captain":captain})
        final_comments_required = config[botIdent().activeBot.botName].general_stuff.testServer.knowledge_proficiency.final_comments_required
        promoter_rank = config[botIdent().activeBot.botName].general_stuff.testServer.knowledge_proficiency.promoter_rank
        allRanks = config[botIdent().activeBot.botName].general_stuff.testServer.allRanks_testServer.map(i => i.rank_name)
    }
    else { 
        leadership_embedChannel = config[botIdent().activeBot.botName].general_stuff.knowledge_proficiency.leadership_embedChannel
        requestor_embedChannel = config[botIdent().activeBot.botName].general_stuff.knowledge_proficiency.requestor_embedChannel
        knowledge_proficiency = Object.values(config[botIdent().activeBot.botName].general_stuff.knowledge_proficiency).map(i=>i)
        generalstaff = config[botIdent().activeBot.botName].general_stuff.allRanks.find(r=>r.rank_name === 'General Staff').id
        colonel = config[botIdent().activeBot.botName].general_stuff.allRanks.find(r=>r.rank_name === 'Colonel').id
        major = config[botIdent().activeBot.botName].general_stuff.allRanks.find(r=>r.rank_name === 'Major').id
        captain = config[botIdent().activeBot.botName].general_stuff.allRanks.find(r=>r.rank_name === 'Captain').id
        graderRank.push({"General Staff":generalstaff,"Colonel":colonel,"Major":major,"Captain":captain})
        final_comments_required = config[botIdent().activeBot.botName].general_stuff.knowledge_proficiency.final_comments_required
        promoter_rank = config[botIdent().activeBot.botName].general_stuff.knowledge_proficiency.promoter_rank
        allRanks = config[botIdent().activeBot.botName].general_stuff.allRanks.map(i => i.rank_name)
    }
}


const exp = {
    [Discord.Events.MessageReactionAdd]: async (reaction, user) => {
        if (user.bot) return
        if (botIdent().activeBot.botName == "GuardianAI" && reaction.emoji.name === '📌') {
            const member = await guild.members.fetch(user.id)
            const rank_types = {
                opord_thread: () => { 
                    if (process.env.MODE != "PROD") { 
                        // console.log("[CAUTION]".bgYellow, "Check config.json file. guardianai.general_stuff.reaction.opord_thread_parentId. Using testServer input if available")
                        return config[botIdent().activeBot.botName].general_stuff.testServer.reactions.opord_thread_parentId } 
                    else { return config[botIdent().activeBot.botName].general_stuff.reactions.opord_thread_parentId }
                },
                captain: () => { 
                    if (process.env.MODE != "PROD") { 
                        console.log("[CAUTION]".bgYellow, "Check config.json file. guardianai.general_stuff.reaction.pin_reaction_authorization_captain. Using testServer input if available")
                        return config[botIdent().activeBot.botName].general_stuff.testServer.reactions.pin_reaction_authorization_captain.map(i => i.rank_name) } 
                    else { return config[botIdent().activeBot.botName].general_stuff.reactions.pin_reaction_authorization_captain.map(i => i.rank_name) }
                },
                higher: () => { 
                    if (process.env.MODE != "PROD") { 
                        console.log("[CAUTION]".bgYellow, "Check config.json file. guardianai.general_stuff.reaction.pin_reaction_authorization_higher. Using testServer input if available")
                        return config[botIdent().activeBot.botName].general_stuff.testServer.reactions.pin_reaction_authorization_higher.map(i => i.rank_name) } 
                    else { return config[botIdent().activeBot.botName].general_stuff.reactions.pin_reaction_authorization_higher.map(i => i.rank_name) }
                },
                captain_approved: 0,
                higher_approved: 0
            }
            let roles = member.roles.cache.map(role=>role.name)
            roles = roles.filter(x=>x != '@everyone')
            rank_types.captain_approved = rank_types.captain().some(r => roles.includes(r))
            rank_types.higher_approved = rank_types.higher().some(r => roles.includes(r))
            if (rank_types.captain_approved) {
                if (rank_types.opord_thread().includes(reaction.message.channel.parentId)) {
                    try {
                        await reaction.message.pin()
                        botLog(guild,new Discord.EmbedBuilder()
                            .setDescription(`<@${user.id}> Pinned Message ${reaction.message.url}`)
                            .setTitle(`REACTION: PIN MESSAGE`)
                            ,1
                            ,'info'
                        )
                    } 
                    catch (err) {
                        console.log(err)
                        botLog(interaction.guild,new Discord.EmbedBuilder()
                            .setDescription('```' + err.stack + '```')
                            .setTitle(`⛔ Fatal error experienced`)
                            ,2
                            ,'error'
                        )   
                    }
                }
            }
            if (rank_types.higher_approved) {
                try {
                    await reaction.message.pin()
                    botLog(guild,new Discord.EmbedBuilder()
                        .setDescription(`<@${user.id}> Pinned Message ${reaction.message.url}`)
                        .setTitle(`REACTION: PIN MESSAGE`)
                        ,1
                        ,'info'
                    )
                } 
                catch (err) {
                    console.log(err)
                    botLog(interaction.guild,new Discord.EmbedBuilder()
                        .setDescription('```' + err.stack + '```')
                        .setTitle(`⛔ Fatal error experienced`)
                        ,2
                        ,'error'
                    )   
                }
            }
        }
    },
    [Discord.Events.MessageReactionRemove]: async (reaction,user) => {
        if (user.bot) return
        if (botIdent().activeBot.botName == "GuardianAI" && reaction.emoji.name === '📌') {
            const member = await guild.members.fetch(user.id)
            const rank_types = {
                opord_thread: () => { 
                    if (process.env.MODE != "PROD") { 
                        // console.log("[CAUTION]".bgYellow, "Check config.json file. guardianai.general_stuff.reaction.opord_thread_parentId. Using testServer input if available")
                        return config[botIdent().activeBot.botName].general_stuff.testServer.reactions.opord_thread_parentId } 
                    else { return config[botIdent().activeBot.botName].general_stuff.reactions.opord_thread_parentId }
                },
                captain: () => { 
                    if (process.env.MODE != "PROD") { 
                        console.log("[CAUTION]".bgYellow, "Check config.json file. guardianai.general_stuff.reaction.pin_reaction_authorization_captain. Using testServer input if available")
                        return config[botIdent().activeBot.botName].general_stuff.testServer.reactions.pin_reaction_authorization_captain.map(i => i.rank_name) } 
                    else { return config[botIdent().activeBot.botName].general_stuff.reactions.pin_reaction_authorization_captain.map(i => i.rank_name) }
                },
                higher: () => { 
                    if (process.env.MODE != "PROD") { 
                        console.log("[CAUTION]".bgYellow, "Check config.json file. guardianai.general_stuff.reaction.pin_reaction_authorization_higher. Using testServer input if available")
                        return config[botIdent().activeBot.botName].general_stuff.testServer.reactions.pin_reaction_authorization_higher.map(i => i.rank_name) } 
                    else { return config[botIdent().activeBot.botName].general_stuff.reactions.pin_reaction_authorization_higher.map(i => i.rank_name) }
                },
                captain_approved: 0,
                higher_approved: 0
            }
            let roles = member.roles.cache.map(role=>role.name)
            roles = roles.filter(x=>x != '@everyone')
            rank_types.captain_approved = rank_types.captain().some(r => roles.includes(r))
            rank_types.higher_approved = rank_types.higher().some(r => roles.includes(r))

            if (rank_types.captain_approved) {
                if (rank_types.opord_thread().includes(reaction.message.channel.parentId)) {
                    try {
                        await reaction.message.unpin()
                        botLog(guild,new Discord.EmbedBuilder()
                            .setDescription(`<@${user.id}> Un-Pinned Message ${reaction.message.url}`)
                            .setTitle(`REACTION: UN-PIN MESSAGE`)
                            ,1
                            ,'info'
                        )
                    } 
                    catch (err) {
                        console.log(err)
                        botLog(interaction.guild,new Discord.EmbedBuilder()
                            .setDescription('```' + err.stack + '```')
                            .setTitle(`⛔ Fatal error experienced`)
                            ,2
                            ,'error'
                        )   
                    }
                }
            }
            if (rank_types.higher_approved) {
                try {
                    await reaction.message.unpin()
                    botLog(guild,new Discord.EmbedBuilder()
                        .setDescription(`<@${user.id}> Un-Pinned Message ${reaction.message.url}`)
                        .setTitle(`REACTION: UN-PIN MESSAGE`)
                        ,1
                        ,'info'
                    )
                } 
                catch (err) {
                    console.log(err)
                    botLog(interaction.guild,new Discord.EmbedBuilder()
                        .setDescription('```' + err.stack + '```')
                        .setTitle(`⛔ Fatal error experienced`)
                        ,2
                        ,'error'
                    )   
                }
            }
        }
    },
    guildMemberAdd: async (interaction, bot) => {
        if (process.env.MODE == 'testServer') {
             // The role IDs or names you want to assign
            const rolesToAssign = ['test person', 'Learner']; // Replace with the actual role IDs or names

            // Try to fetch both roles
            const roles = rolesToAssign.map(roleNameOrId => 
                member.guild.roles.cache.find(r => r.id === roleNameOrId || r.name === roleNameOrId)
            ).filter(role => role); // Filter out any roles that are not found

            if (roles.length > 0) {
                try {
                    // Add the roles to the new member
                    await member.roles.add(roles);
                    console.log(`Roles [${roles.map(role => role.name).join(', ')}] assigned to ${member.user.tag}`);
                } catch (error) {
                    console.error(`Failed to assign roles: ${error}`);
                }
            } else {
                console.error(`Roles not found: ${rolesToAssign}`);
            }
        }
    },
    messageCreate: async (message, bot) => {
        if (botIdent().activeBot.botName == 'GuardianAI' && !message.author.bot) {
            let messageParent = message.channel.parentId
            if (messageParent == requestor_embedChannel || messageParent == leadership_embedChannel) {
                // const embedChannelObj = await message.guild.channels.fetch(applyForRanks_guardianai)
                if (message.channel.name.includes("Submission")) {
                    // console.log("submitting")
                    // .setColor('#87FF2A') //bight green
                    // .setColor('#f20505') //bight red
                    // .setColor('#f2ff00') //bight yellow
                    let bulkMessages = []
                    try {
                        const values = [message.author.id]
                        const sql = 'SELECT * FROM `promotion` WHERE userId = (?)'
                        const response = await database.query(sql,values)
                        if (response.length == 0 && !message.author.bot) { message.delete(); return; }
                        const leadership_thread = await message.guild.channels.fetch(response[0].leadership_threadId)
                        if (leadership_thread.id == message.channel.id) {
                            //If chat is discovered in the leadership thread, abandon this script.
                            return
                        }
                        //For Role submission
                        if (response[0].axi_rolesCheck == -2) {
                            removeBulkMessages(response[0].userId, message)
                            // const leadership_thread = await message.guild.channels.fetch(response[0].leadership_threadId)
                            // if (leadership_thread.id == message.channel.id) {
                            //     //If chat is discovered in the leadership thread, abandon this script.
                            //     return
                            // }
                            const leadership_challenge = await leadership_thread.messages.fetch(response[0].leadership_roleEmbedId)
                            const leadership_embed = leadership_challenge.embeds[0]
                            const leadership_oldEmbedSchema = {
                                title: leadership_embed.title,
                                author: { name: message.author.displayName, iconURL: message.author.displayAvatarURL({ dynamic: true }) },
                                description: leadership_embed.description,
                                color: leadership_embed.color,
                                fields: leadership_embed.fields
                            }
                            const requestor_thread = await message.guild.channels.cache.get(response[0].requestor_threadId)
                            const requestor_challenge = await requestor_thread.messages.fetch(response[0].requestor_roleEmbedId)
                            const requestor_embed = requestor_challenge.embeds[0]
                            const requestor_oldEmbedSchema = {
                                title: requestor_embed.title,
                                author: { name: message.author.displayName, iconURL: message.author.displayAvatarURL({ dynamic: true }) },
                                description: requestor_embed.description,
                                color: requestor_embed.color,
                                fields: requestor_embed.fields
                            }

                            const leadership_newEmbed = new Discord.EmbedBuilder()
                                .setTitle(leadership_oldEmbedSchema.title)
                                .setDescription(`Anti Xeno Initiative Progression Challenge`)
                                // .setColor('#87FF2A') //bight green
                                    // .setColor('#f20505') //bight red
                                    .setColor('#f2ff00') //bight yellow
                                .setAuthor(leadership_oldEmbedSchema.author)
                                .setThumbnail(botIdent().activeBot.icon)
                            leadership_oldEmbedSchema.fields.forEach((i,index) => {
                                if (index < 3) { leadership_newEmbed.addFields({name: i.name, value: i.value, inline: i.inline }) }
                            })
                            const requestor_newEmbed = new Discord.EmbedBuilder()
                                .setTitle(requestor_oldEmbedSchema.title)
                                .setDescription(`Anti Xeno Initiative Progression Challenge`)
                                // .setColor('#87FF2A') //bight green
                                    // .setColor('#f20505') //bight red
                                    .setColor('#f2ff00') //bight yellow
                                .setAuthor(requestor_oldEmbedSchema.author)
                                .setThumbnail(botIdent().activeBot.icon)
                            requestor_oldEmbedSchema.fields.forEach((i,index) => {
                                if (index < 3) { requestor_newEmbed.addFields({name: i.name, value: i.value, inline: i.inline }) }
                            })
                            const row = new Discord.ActionRowBuilder()
                                .addComponents(new Discord.ButtonBuilder().setCustomId(`axichallenge-approve-${message.author.id}-${response[0].testType}-${response[0].leadership_threadId}-${response[0].requestor_threadId}`).setLabel('Approve').setStyle(Discord.ButtonStyle.Success))
                                .addComponents(new Discord.ButtonBuilder().setCustomId(`axichallenge-deny-${message.author.id}-${response[0].testType}-${response[0].leadership_threadId}-${response[0].requestor_threadId}`).setLabel('Deny').setStyle(Discord.ButtonStyle.Danger))
                            const graderTypes = {
                                "basic": "Captain",
                                "advanced": "Major",
                                "master": "Colonel"
                            }
                            const grader_ident = graderTypes[response[0].testType]
                            if (message.attachments.size > 0) {
                                message.attachments.forEach(async attachment => {
                                    if (attachment.contentType && attachment.contentType.startsWith('image/')) {
                                        requestor_newEmbed.addFields(
                                            { name: "AXI Progression Challenge Proof", value: attachment.url, inline: false },
                                            { name: "Follow On Instructions", value: `Please be patient while leadership reviews this AXI Progression Submission.`, inline: false }
                                        )
                                        leadership_newEmbed.addFields(
                                            { name: "AXI Progression Challenge Proof", value: attachment.url, inline: false },
                                            { name: "Follow On Instructions", value: `Approve or Deny the AXI Progression Challenge Submission.`, inline: false }
                                        )
                                    }
                                })
                                await leadership_challenge.edit( { embeds: [requestor_newEmbed], components: [row] } )
                                await requestor_challenge.edit( { embeds: [requestor_newEmbed], components: [] } )
                                await requestor_thread.setLocked(true)
                                const blkMsg = await leadership_thread.send(`🕗<@&${graderRank[0][grader_ident]}> AXI Progression Challenge Proof Review Required`)
                                bulkMessages.push({ message: blkMsg.id, thread: leadership_thread.id })
                                saveBulkMessages(message.author.id,bulkMessages)
                                return
                            }
                            const denyMsg = await message.channel.messages.fetch({limit: 2})
                            if (denyMsg.last().id != response[0].requestor_roleEmbedId && denyMsg.last().content.startsWith("❌")) {
                                denyMsg.last().delete()
                            }
                            const urlRegex = /(https:\/\/[^\s]+)/g
                            let urls = message.content.match(urlRegex)
                            if (urls == null && message.attachments.size == 0) {
                                message.delete()
                                message.channel.send('❌ Drag and Drop an Image or Please enter a valid URL, eg: https://...')
                                return
                            }
                            if (urls != null && message.attachments.size == 0) {
                                urls = urls.map(i => i + "\n")
                                requestor_newEmbed.addFields(
                                    { name: "AXI Progression Challenge Proof", value: `${urls}`, inline: false },
                                    { name: "Follow On Instructions", value: `Please be patient while leadership reviews this AXI Progression Submission.`, inline: false }
                                    
                                )
                                leadership_newEmbed.addFields(
                                    { name: "AXI Progression Challenge Proof", value: `${urls}`, inline: false },
                                    { name: "Follow On Instructions", value: `Approve or Deny the AXI Progression Challenge Submission.`, inline: false }
                                )
                                message.delete()
                                await leadership_challenge.edit( { embeds: [leadership_newEmbed], components: [row] } )
                                await requestor_challenge.edit( { embeds: [requestor_newEmbed], components: [] } )
                                await requestor_thread.setLocked(true)
                                const blkMsg = await leadership_thread.send(`🕗<@&${graderRank[0][grader_ident]}> AXI Progression Challenge Proof Review Required`)
                                bulkMessages.push({ message: blkMsg.id, thread: leadership_thread.id })
                                saveBulkMessages(message.author.id,bulkMessages)
                                return
                            }
                        }
                        //For promotion challenge proof
                        if (response[0].grading_state == 3 && response[0].challenge_state != 3) {
                            removeBulkMessages(response[0].userId, message)
                            const rankTypes = {
                                "basic": "Aviator",
                                "advanced": "Lieutenant",
                                "master": "Captain",
                            }
                            const graderTypes = {
                                "basic": "Captain",
                                "advanced": "Major",
                                "master": "Colonel"
                            }
                            const grader_ident = graderTypes[response[0].testType]
                            // const leadership_thread = await message.guild.channels.fetch(response[0].leadership_threadId)
                            // if (leadership_thread.id == message.channel.id) {
                            //     //If chat is discovered in the leadership thread, abandon this script.
                            //     return
                            // }
                            //use 1 embed and modify both leadership embed and requestor embed
                            const leadership_challenge = await leadership_thread.messages.fetch(response[0].challenge_leadership_embedId)
                            const leadership_embed = leadership_challenge.embeds[0]
    
                            const requestor_thread = await message.guild.channels.cache.get(response[0].requestor_threadId)
                            const requestor_challenge = await requestor_thread.messages.fetch(response[0].challenge_requestor_embedId)

                            const leadership_oldEmbedSchema = {
                                title: leadership_embed.title,
                                author: { name: message.author.displayName, iconURL: message.author.displayAvatarURL({ dynamic: true }) },
                                description: leadership_embed.description,
                                color: leadership_embed.color
                            }
                            
                            const newEmbed = new Discord.EmbedBuilder()
                                .setTitle(leadership_oldEmbedSchema.title)
                                .setDescription(`Waiting on approval from Leadership. Typing in a new URL will update your submission.`)
                                .setColor("#f2ff00")
                                    // .setColor('#87FF2A') //bight green
                                    // .setColor('#f20505') //bight red
                                    // .setColor('#f2ff00') //bight yellow
                                .setAuthor(leadership_oldEmbedSchema.author)
                                .setThumbnail(botIdent().activeBot.icon)
                                .addFields(
                                    { name: "Promotion Rank", value: "```" + rankTypes[response[0].testType] + "```", inline: true },
                                    { name: "Promotion Challenge Status", value: "```" + 'Submitted, awaiting leadership approval' + "```", inline: true },
                                )
                            const row = new Discord.ActionRowBuilder()
                                .addComponents(new Discord.ButtonBuilder().setCustomId(`promotionchallenge-approve-${message.author.id}`).setLabel('Approve').setStyle(Discord.ButtonStyle.Success))
                                .addComponents(new Discord.ButtonBuilder().setCustomId(`promotionchallenge-deny-${message.author.id}`).setLabel('Deny').setStyle(Discord.ButtonStyle.Danger))
                            if (message.attachments.size > 0) {
                                message.attachments.forEach(async attachment => {
                                    if (attachment.contentType && attachment.contentType.startsWith('image/')) {
                                      newEmbed.addFields(
                                          { name: "Promotion Challenge Proof", value: attachment.url, inline: false },
                                          { name: "Required Approval by:", value: `<@&${graderRank[0][grader_ident]}> or Higher`, inline: false }
                                      )
                                    }
                                })
                                await leadership_challenge.edit( { embeds: [newEmbed], components: [row] } )
                                await requestor_challenge.edit( { embeds: [newEmbed] } )
                                const blkMsg = await leadership_thread.send(`🕗<@&${graderRank[0][grader_ident]}> Promotion Challenge Proof Review Required`)
                                bulkMessages.push({ message: blkMsg.id, thread: leadership_thread.id })
                                saveBulkMessages(message.author.id,bulkMessages)
                                return
                            }
                            const denyMsg = await message.channel.messages.fetch({limit: 2})
                            if (denyMsg.last().id != response[0].challenge_requestor_embedId && denyMsg.last().content.startsWith("❌")) {
                                denyMsg.last().delete()
                            }
                            const urlRegex = /(https:\/\/[^\s]+)/g
                            let urls = message.content.match(urlRegex)
                            if (urls == null && message.attachments.size == 0) {
                                message.delete()
                                message.channel.send('❌ Drag and Drop an Image or Please enter a valid URL, eg: https://...')
                                return
                            }
                            if (urls != null && message.attachments.size == 0) {
                                urls = urls.map(i => i + "\n")
                                newEmbed.addFields(
                                    { name: "Promotion Challenge Proof", value: `${urls}`, inline: false },
                                    { name: "Required Approval by:", value: `<@&${graderRank[0][grader_ident]}> or Higher`, inline: false }
                                )
                                // message.delete()
                                await leadership_challenge.edit( { embeds: [newEmbed], components: [row] } )
                                await requestor_challenge.edit( { embeds: [newEmbed] } )
                                const blkMsg = await leadership_thread.send(`🕗<@&${graderRank[0][grader_ident]}> Promotion Challenge Proof Review Required`)
                                bulkMessages.push({ message: blkMsg.id, thread: leadership_thread.id })
                                saveBulkMessages(message.author.id,bulkMessages)
                                await requestor_thread.setLocked(true)
                                
                            }
                        }
                        if (response.length > 0 && response[0].grading_state <= 0) {
                            
                            //requestor
                            const messages = await message.channel.messages.fetch({ limit: 2 });
                            const previousMessageWithEmbed = messages.last();
                            const receivedEmbed = previousMessageWithEmbed.embeds[0]
 
                            let oldEmbedSchema = {
                                author: receivedEmbed.author,
                                title: receivedEmbed.title,
                                description: receivedEmbed.description,
                                color: receivedEmbed.color,
                                fields: receivedEmbed.fields
                            } 
                            const newEmbed = new Discord.EmbedBuilder()
                                .setTitle(oldEmbedSchema.title)
                                .setDescription(oldEmbedSchema.description)
                                .setAuthor(oldEmbedSchema.author)
                                .setColor("#f2ff00")
                                .setThumbnail(botIdent().activeBot.icon)  
                            oldEmbedSchema.fields.forEach((i,index) => {
                                if (index < 5) { newEmbed.addFields({name: i.name, value: i.value, inline: i.inline }) }
                                if (index == 4) { newEmbed.addFields({ name: "Answer:", value: "```"+message.content+"```", inline: i.inline }) }
                            })
                            const rankTypes = {
                                "basic": "Aviator",
                                "advanced": "Lieutenant",
                                "master": "Captain",
                            }
                            const row = new Discord.ActionRowBuilder()
                                .addComponents(new Discord.ButtonBuilder().setCustomId(`answerquestion-${message.author.id}-${response[0].currentRank}-${rankTypes[response[0].testType]}`).setLabel('Next Question').setStyle(Discord.ButtonStyle.Success))
                            const editedEmbed = Discord.EmbedBuilder.from(newEmbed)
                            await previousMessageWithEmbed.edit({ embeds: [editedEmbed], components: [row] })

                            //leadership
                            const leadership_thread = await message.guild.channels.cache.get(response[0].leadership_threadId)
                            let leadership_lastMessage = await leadership_thread.messages.fetch({limit: 100})
                            for (let message of leadership_lastMessage.values()) {
                                if (message.embeds.length > 0) {
                                    leadership_lastMessage = message
                                    break
                                }
                            }
                            const leadership_receivedEmbed = leadership_lastMessage.embeds[0]
                            let leadership_oldEmbedSchema = {
                                author: leadership_receivedEmbed.author,
                                title: leadership_receivedEmbed.title,
                                description: leadership_receivedEmbed.description,
                                color: leadership_receivedEmbed.color,
                                fields: leadership_receivedEmbed.fields
                            } 
                            const leadership_newEmbed = new Discord.EmbedBuilder()
                                .setTitle(leadership_oldEmbedSchema.title)
                                .setDescription(leadership_oldEmbedSchema.description)
                                .setColor("#f2ff00")
                                .setAuthor(leadership_oldEmbedSchema.author)
                                .setThumbnail(botIdent().activeBot.icon)  
                                leadership_oldEmbedSchema.fields.forEach((i,index) => {
                                    if (index < 5) { leadership_newEmbed.addFields({name: i.name, value: i.value, inline: i.inline }) }
                                    if (index == 4) { leadership_newEmbed.addFields({ name: "Member Answer:", value: "```"+message.content+"```", inline: i.inline }) }
                                })
                            
                            await message.delete()
                            await leadership_lastMessage.edit({ embeds: [leadership_newEmbed] })
                        }
                        else {
                            message.delete()
                        }
                        
                    } 
                    catch (err) {
                        console.log(err)
                        botLog(message.guild,new Discord.EmbedBuilder()
                            .setDescription('```' + err.stack + '```')
                            .setTitle(`⛔ Fatal error experienced`)
                            ,2
                            ,'error'
                        )
                    }
                
                }
                //leadership Channel thread
                if (message.channel.name.startsWith("Promotion Request") && message.channel.messageCount >= 9) {
                    
                    let bulkMessages = []
                    let promotion = null
                    try { //Get DB info of thread
                        const values = [message.channel.id]
                        const sql = 'SELECT * FROM `promotion` WHERE leadership_threadId = (?)'
                        const response = await database.query(sql,values)
                        if (response.length > 0) {
                            promotion = response[0]
                        }
                    }
                    catch (err) {
                        console.log(err)
                        botLog(message.guild,new Discord.EmbedBuilder()
                            .setDescription('```' + err.stack + '```')
                            .setTitle(`⛔ Fatal error experienced`)
                            ,2
                            ,'error'
                        )
                    }
                    if (promotion.grading_state == 4 && (message.content.startsWith("!final") || message.content.startsWith("!Final"))) { 
                        removeBulkMessages(promotion.userId, message)
                        const leadership_thread = await message.guild.channels.fetch(promotion.leadership_threadId)
                        const requestor = await guild.members.fetch(promotion.userId)
                        const leadership_potential = await leadership_thread.messages.fetch(promotion.leadership_potential_embedId)
                        const leadership_embed = leadership_potential.embeds[0]
                        const leadership_oldEmbedSchema = {
                            title: leadership_embed.title,
                            author: { name: requestor.displayName, iconURL: requestor.displayAvatarURL({ dynamic: true }) },
                            description: leadership_embed.description,
                            color: leadership_embed.color,
                            fields: leadership_embed.fields
                        }
                        const leadership_newEmbed = new Discord.EmbedBuilder()
                            .setTitle(leadership_oldEmbedSchema.title)
                            .setDescription(`Promotion Potential Discussion`)
                            // .setColor('#87FF2A') //bight green
                            // .setColor('#f20505') //bight red
                            // .setColor('#f2ff00') //bight yellow
                            .setColor(leadership_oldEmbedSchema.color) //bight yellow
                            .setAuthor(leadership_oldEmbedSchema.author)
                            .setThumbnail(botIdent().activeBot.icon)

                        const MAX_FIELD_VALUE_LENGTH = 1024
                        let messageContent = message.content.trim()
                        if (messageContent.slice(0, 6).toLowerCase() === '!final') {
                            messageContent = messageContent.slice(6).trim()
                        }
                        let replacedField = false
                        let userFieldFound = false
                        let totalFields = 0
                        let messageDeleted = false
                        let sentError = false
                        const exceedsFieldLimit = (existingValue, newValue) => {
                            return (existingValue.length + newValue.length + 3) > MAX_FIELD_VALUE_LENGTH
                        }
                        leadership_oldEmbedSchema.fields.forEach(async (i, index) => {
                            if (i.value === "-" && !replacedField) {
                                if (messageContent.length > MAX_FIELD_VALUE_LENGTH) {
                                    if (!sentError) {
                                        sentError = true
                                        const blkMsg = await leadership_thread.send(`🕗 <@${message.author.id}> your message exceeds the 1024 character limit.`);
                                        bulkMessages.push({ message: blkMsg.id, thread: leadership_thread.id })
                                        saveBulkMessages(message.author.id,bulkMessages)
                                    }
                                    if (!messageDeleted) {
                                        try { 
                                            message.delete()
                                            messageDeleted = true
                                        } catch (e) { console.error(e) }
                                    }
                                    return
                                }
                                leadership_newEmbed.addFields({
                                    name: `${message.author.displayName}`,
                                    value: `- ${messageContent}`,
                                    inline: i.inline
                                })
                                replacedField = true
                                userFieldFound = true
                                totalFields++
                            } 
                            else if (i.name === message.author.displayName) {
                                if (exceedsFieldLimit(i.value, messageContent)) {
                                    if (!messageDeleted) {
                                        try { 
                                            message.delete()
                                            messageDeleted = true
                                        } catch (e) { console.error(e) }
                                    }
                                    return
                                }
                                leadership_newEmbed.addFields({
                                    name: i.name,
                                    value: `${i.value}\n- ${messageContent}`,
                                    inline: i.inline
                                });
                                userFieldFound = true
                            }
                            else {
                                leadership_newEmbed.addFields({
                                    name: i.name,
                                    value: i.value,
                                    inline: i.inline
                                });
                                totalFields++
                            }
                        })
                        if (!userFieldFound) {
                            if (messageContent.length > MAX_FIELD_VALUE_LENGTH) {
                                console.log("!userFieldFound")
                                if (!sentError) {
                                    sentError = true
                                    const blkMsg = await leadership_thread.send(`🕗 <@${message.author.id}> your message exceeds the 1024 character limit.`)
                                    bulkMessages.push({ message: blkMsg.id, thread: leadership_thread.id })
                                    saveBulkMessages(message.author.id,bulkMessages)
                                }
                                if (!messageDeleted) {
                                    try { 
                                        await message.delete()
                                        messageDeleted = true
                                    } catch (e) { console.error(e) }
                                }
                                return
                            }
                            leadership_newEmbed.addFields({
                                name: `${message.author.displayName}`,
                                value: `- ${messageContent}`,
                                inline: false
                            });
                            totalFields++
                        }
                        if (totalFields >= (Number(final_comments_required) + 3)) {
                            const requestor_components = new Discord.ActionRowBuilder()
                                .addComponents(
                                    new Discord.ButtonBuilder()
                                        .setCustomId(`promotion-approve-${promotion.userId}-${promoter_rank}`)
                                        .setLabel("Approve Promotion")
                                        .setStyle(Discord.ButtonStyle.Success)
                                )
                                .addComponents(
                                    new Discord.ButtonBuilder()
                                        .setCustomId(`promotion-deny-${promotion.userId}-${promoter_rank}`)
                                        .setLabel("Deny Promotion")
                                        .setStyle(Discord.ButtonStyle.Danger)
                                )
                            await leadership_potential.edit({ embeds: [leadership_newEmbed], components: [requestor_components] })
                        } 
                        else {
                            await leadership_potential.edit({ embeds: [leadership_newEmbed] })
                        }
                        if (!messageDeleted) {
                            try {
                                await message.delete()
                            } catch (e) { console.error(e) }
                        }
                    }
                    if (promotion.axi_rolesCheck == -3) {
                        
                        if (message.author.id != promotion.axiChallenge_reviewer) {
                            message.delete()
                            return
                        }
                        //Delete bot message telling you to explain why you denied.
                        const denyMsg = await message.channel.messages.fetch({limit: 2})
                        if (denyMsg.last().id != promotion.leadership_roleEmbedId) {
                            denyMsg.last().delete()
                        }
                         //Modify the embeds in both
                         let rank_emoji = await getRankEmoji(message.author.id)
                         if (rank_emoji == null) { rank_emoji == "" }
                         const challenge_score = promotion.axiChallenge_state == 1 ? "Approved" : "Denied"
                         const requestor_thread = await message.guild.channels.fetch(promotion.requestor_threadId)
                         const requestor_challenge = await requestor_thread.messages.fetch(promotion.requestor_roleEmbedId)
                         const requestor_receivedEmbed = requestor_challenge.embeds[0]
                         const requestor_oldEmbedSchema = {
                             title: requestor_receivedEmbed.title,
                             author: requestor_receivedEmbed.author,
                             description: requestor_receivedEmbed.description,
                             color: requestor_receivedEmbed.color,
                             fields: requestor_receivedEmbed.fields
                         }
                         const requestor_newEmbed = new Discord.EmbedBuilder()
                             .setTitle(requestor_oldEmbedSchema.title)
                             .setDescription("Your submission was denied, you will have further opportunities to submit qualifying proof.")
                                 // .setColor('#87FF2A') //bight green
                             .setColor('#f20505') //bight red
                                 // .setColor('#f2ff00') //bight yellow
                             .setAuthor(requestor_oldEmbedSchema.author)
                             .setThumbnail(botIdent().activeBot.icon)
                        requestor_oldEmbedSchema.fields.forEach((i,index) => {
                            if (index == 0) { requestor_newEmbed.addFields({name: i.name, value: i.value, inline: i.inline}) }
                            if (index == 1) { requestor_newEmbed.addFields({ name: "AXI Progression Challenge Status", value: "```" + challenge_score + "```", inline: true }) }
                            if (index == 2) { requestor_newEmbed.addFields({name: i.name, value: i.value, inline: i.inline}) }
                            if (index == 3) { requestor_newEmbed.addFields({name: "Reviewed By", value: `${rank_emoji}<@${message.author.id}>`, inline: i.inline}) }
                        })
     
                         requestor_newEmbed.addFields(
                             { name: "Denial Reason:", value: '```'+denyMsg.first().content+'```', inline: false },
                         )
                         const requestor_components = new Discord.ActionRowBuilder()
                             .addComponents(new Discord.ButtonBuilder().setCustomId(`axichallengeProofDenyConf-deny-${message.author.id}-${promotion.testType}-${promotion.leadership_threadId}-${promotion.requestor_threadId}`).setLabel("Submit New Proof").setStyle(Discord.ButtonStyle.Success))
                         
                         const leadership_challenge = await message.channel.messages.fetch(promotion.leadership_roleEmbedId)
                         const leadership_receivedEmbed = leadership_challenge.embeds[0]
                         const leadership_oldEmbedSchema = {
                             title: leadership_receivedEmbed.title,
                             author: leadership_receivedEmbed.author,
                             description: leadership_receivedEmbed.description,
                             color: leadership_receivedEmbed.color,
                             fields: leadership_receivedEmbed.fields
                         }
                         const leadership_newEmbed = new Discord.EmbedBuilder()
                             .setTitle(leadership_oldEmbedSchema.title)
                             .setDescription("Waiting on requestor to acknowledge AXI Progression Challenge Proof denial. User will be provided further opportunities to provide proof.")
                                 // .setColor('#87FF2A') //bight green
                             .setColor('#f20505') //bight red
                                 // .setColor('#f2ff00') //bight yellow
                             .setAuthor(leadership_oldEmbedSchema.author)
                             .setThumbnail(botIdent().activeBot.icon)
                             leadership_oldEmbedSchema.fields.forEach((i,index) => {
                             if (index == 0) { leadership_newEmbed.addFields({name: i.name, value: i.value, inline: i.inline}) }
                             if (index == 1) { leadership_newEmbed.addFields({ name: "AXI Progression Challenge Status", value: "```" + challenge_score + "```", inline: true }) }
                             if (index == 2) { leadership_newEmbed.addFields({name: i.name, value: i.value, inline: i.inline}) }
                             if (index == 3) { leadership_newEmbed.addFields({name: "Reviewed By", value: `${rank_emoji}<@${message.author.id}>`, inline: i.inline}) }
                         })
 
                         leadership_newEmbed.addFields(
                             { name: "Denial Reason:", value: '```'+denyMsg.first().content+'```', inline: false }
                         )
                        //  await requestor_challenge.edit( { embeds: [requestor_newEmbed], components: [requestor_components] } )
                         await requestor_challenge.edit( { embeds: [requestor_newEmbed], components: [] } )
                         await leadership_challenge.edit( { embeds: [leadership_newEmbed] } )
                         const blkMsg = await requestor_thread.send(`🕗 <@${promotion.userId}> Resubmit new proof by url or Drag and Drop`)
                         bulkMessages.push({ message: blkMsg.id, thread: requestor_thread.id })
                         saveBulkMessages(promotion.userId,bulkMessages)
                         if (denyMsg.first().id != promotion.leadership_roleEmbedId) {
                             denyMsg.first().delete()
                         }
                         try {
                             const values = [promotion.userId]
                             const sql = `UPDATE promotion SET axi_rolesCheck = -2, axiChallenge_state = -2 WHERE userId = (?);`
                             await database.query(sql, values)
                             await requestor_thread.setLocked(false)
                         }
                         catch (err) {
                             console.log(err)
                             botLog(message.guild,new Discord.EmbedBuilder()
                                 .setDescription('```' + err.stack + '```')
                                 .setTitle(`⛔ Fatal error experienced`)
                                 ,2
                                 ,'error'
                             )
                         }
                    }
                    //challengeproof denial
                    if (!promotion.axiChallenge_state <= 0 && promotion.grading_state == 3 && promotion.challenge_state >= 0) {
                        removeBulkMessages(promotion.userId, message)
                        //!If denial message statement is required, delete messages by anybody that is not the reviewer.
                        //todo Come up with a better system. Maybe try harder with modals even though they aren't compatable with deferedUpdates.
                        if (message.author.id != promotion.challenge_reviewer) {
                            message.delete()
                        }

                        //Delete bot message telling you to explain why you denied.
                        const denyMsg = await message.channel.messages.fetch({limit: 2})
                        if (denyMsg.last().id != promotion.challenge_leadership_embedId) {
                            denyMsg.last().delete()
                        }

                        //Modify the embeds in both
                        let rank_emoji = await getRankEmoji(message);
                        if (rank_emoji == null) { rank_emoji == "" }
                        const challenge_score = promotion.challenge_state == 1 ? "Approved" : "Denied"
                        const requestor_thread = await message.guild.channels.fetch(promotion.requestor_threadId)
                        const requestor_challenge = await requestor_thread.messages.fetch(promotion.challenge_requestor_embedId)
                        const requestor_receivedEmbed = requestor_challenge.embeds[0]
                        const requestor_oldEmbedSchema = {
                            title: requestor_receivedEmbed.title,
                            author: requestor_receivedEmbed.author,
                            description: requestor_receivedEmbed.description,
                            color: requestor_receivedEmbed.color,
                            fields: requestor_receivedEmbed.fields
                        }
                        const requestor_newEmbed = new Discord.EmbedBuilder()
                            .setTitle(requestor_oldEmbedSchema.title)
                            .setDescription("Your submission was denied, you will have further opportunities to submit qualifying proof.")
                                // .setColor('#87FF2A') //bight green
                            .setColor('#f20505') //bight red
                                // .setColor('#f2ff00') //bight yellow
                            .setAuthor(requestor_oldEmbedSchema.author)
                            .setThumbnail(botIdent().activeBot.icon)
                            requestor_oldEmbedSchema.fields.forEach((i,index) => {
                                if (index == 0) { requestor_newEmbed.addFields({name: i.name, value: i.value, inline: i.inline}) }
                                if (index == 1) { requestor_newEmbed.addFields({ name: "Promotion Challenge Status", value: "```" + challenge_score + "```", inline: true }) }
                                if (index == 2) { requestor_newEmbed.addFields({name: i.name, value: i.value, inline: i.inline}) }
                                if (index == 3) { requestor_newEmbed.addFields({name: "Reviewed By", value: `${rank_emoji}<@${message.author.id}>`, inline: i.inline}) }
                            })
    
                        requestor_newEmbed.addFields(
                            { name: "Denial Reason:", value: '```'+denyMsg.first().content+'```', inline: false },
                        )
                        const requestor_components = new Discord.ActionRowBuilder()
                            .addComponents(new Discord.ButtonBuilder().setCustomId(`challProofDenyConf-deny-${message.author.id}-${promotion.testType}-${promotion.leadership_threadId}-${promotion.requestor_threadId}`).setLabel("Click to Continue").setStyle(Discord.ButtonStyle.Success))
                        
                        const leadership_challenge = await message.channel.messages.fetch(promotion.challenge_leadership_embedId)
                        const leadership_receivedEmbed = leadership_challenge.embeds[0]
                        const leadership_oldEmbedSchema = {
                            title: leadership_receivedEmbed.title,
                            author: leadership_receivedEmbed.author,
                            description: leadership_receivedEmbed.description,
                            color: leadership_receivedEmbed.color,
                            fields: leadership_receivedEmbed.fields
                        }
                        const leadership_newEmbed = new Discord.EmbedBuilder()
                            .setTitle(leadership_oldEmbedSchema.title)
                            .setDescription("Waiting on requestor to acknowledge Challenge Proof denial. User will be provided further opportunities to provide proof.")
                                // .setColor('#87FF2A') //bight green
                            .setColor('#f20505') //bight red
                                // .setColor('#f2ff00') //bight yellow
                            .setAuthor(leadership_oldEmbedSchema.author)
                            .setThumbnail(botIdent().activeBot.icon)
                            leadership_oldEmbedSchema.fields.forEach((i,index) => {
                            if (index == 0) { leadership_newEmbed.addFields({name: i.name, value: i.value, inline: i.inline}) }
                            if (index == 1) { leadership_newEmbed.addFields({ name: "Promotion Challenge Status", value: "```" + challenge_score + "```", inline: true }) }
                            if (index == 2) { leadership_newEmbed.addFields({name: i.name, value: i.value, inline: i.inline}) }
                            if (index == 3) { leadership_newEmbed.addFields({name: "Reviewed By", value: `${rank_emoji}<@${message.author.id}>`, inline: i.inline}) }
                        })

                        leadership_newEmbed.addFields(
                            { name: "Denial Reason:", value: '```'+denyMsg.first().content+'```', inline: false }
                        )
                        await requestor_challenge.edit( { embeds: [requestor_newEmbed], components: [requestor_components] } )
                        await leadership_challenge.edit( { embeds: [leadership_newEmbed] } )
                        if (denyMsg.first().id != promotion.challenge_leadership_embedId) {
                            denyMsg.first().delete()
                        }
                        try {
                            const values = [promotion.userId]
                            const sql = `UPDATE promotion SET challenge_state = 3 WHERE userId = (?);`
                            await database.query(sql, values)
                            await requestor_thread.setLocked(false)
                            const blkMsg = await requestor_thread.send(`<@${promotion.userId}> Click to Continue to resubmit another valid Promotion Challenge proof.`)
                            bulkMessages.push(blkMsg)
                        }
                        catch (err) {
                            console.log(err)
                            botLog(message.guild,new Discord.EmbedBuilder()
                                .setDescription('```' + err.stack + '```')
                                .setTitle(`⛔ Fatal error experienced`)
                                ,2
                                ,'error'
                            )
                        }
                    }
                }
            } 
        }
    },
    messageDelete: async (message) => {
        if (!message.author.bot && !knowledge_proficiency.includes(message.channel.parentId) ) {  
            try {
                botLog(message.guild,new Discord.EmbedBuilder().setDescription(`Message deleted by user: ${message.author}` + '```' + `${message.content}` + '```').setTitle(`Message Deleted 🗑️`),1)
            } 
            catch (err) {
                console.log(err)
                botLog(message.guild,new Discord.EmbedBuilder()
                    .setDescription('```' + err.stack + '```')
                    .setTitle(`⛔ Fatal error experienced`)
                    ,2
                    ,'error'
                )
            }
        }


    },
    messageUpdate: async (oldMessage, newMessage, bot) => {
        if (oldMessage.content !== newMessage.content && !newMessage.author.bot) {
            //Field values max char limit 1024
            //Description max char 4096 
            botLog(bot,new Discord.EmbedBuilder()
                .setDescription(`Message updated by user: ${oldMessage.author}` + '```' + `${oldMessage}` + '```')
                .setTitle(`Original Message 📝`),1)
            botLog(bot,new Discord.EmbedBuilder()
                .setDescription('```' + `${newMessage}` + '```' + `Message Link: ${oldMessage.url}`)
                .setTitle(`Updated Message📝`),1)
        }
    },
    guildMemberRemove: async (member, bot) => { 
        let roles = ``
        member.roles.cache.each(role => roles += `${role}\n`)
        botLog(bot,new Discord.EmbedBuilder()
        .setDescription(`User ${member.user.tag}(${member.displayName}) has left or was kicked from the server.`)
        .setTitle(`User Left/Kicked from Server`)
        .addFields(
            { name: `ID`, value: `${member.id}`},
            { name: `Date Joined`, value: `<t:${(member.joinedTimestamp/1000) >> 0}:F>`},
            { name: `Roles`, value: `${roles}`},
        ),2)
    },
    guildScheduledEventDelete: async (event) => { 
        if (botIdent().activeBot.botName == "GuardianAI") {
            //XSF specific
            try {
                const opord_number_values = [event.id]
                const opord_number_sql = 'SELECT opord_number FROM opord WHERE event_id = ?';
                const opord_number_response = await database.query(opord_number_sql, opord_number_values)
                const opordToDelete = opord_number_response[0].opord_number;
                if (opordToDelete) {
                    try {
                        const guild = event.guild;
                        // Get opord channels
                        let channel_await = null;
                        let channel_approved = null;
                        channel_await = event.guild.channels.cache.get(config[botIdent().activeBot.botName].operation_order.opord_channel_await); //logchannel or other.
                        channel_approved = event.guild.channels.cache.get(config[botIdent().activeBot.botName].operation_order.opord_channel_approved); //opord channel where approved op orders appear
                        if (!channel_await || !channel_approved) {
                            console.log("[CAUTION]".bgYellow, "channel_await or channel_approved Channel IDs dont match. Check config. Defaulting to Test Server configuration in the .env file.")
                            channel_await = event.guild.channels.cache.get(process.env.TESTSERVER_OPORD_AWAIT); //GuardianAI.env
                            channel_approved = event.guild.channels.cache.get(process.env.TESTSERVER_OPORD_APPROVED); //GuardianAI.env
                        }
                        //delete oporder and emssage
                        const delete_embed_opord_number_sql = 'SELECT approved_message_id,await_message_id FROM opord WHERE opord_number = ?';
                        const delete_embed_opord_number_response = await database.query(delete_embed_opord_number_sql, opordToDelete)
                        
                        const deleteThis_channel_approved = await channel_approved.messages.fetch(delete_embed_opord_number_response[0].approved_message_id)
                        const deleteThis_channel_await = await channel_await.messages.fetch(delete_embed_opord_number_response[0].await_message_id)
                        deleteThis_channel_approved.delete()
                        deleteThis_channel_await.delete()
                        
                        const delete_sql = 'DELETE FROM opord WHERE opord_number = ?';
                        await database.query(delete_sql, opordToDelete);
                        //update opord_number from the remaining rows
                        const update_sql = 'UPDATE opord SET opord_number = opord_number - 1 WHERE opord_number > ?';
                        await database.query(update_sql, opordToDelete);
                        //Get all remaining rows to update embed.
                        const embed_opord_number_sql = 'SELECT event_id,approved_message_id,await_message_id,creator FROM opord WHERE opord_number >= ?';
                        const embed_number_response = await database.query(embed_opord_number_sql, opordToDelete)
                        if (embed_number_response) {
                            function editedEmbed(lastMessage,creator) {
                                const new_opord_number = lastMessage.embeds[0].data.fields[0].value - 1
                                const receivedEmbed = lastMessage.embeds[0];
                                const oldEmbedSchema = {
                                    title: receivedEmbed.title,
                                    author: { name: creator.nickname, iconURL: creator.user.displayAvatarURL({ dynamic: true }) },
                                    description: receivedEmbed.description,
                                    fields: receivedEmbed.fields,
                                    color: receivedEmbed.color
                                }
                                const newEmbed = new Discord.EmbedBuilder()
                                    .setTitle(oldEmbedSchema.title)
                                    .setDescription(oldEmbedSchema.description)
                                    .setColor(oldEmbedSchema.color)
                                    .setAuthor(oldEmbedSchema.author)
                                    .setThumbnail(botIdent().activeBot.icon)
    
                                oldEmbedSchema.fields.forEach((field, index) => {
                                    if (index == 0) {
                                        newEmbed.addFields({ name: "Operation Order #", value: `${new_opord_number}`, inline: field.inline })
                                    }
                                    if (index > 0) {
                                        newEmbed.addFields({ name: field.name, value: field.value, inline: field.inline })
                                    }
                                })
                                
                                const editedEmbed = Discord.EmbedBuilder.from(newEmbed)
                                // console.log(editedEmbed)
                                lastMessage.edit({ embeds: [editedEmbed] })
                            }
                            // async function editEventList(event) {
                                
                            //     let description = event.description.split("\n")[0]
                            //     description = parseInt(description.match(/\d+/)[0]);
                            //     description = description - 1
                            //     // event[description] = description
                            //     event.edit({ description: description })
                            // }
                            embed_number_response.forEach(async items=>{
                                //modify the events list description for operation order
                                // const thisEvent = await channel_approved.guild.scheduledEvents.fetch(items.event_id)
                                // editEventList(thisEvent)
                                //modify the await and approved channels
                                const creator = guild.members.cache.get(items.creator.id)
                                const thisChannel_approved = await channel_approved.messages.fetch(items.approved_message_id)
                                editedEmbed(thisChannel_approved,creator)
                                const thisChannel_await = await channel_await.messages.fetch(items.await_message_id)
                                editedEmbed(thisChannel_await,creator)
                            })
                        }
    
                    }
                    catch (err) {
                        console.log(err)
                        botLog(message.guild,new Discord.EmbedBuilder()
                            .setDescription('```' + err.stack + '```')
                            .setTitle(`⛔ Fatal error experienced`)
                            ,2
                            ,'error'
                        )
                    }
                }
            }
            catch (e) {
                //Required for events that are not in the database.
            }
        }
    }
}

module.exports = exp