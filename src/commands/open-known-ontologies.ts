import * as vscode from 'vscode';

import { IKnownOntologiesRepository, IKnownOntologyInfo, IKnownOntologyLink } from '../business/IKnownOntologiesRepository';

const openKnownOntologyCommandKey = 'ontology-visualizer.openKnownOntology';
const openKnownOntologyLinkCommandKey = 'ontology-visualizer.openKnownOntologyLink';

const knownOntologyScheme = 'known-ontology';

class KnownOntologyTextDocumentContentProvider
	implements vscode.TextDocumentContentProvider {
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

async function pickOneOntology(
	repository: IKnownOntologiesRepository,
	placeHolder: string) {
	const items = (await repository.getKnownOntologies()).map(toQuickOntologyItem);

	const pick = await vscode.window.showQuickPick(items, {
		canPickMany: false,
		matchOnDescription: true,
		matchOnDetail: true,
		placeHolder,
	});

	return pick?.info;
}

async function openKnownOntology(repository: IKnownOntologiesRepository) {
	const info = await pickOneOntology(repository, 'Select an ontology to open');

	if (info) {
		const uri = vscode.Uri.parse(`${knownOntologyScheme}:${info.ontologyId}`);
		const document = await vscode.workspace.openTextDocument(uri);
		await vscode.window.showTextDocument(document);
	}
}

async function pickOneOntologyLink(ontology: IKnownOntologyInfo) {
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

	return pick?.info;
}

async function openKnownOntologyLink(repository: IKnownOntologiesRepository) {
	const info = await pickOneOntology(repository, 'Select an ontology to open its homepage');

	if (info) {
		const link = await pickOneOntologyLink(info);

		if (link) {
			vscode.env.openExternal(vscode.Uri.parse(link.uri));
		}
	}
}

export default function (context: vscode.ExtensionContext) {
	const getRepository = async () => (await import('../business/default-known-ontologies-repository')).default;
 	
	console.log('Registering document scheme: ' + knownOntologyScheme);

	context.subscriptions.push(
		vscode.workspace.registerTextDocumentContentProvider(
			knownOntologyScheme,
			new KnownOntologyTextDocumentContentProvider(getRepository))
	);

	console.log('Registering command: ' + openKnownOntologyCommandKey);

	context.subscriptions.push(
		vscode.commands.registerCommand(
			openKnownOntologyCommandKey,
			async () => await openKnownOntology(await getRepository())));

	console.log('Registering command: ' + openKnownOntologyLinkCommandKey);

	context.subscriptions.push(
		vscode.commands.registerCommand(
			openKnownOntologyLinkCommandKey,
			async () => await openKnownOntologyLink(await getRepository())));
}
