import { ActionRowBuilder, AttachmentBuilder, EmbedBuilder } from "discord.js";
import { SetupComponents, setupComponents } from "./setupComponents.js";
import { SetupEmbed, setupEmbed } from "./setupEmbed.js";
import { manager } from "../../index.js";
import Utils from "../Utils.js";

const SetupMessage = {
  Private: Boolean,
  Embeds: [SetupEmbed],
  Content: String || [String],
  Components: SetupComponents,
  TTS: Boolean,
  Files: [
    {
      Path: String,
      Name: String,
      Spoiler: true,
      Description: String,
    },
  ],
};

const Settings = {
  configPath: SetupMessage,
  variables: [{ searchFor: RegExp, replaceWith: String || Number || Boolean }],
};

const Message = {
  tts: Boolean,
  content: String,
  embeds: [EmbedBuilder],
  files: [AttachmentBuilder],
  components: [ActionRowBuilder],
};

/** @param {Settings} settings */
const setupMessage = (settings) => {
  const configPath = settings.configPath;
  const variables = settings.variables ?? [];

  variables.push(
    ...[
      {
        searchFor: /{brand-color}/g,
        replaceWith: manager.configs.config?.Branding.Color || "#2f3136",
      },
      {
        searchFor: /{brand-name}/g,
        replaceWith: manager.configs.config?.Branding.Name || "BryanBot",
      },
      {
        searchFor: /{brand-link}/g,
        replaceWith:
          manager.configs.config?.Branding.Link || "https://github.com/BryanBotDev/BryanBot",
      },
      {
        searchFor: /{brand-logo}/g,
        replaceWith:
          manager.configs.config?.Branding.Logo ||
          "https://i.imgur.com/ptTG24J.png",
      },
    ]
  );

  const message = {
    files: [],
    embeds: [],
    components: [],
    content: undefined,
    tts: !!configPath.TTS,
  };

  const Files = configPath.Files || [];
  let Embeds = configPath.Embeds || [];
  let Components = configPath.Components || {};
  let Content = configPath.Content || undefined;

  if (configPath.Private) message.ephemeral = true;

  if (Content) {
    if (Array.isArray(Content)) Content = Utils.getRandom(Content);

    if (variables && typeof Content == "string")
      Content = Utils.applyVariables(Content, variables);

    if (typeof Content == "string" && Content.length > 2000) {
      Content = Content.substring(0, 1997) + "...";
    }

    message.content = Content;
  }

  if (Embeds && Array.isArray(Embeds)) {
    Embeds.forEach((configPath) =>
      message.embeds?.push(setupEmbed({ configPath, variables }))
    );
  }

  if (Components && Object.keys(Components)[0]) {
    message.components = setupComponents({ configPath: Components, variables });
  }

  if (Files) {
    for (let index = 0; index < Files.length; index++) {
      const File = Files[index];

      let FilePath = File.Path || null;
      let FileName = File.Name || undefined;
      let FileSpoiler = File.Spoiler || false;
      let FileDescription = File.Description || null;

      if (variables) {
        if (FilePath && typeof FilePath == "string")
          FilePath = Utils.applyVariables(FilePath, variables);
        if (FileName && typeof FileName == "string")
          FileName = Utils.applyVariables(FileName, variables);
        if (FileDescription && typeof FileDescription == "string")
          FileDescription = Utils.applyVariables(FileDescription, variables);
      }

      if (FilePath) {
        const attachment = new AttachmentBuilder(FilePath);
        if (FileName) attachment.setName(FileName);
        if (FileSpoiler) attachment.setSpoiler(true);
        if (FileDescription) attachment.setDescription(FileDescription);

        message.files?.push(attachment);
      }
    }
  }

  return message;
};

export { setupMessage, Settings, SetupMessage, Message };
