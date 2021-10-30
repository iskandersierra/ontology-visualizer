import * as vscode from 'vscode';
import { ILogger } from '../business/ILogger';

import { activate as activateOpenKnownOntologies } from "./open-known-ontologies";
import { activate as activateSummaryView } from "./summary-view";

export class OutputChannelLogger implements ILogger {
	constructor(
		private channel: vscode.OutputChannel,
		private logToConsole: boolean) {}

	log(message: string): void {
		this.channel.appendLine(message);

		if (this.logToConsole) {
			console.log(message);
		}
	}
}

export async function activate(context: vscode.ExtensionContext) {
	const channel = vscode.window.createOutputChannel('Ontology Visualizer');
	context.subscriptions.push(channel);
	const logger = new OutputChannelLogger(channel, true);

    await activateOpenKnownOntologies(context, logger);
    await activateSummaryView(context, logger);
}

export async function deactivate() {
}
