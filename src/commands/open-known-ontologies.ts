import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs/promises';

import { IKnownOntologiesRepository, IKnownOntologyInfo, IKnownOntologyLink } from '../business/IKnownOntologiesRepository';
import { ILocalKnownOntologiesRepositoryHost, LocalKnownOntologiesRepository } from '../business/LocalKnownOntologiesRepository';
import { IOpenKnownOntologiesCommandsHost, OpenKnownOntologiesCommands } from '../business/OpenKnownOntologiesCommands';

const OPEN_KNOWN_ONTOLOGY_COMMAND_KEY = 'ontology-visualizer.openKnownOntology';
const OPEN_KNOWN_ONTOLOGY_LINK_COMMAND_KEY = 'ontology-visualizer.openKnownOntologyLink';

const KNOWN_ONTOLOGY_SCHEME = 'known-ontology';

class KnownOntologyTextDocumentContentProvider implements vscode.TextDocumentContentProvider {
	onDidChangeEmiter = new vscode.EventEmitter<vscode.Uri>();
	onDidChange = this.onDidChangeEmiter.event;

	constructor(private getRepository: () => Promise<IKnownOntologiesRepository>) {
	}

	async provideTextDocumentContent(uri: vscode.Uri) {
		const ontologyId = uri.path;
		const repository = await this.getRepository();
		const content = await repository.getOntologyContent(ontologyId);
		if (content) {
			return content;
		}

		return `Ontology ${uri.path} not found!`;
	}
}

interface QuickItemOf<T> extends vscode.QuickPickItem {
	info: T;
}

function toQuickOntologyItem(info: IKnownOntologyInfo): QuickItemOf<IKnownOntologyInfo> {
	return {
		label: info.displayName,
		description: info.description,
		detail: info.sourceUri,
		info,
	};
}

function toQuickOntologyLinkItem(info: IKnownOntologyLink): QuickItemOf<IKnownOntologyLink> {
	return {
		label: info.key,
		description: info.displayName,
		detail: info.uri,
		info,
	};
}

class OpenKnownOntologiesCommandsHost implements IOpenKnownOntologiesCommandsHost {
	constructor(
		private getRepository: () => Promise<IKnownOntologiesRepository>) {
	}
	
	public async pickOneOntology(title: string): Promise<IKnownOntologyInfo | undefined> {
		const repository = await this.getRepository();

		const ontologies = await repository.getKnownOntologies();

		const quickItems = ontologies.map(toQuickOntologyItem);

		const pick = await vscode.window.showQuickPick(quickItems, {
			canPickMany: false,
			matchOnDescription: true,
			matchOnDetail: true,
			placeHolder: title,
		});

		console.log(`Picked ontology: ${pick?.info?.ontologyId}`);		
	
		return pick?.info;
	}
	
	public async pickOneOntologyLink(ontology: IKnownOntologyInfo): Promise<IKnownOntologyLink | undefined> {
		const links: IKnownOntologyLink[] = [
			...ontology.links,
			{
				key: 'source',
				displayName: 'Source',
				uri: ontology.sourceUri,
			}
		];
	
		const quickItems = links.map(toQuickOntologyLinkItem);
	
		const pick = await vscode.window.showQuickPick(quickItems, {
			canPickMany: false,
			matchOnDescription: true,
			matchOnDetail: true,
			placeHolder: 'Select an ontology link to open',
		});

		console.log(`Picked ontology link: ${pick?.info?.key}`);
	
		return pick?.info;
	}
	
	public async openKnownOntologyDocument(ontologyId: string): Promise<void> {
		console.log(`Open ontology ${ontologyId}`);
		
		const uri = vscode.Uri.parse(`${KNOWN_ONTOLOGY_SCHEME}:${ontologyId}`);
		const document = await vscode.workspace.openTextDocument(uri);
		await vscode.window.showTextDocument(document);
	}
	
	public async openUriInBrowser(uri: string): Promise<void> {
		console.log(`Open URI ${uri} in browser`);
		
		await vscode.env.openExternal(vscode.Uri.parse(uri));
	}
}

class LocalKnownOntologiesRepositoryHost implements ILocalKnownOntologiesRepositoryHost {
	constructor(
		private context: vscode.ExtensionContext,
	) {
		if (!context) {
			throw new Error('context is undefined');
		}
	}

	public async readFileContent(fileName: string): Promise<string | undefined> {
		try {
			const filePath = path.join(
				this.context.extensionPath,
				'assets/known-ontologies',
				fileName);
	
			const content = await fs.readFile(filePath, 'utf8');
	
			return content;
		} catch (error) {
			return undefined;
		}
	}

	public async listFileNames(): Promise<readonly string[]> {
		const directory = path.join(
			this.context.extensionPath,
			'assets/known-ontologies');

		const fileNames = await fs.readdir(directory);

		return fileNames;
	}
}

export default function (context: vscode.ExtensionContext) {
	const repositoryHost = new LocalKnownOntologiesRepositoryHost(context);

	const repository = new LocalKnownOntologiesRepository(repositoryHost);
	
	const getRepository = async () => repository;

	// const getRepository = async () =>
	// 	(await import('../business/online-known-ontologies-repository')).default;

	const host = new OpenKnownOntologiesCommandsHost(getRepository);

	const commands = new OpenKnownOntologiesCommands(host);
 	
	console.log('Registering document scheme: ' + KNOWN_ONTOLOGY_SCHEME);

	context.subscriptions.push(
		vscode.workspace.registerTextDocumentContentProvider(
			KNOWN_ONTOLOGY_SCHEME,
			new KnownOntologyTextDocumentContentProvider(getRepository))
	);

	console.log('Registering command: ' + OPEN_KNOWN_ONTOLOGY_COMMAND_KEY);

	context.subscriptions.push(
		vscode.commands.registerCommand(
			OPEN_KNOWN_ONTOLOGY_COMMAND_KEY,
			async () => await commands.openKnownOntology()));

	console.log('Registering command: ' + OPEN_KNOWN_ONTOLOGY_LINK_COMMAND_KEY);

	context.subscriptions.push(
		vscode.commands.registerCommand(
			OPEN_KNOWN_ONTOLOGY_LINK_COMMAND_KEY,
			async () => await commands.openKnownOntologyLink()));
}
