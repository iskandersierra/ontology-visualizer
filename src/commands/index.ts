import * as vscode from 'vscode';

import registerOpenKnownOntologiesCommands from "./open-known-ontologies";

export default function(context: vscode.ExtensionContext) {
    registerOpenKnownOntologiesCommands(context);
}
