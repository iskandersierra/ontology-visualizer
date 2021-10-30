import * as vscode from "vscode";
import { ILogger } from "../business/ILogger";

const OPEN_ONTOLOGY_SUMMARY_COMMAND_KEY = 'ontology-visualizer.ontologySummary';

class OntologySummaryView {
    private panel: vscode.WebviewPanel | undefined;
    private subscriptions: vscode.Disposable[] = [];

    constructor(
        private context: vscode.ExtensionContext,
        private logger: ILogger) {
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
                    localResourceRoots: [
                        vscode.Uri.joinPath(this.context.extensionUri, 'assets/summary-view')
                    ]
                }
            );

            this.panel.onDidDispose(() => {
                this.logger.log(`Disposing ${this.subscriptions.length} subscriptions`);
                this.subscriptions.forEach(subscription => subscription.dispose());
                this.subscriptions = [];
                this.panel = undefined;
            }, null, this.subscriptions);

            const updateView = (editor: vscode.TextEditor | undefined) => {
                const uri = editor?.document?.uri;
                if (this.panel && uri) {
                    const message = `<h1>You are looking at ` + uri?.toString() + '</h1>\n<pre>' + editor.document.getText() + '</pre>';
                    this.logger.log(message);
                    this.panel!.webview.html = message;
                }
            };

            this.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(updateView));
            updateView(vscode.window.activeTextEditor);
        }
    }
}

export function activate(context: vscode.ExtensionContext, logger: ILogger) {
    const summaryView = new OntologySummaryView(context, logger);

    // Registers

	function registerCommand(commandKey: string, command: (...args: any[]) => any) {
		logger.log('Registering command: ' + commandKey);

		context.subscriptions.push(vscode.commands.registerCommand(commandKey, command));
	}

    registerCommand(OPEN_ONTOLOGY_SUMMARY_COMMAND_KEY, () => summaryView.show());
}
