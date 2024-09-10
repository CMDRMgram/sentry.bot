const { botIdent, botLog  } = require('../../../functions');
const database = require(`../../../Warden/db/database`)
const Discord = require("discord.js");


module.exports = {
	leaderboardInteraction: async (i) => {
		
		let buttonResponse = i.customId.split("-")
		let [ ,leaderboard, eventType, submissionId ] = buttonResponse
		let res;
		let user;
		let submissionData = null
		try {
			const submission_values = [submissionId]
			const submission_sql = 'SELECT * FROM `speedrun` WHERE id = (?)';
			submissionData = await database.query(submission_sql, submission_values)
			if (submissionData.length === 0) {
				i.channel.send({ content: `⛔ Error: ${i.member} That submission no longer exists, it may have already been denied.` })
				return
			}
		} 
		catch (err) {
			console.log(err)
			botLog(i.guild,new Discord.EmbedBuilder()
				.setDescription('```' + err.stack + '```')
				.setTitle(`⛔ Fatal error experienced`)
				,2
				,'error'
			)
		}
		if (eventType === 'approve') {
		if (leaderboard === "speedrun") { // Myrmidon Checks
			// const submissionData_values = [submissionId]
			// const submissionData_sql = 'SELECT * FROM `speedrun` WHERE id = (?)';
			// const submissionData = await database.query(submissionData_sql, submissionData_values)
			if (submissionData.length === 0) {
				i.channel.send({ content: `⛔ Error: ${i.member} That submission no longer exists, it may have already been denied.` })
				return
			}
			if (submissionData.length >= 0) {
				let goidtype = submissionData[0].variant;
				let approvedUserId = submissionData[0].user_id;
				let member = i.guild.members.cache.get(approvedUserId);
				if(goidtype == "medusa" || goidtype == "hydra") {
					if(!(member.roles.cache.some(role => role.name === 'Myrmidon'))) {
						let timeTaken = submissionData[0].time;
						let shipclass = submissionData[0].class;
						if(shipclass == 'small') {
							if(timeTaken < 1440) {
								i.channel.send({ content: `Hey, ${i.member}!
									**Speedrun submission #${submissionId}** is eligible for **Myrmidon**
									Please contact <@${approvedUserId}> to see if they want the rank.` 
								})
							}
						}
						if(shipclass == 'medium') {
							if(timeTaken < 720) {
								i.channel.send({ content: `Hey, ${i.member}!
									**Speedrun submission #${submissionId}** is eligible for **Myrmidon**
									Please contact <@${approvedUserId}> to see if they want the rank.` 
								})
							}
						}
						if(shipclass == 'large') {
							if(timeTaken < 360) {
								i.channel.send({ content: `Hey, ${i.member}!
									**Speedrun submission #${submissionId}** is eligible for **Myrmidon**
									Please contact <@${approvedUserId}> to see if they want the rank.` 
								})
							}
						}
					}
				}
			}
		}
		try {
			const submissionUpdate_values = [1,submissionId]
			const submissionUpdate_sql = `UPDATE speedrun SET approval = (?) WHERE id = (?);`
			const submissionUpdate_response = await database.query(submissionUpdate_sql, submissionUpdate_values)
		} catch (err) {
			console.log(err)
			botLog(i.guild,new Discord.EmbedBuilder()
				.setDescription('```' + err.stack + '```')
				.setTitle(`⛔ Fatal error experienced`)
				,2
				,'error'
			)
			i.channel.send({ content: `Something went wrong approving a Submission, please try again or contact staff!` })
			return
		}
		i.message.edit({ content: `✅ **${leaderboard} submission #${submissionId} approved by ${i.member}.**`, components: [] })
		user = await i.guild.members.fetch(submissionData[0].user_id)
		user.send(`Hey! 👋 This is Warden just letting you know that your ${leaderboard} submission has been approved! go check it out in the AXI with the **/leaderboard** command. Submission ID: #${submissionData[0].id}`)
		} 
		else if (eventType === "deny") {
			try {
				const submissionDelete_values = [submissionId]
				const submissionDelete_sql = `DELETE FROM speedrun WHERE id = (?);`
				const submissionDelete_response = await database.query(submissionDelete_sql, submissionDelete_values)
				// database.query(`DELETE FROM ${leaderboard} WHERE id = $1`, [submissionId])
			} catch (err) {
				console.log(err)
				botLog(i.guild,new Discord.EmbedBuilder()
					.setDescription('```' + err.stack + '```')
					.setTitle(`⛔ Fatal error experienced`)
					,2
					,'error'
				)
				i.channel.send({ content: `Something went wrong deleting a submission, please contact a Technomancer.` })
				return
			}
			i.message.edit({ content: `⛔ **${leaderboard} submission #${submissionId} denied by ${i.member}.**`, components: [] })
			user = await i.guild.members.fetch(submissionData[0].user_id)
			user.send(`Hello, This is Warden just letting you know that your ${leaderboard} submission has been declined, sorry! 😞 contact a staff member in the AXI to find out why. Submission ID: #${submissionData[0].id}`)
		}
    }
}