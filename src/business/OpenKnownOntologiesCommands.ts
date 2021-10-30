import { IKnownOntologyInfo, IKnownOntologyLink } from "./IKnownOntologiesRepository";
import { IOntologyFileFormatInfo, OntologyFileFormat } from "./OntologyFileFormat";

export interface IOpenKnownOntologiesCommandsHost {
    pickOneOntology(title: string): Promise<IKnownOntologyInfo | undefined>;
    pickOneOntologyLink(ontology: IKnownOntologyInfo): Promise<IKnownOntologyLink | undefined>;
    pickOneOntologyFormat(): Promise<IOntologyFileFormatInfo | undefined>;
    
    openKnownOntologyDocument(ontologyId: string, format?: OntologyFileFormat): Promise<void>;
    openUriInBrowser(uri: string): Promise<void>;
}

export class OpenKnownOntologiesCommands {
    constructor(
        private host: IOpenKnownOntologiesCommandsHost) {
    }
    
    public async openKnownOntology() {
        const info = await this.host.pickOneOntology('Select an ontology to open');

        if (info) {
            await this.host.openKnownOntologyDocument(info.ontologyId);
        }
    }
    
    public async openKnownOntologyAs() {
        const info = await this.host.pickOneOntology('Select an ontology to open');

        if (info) {
            const format = await this.host.pickOneOntologyFormat();
    
            if (format) {
                await this.host.openKnownOntologyDocument(info.ontologyId, format.formatId);
            }
        }
    }
    
    public async openKnownOntologyLink() {
        const info = await this.host.pickOneOntology('Select an ontology to open its links');

        if (info) {
            const link = await this.host.pickOneOntologyLink(info);
    
            if (link) {
                this.host.openUriInBrowser(link.uri);
            }
        }
    }
}
