import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs/promises';

import { IKnownOntologiesRepository, IKnownOntologyInfo, IKnownOntologyLink } from '../business/IKnownOntologiesRepository';
import { ILocalKnownOntologiesRepositoryHost, LocalKnownOntologiesRepository } from '../business/LocalKnownOntologiesRepository';
import { IOpenKnownOntologiesCommandsHost, OpenKnownOntologiesCommands } from '../business/OpenKnownOntologiesCommands';
import { findOntologyFormat, IOntologyFileFormatInfo, IOntologyFormatConverter, OntologyFileFormat, ONTOLOGY_FORMATS } from '../business/OntologyFileFormat';
import { OntologyFormatConverter } from '../business/OntologyFormatConverter';
import { N3Reader, N3Writer } from '../business/IN3Serialization';
import { ILogger } from '../business/ILogger';

const OPEN_KNOWN_ONTOLOGY_COMMAND_KEY = 'ontology-visualizer.openKnownOntology';
const OPEN_KNOWN_ONTOLOGY_AS_COMMAND_KEY = 'ontology-visualizer.openKnownOntologyAs';
const OPEN_KNOWN_ONTOLOGY_LINK_COMMAND_KEY = 'ontology-visualizer.openKnownOntologyLink';

const KNOWN_ONTOLOGY_SCHEME = 'known-ontology';
const ORIGINAL_FORMAT = 'original';

class KnownOntologyTextDocumentContentProvider implements vscode.TextDocumentContentProvider {
	onDidChangeEmiter = new vscode.EventEmitter<vscode.Uri>();
	onDidChange = this.onDidChangeEmiter.event;

	constructor(
		private repository: IKnownOntologiesRepository,
		private ontologyFormatConverter: IOntologyFormatConverter,
		private logger: ILogger) {

		if (!repository) {
			throw new Error('repository is undefined');
		}

		if (!ontologyFormatConverter) {
			throw new Error('ontologyFormatConverter is undefined');
		}
	}

	public async provideTextDocumentContent(uri: vscode.Uri) {
		const { ontologyId, format: targetFormat } = await this.getUriData(uri);

		this.logger.log(`provideTextDocumentContent: ` + uri.toString());
		
		try {
			const data = await this.repository.getOntologyContent(ontologyId);
			
			if (!data) {
				vscode.window.showErrorMessage(`Ontology ${uri.path} not found!`);
				return undefined;
			}

			if (targetFormat === ORIGINAL_FORMAT) {
				return data.content;
			}

			const converted = await this.ontologyFormatConverter
				.convertOntology(
					data.content,
					data.namespace,
					data.format,
					targetFormat);

			return converted;
		} catch (error: any) {
			vscode.window.showErrorMessage(error.message ?? 'Unknown error: ' + error);
			console.error(error);
			return undefined;
		}
	}

