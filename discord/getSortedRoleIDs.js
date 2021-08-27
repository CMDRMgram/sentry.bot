const { cleanString } = require("../discord/cleanString")
module.exports = {
      /**
     * Function takes a input string and returns the closest matching Server Role ID
     * @param   {object} message        Pass through the message object
     * @returns {object}                Returns an Object of role id's and their positions IN REVERSE ORDER
     */
  getSortedRoleIDs: (message) => {
    try {
      let roleNameObj = {};
      let numroles = message.guild.roles.cache
      console.log(typeof (numroles))
      console.log(numroles.length)
      message.guild.roles.cache.forEach((role) => {
        if (role.name != "@everyone" && role.name != "@here") {
          roleNameObj[numroles.length - parseInt(role.rawPosition)] = [
            role.id,cleanString(role.name)
          ];
        }
      });
      return roleNameObj
    } catch (err) {
      console.log(err);
    }
  },
};
