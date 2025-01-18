import { Command } from "../../src/Modules/Structures/Handlers/Commands.js";
import { Addon } from "../../src/Modules/Structures/Handlers/Addons.js";
import Utils from "../../src/Modules/Utils.js";
import chalk from "chalk";

// Construct the addon including its name and version.
const addon = new Addon("AddonTemplate", "v1.1.1"),
  addonConfig = {
    config: {
      test: true,
    },
    lang: {
      test: true,
    },
    commands: {
      Test: {
        Enabled: true,
        Name: "test",
        Usage: "test",
        Cooldown: 0,
        Permission: ["@everyone"],
        Description: "This is a test command",
        DeleteCommand: false,
        Arguments: [],
      },
    },
  };

/** @type {addonConfig} */
const { config, lang, commands } = addon.customConfig(addonConfig);


// Declare the log message to be sent when the addon loads.
// Refer to BryanBot Docs on how to format log messages for BryanBot Console Logging
addon.setLog(`prefix{cyan{${addon.name}}} has been green{loaded}! Version: bold{${addon.version}}`);

// Declare the developer of the addon for future credit and support issues
// Declare your main alias and optionaly your Discord Invite, Document website and an o
addon.setDeveloper("BryanBot") // Developer Name (required)
  .setDiscord("https://bryanbot.dev/discord") // Your discord invite link or redirect (optional)
  .setDocs("https://bryanbot.dev/docs") // Documentation reguarding this addon (optional)
  .setAdditional("Thank you for using BryanBot. We are happy to assist you if you have any further questions. Please check out our discord!") // Extra information for the addon (optional) 


// The main function to be executed when the addon is loaded
addon.setExecute(async (manager) => {
  console.log("TesT addon executed!");

  // Register a new command with the BryanBot CommandHandler
  new Command({
    commandData: commands.Test,
    commandConfig: {
      guildOnly: true,
      dmOnly: false,
      // these are the discord permissions that the bot and user need to run the command
      // not roles
      requiredPermissions: {
        bot: [],
        user: [],
      },
    },
    LegacyRun(manager, message, args, prefixUsed, commandData) {
      message.channel.send("This is a test command!");
    },
    InteractionRun(manager, interaction, commandData) {
      interaction.reply("This is a test command!");
    },
  });
});

export default addon;
