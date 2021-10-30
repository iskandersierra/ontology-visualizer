import * as vscode from 'vscode';

import { 
	activate as activateExtension,
	deactivate as deactivateExtension
} from './commands';

export async function activate(context: vscode.ExtensionContext) {
	await activateExtension(context);
}

export async function deactivate() {
	await deactivateExtension();
}