	private async getUriData(uri: vscode.Uri) {
		const path = uri.path;
		const qs = await import('query-string');
		const query = qs.parse(uri.query);
		
		return {
			path,
			ontologyId: query.id as string,
			format: query.format as ('original' | OntologyFileFormat)
		};
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

function toQuickOntologyFormatItem(info: IOntologyFileFormatInfo): QuickItemOf<IOntologyFileFormatInfo> {
	return {
		label: info.formatId,
		description: info.displayName,
		detail: info.homepage,
		info,
	};
}

class OpenKnownOntologiesCommandsHost implements IOpenKnownOntologiesCommandsHost {
	constructor(
		private repository: IKnownOntologiesRepository,
		private logger: ILogger) {
	}
	
	public async pickOneOntologyFormat()
		: Promise<IOntologyFileFormatInfo | undefined> {
			const quickItems = ONTOLOGY_FORMATS.map(toQuickOntologyFormatItem);
		
			const pick = await vscode.window.showQuickPick(quickItems, {
				canPickMany: false,
				matchOnDescription: true,
				matchOnDetail: true,
				placeHolder: 'Select an ontology format',
			});
	
			this.logger.log(`Picked ontology format: ${pick?.info?.formatId}`);
		
			return pick?.info;
		}
	
	public async pickOneOntology(
		title: string)
		: Promise<IKnownOntologyInfo | undefined> {
		const ontologies = await this.repository.getKnownOntologies();

		const quickItems = ontologies.map(toQuickOntologyItem);

		const pick = await vscode.window.showQuickPick(quickItems, {
			canPickMany: false,
			matchOnDescription: true,
			matchOnDetail: true,
			placeHolder: title,
		});

		this.logger.log(`Picked ontology: ${pick?.info?.ontologyId}`);		
	
		return pick?.info;
	}
	
	public async pickOneOntologyLink(
		ontology: IKnownOntologyInfo)
		: Promise<IKnownOntologyLink | undefined> {
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

		this.logger.log(`Picked ontology link: ${pick?.info?.key}`);
	
		return pick?.info;
	}
	
	public async openKnownOntologyDocument(
		ontologyId: string,
		format?: OntologyFileFormat)
		: Promise<void> {

		const info = await this.repository.getKnownOntology(ontologyId);

		if (!info) {
			vscode.window.showErrorMessage(`Known Ontology ${ontologyId} not found!`);
			return;
		}

		let ontologyUri = info.ontologyUri;

		if (format) {
			if (format === info.format) {
				format = undefined;
			}
			else {
				const targetFormat = findOntologyFormat(format);
				if (targetFormat) {
					const dotPos = ontologyUri.indexOf('.');
					ontologyUri = ontologyUri.substring(0, dotPos) + targetFormat.extensions[0];
				}
			}
		}

		const qs = await import('query-string');

		const query = qs.stringify({
			id: ontologyId,
			format: format ?? ORIGINAL_FORMAT,
		});

		const uri = vscode.Uri.from({
			scheme: KNOWN_ONTOLOGY_SCHEME,
			path: ontologyUri,
			query,
		});

		this.logger.log(`Open ontology ${uri.toString()}`);

		const document = await vscode.workspace.openTextDocument(uri);
		await vscode.window.showTextDocument(document);
	}
	
	public async openUriInBrowser(
		uri: string)
		: Promise<void> {

		this.logger.log(`Open URI ${uri} in browser`);
		
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

export function activate (context: vscode.ExtensionContext, logger: ILogger) {
	// Options, Services and Hosts

	const repositoryHost = new LocalKnownOntologiesRepositoryHost(context);

	const repository = new LocalKnownOntologiesRepository(repositoryHost);

	const ontologyConverter = new OntologyFormatConverter(new N3Reader(), new N3Writer());
	
	const host = new OpenKnownOntologiesCommandsHost(repository, logger);

	const commands = new OpenKnownOntologiesCommands(host);

	// Registers
 	
	logger.log('Registering document scheme: ' + KNOWN_ONTOLOGY_SCHEME);

	context.subscriptions.push(
		vscode.workspace.registerTextDocumentContentProvider(
			KNOWN_ONTOLOGY_SCHEME,
			new KnownOntologyTextDocumentContentProvider(repository, ontologyConverter, logger))
	);

	function registerCommand(commandKey: string, command: (...args: any[]) => any) {
		logger.log('Registering command: ' + commandKey);

		context.subscriptions.push(vscode.commands.registerCommand(commandKey, command));
	}

	registerCommand(OPEN_KNOWN_ONTOLOGY_COMMAND_KEY, () => commands.openKnownOntology());
	registerCommand(OPEN_KNOWN_ONTOLOGY_AS_COMMAND_KEY, () => commands.openKnownOntologyAs());
	registerCommand(OPEN_KNOWN_ONTOLOGY_LINK_COMMAND_KEY, () => commands.openKnownOntologyLink());
}
