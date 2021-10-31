import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs/promises";
import { ILogger } from "../business/ILogger";
import { SummarizeOntologyMessage } from "./summary-models";

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
            this.panel = this.createPanel();

            await this.updateView();
            await this.refreshView(vscode.window.activeTextEditor);
            vscode.window.onDidChangeActiveTextEditor(
                this.refreshView, this, this.subscriptions);
        } else {
            this.panel.reveal(vscode.ViewColumn.Beside);
        }
    }

    private createPanel() {
        const panel = vscode.window.createWebviewPanel(
            'ontology-summary',
            'Ontology Summary',
            vscode.ViewColumn.Beside,
            {
                enableScripts: true,
                retainContextWhenHidden: false,
                localResourceRoots: [
                    vscode.Uri.joinPath(this.context.extensionUri, 'summary-out')
                ]
            }
        );


        panel.onDidDispose(() => {
            this.subscriptions.forEach(subscription => subscription.dispose());
            this.subscriptions = [];
            this.panel = undefined;
        }, null, this.subscriptions);

        return panel;
    }

    private async getWebviewContent() {
        const reactAppPath = path.join(this.context.extensionPath, 'summary-out/summary-out.js');
        const reactAppUri = vscode.Uri.file(reactAppPath).with({ scheme: 'vscode-resource' });
        
        const indexHtmlPath = path.join(this.context.extensionPath, 'summary-app/index.html');
        let indexHtmlContent = await fs.readFile(indexHtmlPath, 'utf8');
        indexHtmlContent = indexHtmlContent.replace(
            '${reactAppUri}', 
            reactAppUri.toString());

        return indexHtmlContent;
    }

    private async updateView() {
        if (this.panel) {
            this.panel!.webview.html = await this.getWebviewContent();
        }
    }

    private async refreshView(editor: vscode.TextEditor | undefined) {
        if (this.panel && editor) {
            // TODO: convert if needed to n3 format
            var message: SummarizeOntologyMessage = {
                action: 'summarize-ontology',
                ontologyContent: editor.document.getText()
            };
            this.panel.webview.postMessage(message);
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
