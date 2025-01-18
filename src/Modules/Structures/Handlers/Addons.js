import { readdirSync, lstatSync } from "fs";
import { BryanBot } from "../BryanBot.js";
import { Config } from "./Config.js";
import Utils from "../../Utils.js";
import chalk from "chalk";
import path from "path";
import fs from "fs";

const __dirname = path.resolve();

export class AddonHandler {
  /** @type {BryanBot} */ manager;
  /** @type {string} */ addonDir;
  /** @type {string[]} */ addonDirFiles;

  /** @param {BryanBot} manager @param {string} addonDir */
  constructor(manager, addonDir) {
    if (!manager)
      throw new Error("[AddonHandler] Missing manager parameter.");
    if (!addonDir)
      throw new Error("[AddonHandler] Missing addonDir parameter.");

    this.manager = manager;
    this.addonDir = addonDir;
    this.addonDirFiles = readdirSync(addonDir)

    return this;
  }

  /** @param {string[]} dirFiles */
  async initialize(dirFiles) {
    for (
      let i = 0;
      i < (dirFiles ? dirFiles : this.addonDirFiles).length;
      i++
    ) {
      const isDir = lstatSync(
        path.join(this.addonDir, this.addonDirFiles[i])
      ).isDirectory();

      const { default: addon } = await import(
        `file://` + path.join(this.addonDir, this.addonDirFiles[i], isDir ? "index.js" : "")
      );

      try {
        await addon.validate()
        await addon.execute(this.manager);
        if (addon.log)
          addon.log.map(text => Utils.logger.addon(text))
      } catch (e) {
        Utils.logger.error(`An error has occurred executing red_bold{${addon.name}} addon!`);
        Utils.logger.error(e.toString());
      }

      this.manager.addons.set(addon.name, addon);
    }

    return this;
  }
}

export class Addon {
  /** @type {string} */ name;
  /** @type {string} */ version;
  /** @type {(manager: BryanBot) => any} */ execute = () => { };
  /** @type {Array<string> | undefined} */ log;
  /** @type {Object | undefined} */ addonConfigs;


  /** @param {string} name @param {string} version */
  constructor(name, version) {
    if (!name)
      throw new Error("[AddonHandler] Missing name parameter for addon.");

    this.name = name;
    this.version = version || "1.0";
    this.developer = {
      name: null,
      discord: null,
      docs: null,
      additional: null,
    };

    return this;
  }

  /**
   * Set the developer's name
   * @param {string} developerName
   * @returns {Addon} - Allows method chaining
   */
  setDeveloper(developerName) {
    this.developer.name = developerName;
    return this;
  }

  /**
   * Set the Discord link or any general link
   * @param {string} link
   * @returns {Addon} - Allows method chaining
   */
  setDiscord(link) {
    this.developer.discord = link;
    return this;
  }

  /**
   * Set the documentation link
   * @param {string} link
   * @returns {Addon} - Allows method chaining
   */
  setDocs(link) {
    this.developer.docs = link;
    return this;
  }

  /**
   * Set additional text or notes
   * @param {string} text
   * @returns {Addon} - Allows method chaining
   */
  setAdditional(text) {
    this.developer.additional = text;
    return this;
  }

  /** @param {(manager: BryanBot) => any} execute */
  setExecute(execute) {
    this.execute = execute;
    return this;
  }
  /** @param  {...string} text */
  setLog(...text) {
    this.log = text;
    return this;
  }

  /** @param {Object} configs */
  customConfig(configs) {
    this.addonConfigs = configs;

    const configKeys = Object.keys(configs);
    if (!fs.existsSync("./data/addon_configs"))
      fs.mkdirSync("./data/addon_configs");

    const returnConfigValue = {};
    for (let i = 0; i < configKeys.length; i++) {
      if (!fs.existsSync(`./data/addon_configs/${this.name}`))
        fs.mkdirSync(`./data/addon_configs/${this.name}`);
      const config = new Config(
        path.join(
          __dirname,
          `./data/addon_configs/${this.name}/${configKeys[i]}.yml`
        ),
        configs[configKeys[i]]
      );

      if (process.argv.includes("--reset-configs")) {
        returnConfigValue[configKeys[i]] = config.createFile().getFile();
      } else returnConfigValue[configKeys[i]] = config.getFile();
    }

    return returnConfigValue;
  }

  /**
   * Validate required fields are set before execution
   */
  validate() {
    if (!this.name || typeof this.name !== "string") {
      throw new Error(
        `The addon "${this.name || "unknown"}" has an invalid name.`
      );
    }
    if (!this.developer.name) {
      throw new Error(
        `The addon red_bold{${this.name}} is missing the developer's name. Use green{.setDeveloper(name)} to declare it.`
      );
    }
    if (!this.execute) {
      throw new Error(
        `Addon "${this.name}" is missing the execute function. Use setExecute() to define it.`
      );
    }
  }
}
