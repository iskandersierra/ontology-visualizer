import * as vscode from "vscode";
import { ILogger } from "../business/ILogger";

const OPEN_ONTOLOGY_SUMMARY_COMMAND_KEY = 'ontology-visualizer.ontologySummary';

class OntologySummaryView {
    private panel: vscode.WebviewPanel | undefined;

    constructor(private logger: ILogger) {
    }

    public async show() {
        if (!this.panel) {
            this.panel = vscode.window.createWebviewPanel(
                'ontology-summary',
                'Ontology Summary',
                vscode.ViewColumn.Beside,
                {
                    enableScripts: false,
                    retainContextWhenHidden: false,
                }
            );
        }

        this.panel.webview.html = "Hola mundo";
    }
}

export function activate(context: vscode.ExtensionContext, logger: ILogger) {
    const summaryView = new OntologySummaryView(logger);

    // Registers

	function registerCommand(commandKey: string, command: (...args: any[]) => any) {
		logger.log('Registering command: ' + commandKey);

		context.subscriptions.push(vscode.commands.registerCommand(commandKey, command));
	}

    registerCommand(OPEN_ONTOLOGY_SUMMARY_COMMAND_KEY, () => summaryView.show());
}
