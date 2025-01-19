import {
    ActionRowBuilder,
    TextInputStyle,
    ModalBuilder,
    TextInputBuilder
} from 'discord.js';
import Utils from '../Utils.js';

const Component = {
    Type: String,
    CustomID: String,

    // Text Input
    Style: String || TextInputStyle,
    Label: String,
    Required: Boolean,
    DefaultValue: String,
    Placeholder: String,
    MinLength: Number,
    MaxLength: Number,
}

const ComponentRows = {
    1: [Component],
    2: [Component],
    3: [Component],
    4: [Component],
    5: [Component],
}

const SetupModal = {
    Title: String,
    CustomID: String,

    Rows: ComponentRows,
}

const Settings = {
    configPath: SetupModal,
    variables: [{
        searchFor: RegExp,
        replaceWith: String || Number || Boolean
    }]
}

/**
 * Create modal from given settings.
 * @param {Settings} settings Settings with configPath and variables to create modal
 * @returns {ModalBuilder}
 */
const setupModal = (settings) => {
    const configPath = settings.configPath;
    const variables = settings.variables;

    let Title = configPath.Title || null;
    let CustomID = configPath.CustomID || null;

    if (!Title || !CustomID) {
        throw new Error(`Modal requires Title and CustomID to build modal.`);
    }

    // Get random if array
    if (Array.isArray(Title)) Title = Utils.getRandom(Title);

    if (variables && variables[0]) {
        if (Title && typeof Title === "string") Title = Utils.applyVariables(Title, variables);
        if (CustomID && typeof CustomID === "string") CustomID = Utils.applyVariables(CustomID, variables);
    }

    const Modal = new ModalBuilder()
        .setTitle(Title)
        .setCustomId(CustomID);

    const rows = [
        new ActionRowBuilder(), new ActionRowBuilder(),
        new ActionRowBuilder(), new ActionRowBuilder(), new ActionRowBuilder()
    ];

    for (let [i, value] of Object.entries(configPath.Rows)) {
        const row = rows[(parseInt(i) - 1)];
        if (row && value && Array.isArray(value) && value[0]) for (const component of value) {
            const Type = component.Type || null;
            const CustomID = component.CustomID || null;

            if (!CustomID) {
                throw new Error(`Component requires CustomID to build text input.`);
            }

            switch (Type?.toLowerCase()) {
                case "text": {
                    let Style = component.Style || null;
                    let Label = component.Label || null;
                    let Required = component.Required || null;
                    let DefaultValue = component.DefaultValue || null;
                    let Placeholder = component.Placeholder || null;
                    let MinLength = component.MinLength || null;
                    let MaxLength = component.MaxLength || null;

                    if (variables && variables[0]) {
                        if (Style && typeof Style === "string") Style = Utils.applyVariables(Style, variables);
                        if (Label && typeof Label === "string") Label = Utils.applyVariables(Label, variables);
                        if (DefaultValue && typeof DefaultValue === "string") DefaultValue = Utils.applyVariables(DefaultValue, variables);
                        if (Placeholder && typeof Placeholder === "string") Placeholder = Utils.applyVariables(Placeholder, variables);
                    }

                    if (Style && typeof Style == "string" && ["short", "paragraph"].includes(Style.toLowerCase())) {
                        switch (Style.toLowerCase()) {
                            case "short": Style = TextInputStyle.Short; break;
                            case "paragraph": case "long": Style = TextInputStyle.Paragraph; break;
                            default: Style = TextInputStyle.Short; break;
                        }
                    }

                    const TextInput = new TextInputBuilder()
                    TextInput.setCustomId(CustomID);
                    if (Style) TextInput.setStyle(Style);
                    if (Label) TextInput.setLabel(Label);
                    if (Required) TextInput.setRequired(Required);
                    if (DefaultValue) TextInput.setValue(DefaultValue);
                    if (Placeholder) TextInput.setPlaceholder(Placeholder);
                    if (MinLength) TextInput.setMinLength(MinLength);
                    if (MaxLength) TextInput.setMaxLength(MaxLength);

                    row.addComponents(TextInput);
                    break;
                }
            }
        }
    }

    Modal.addComponents(...rows.filter(row => row.components.length > 0 && row.components.length <= 5));

    return Modal;
}

export { setupModal, Settings, SetupModal };