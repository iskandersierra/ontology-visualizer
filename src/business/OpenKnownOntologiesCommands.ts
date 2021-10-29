import { IKnownOntologyInfo, IKnownOntologyLink } from "./IKnownOntologiesRepository";

export interface IOpenKnownOntologiesCommandsHost {
    pickOneOntology(title: string): Promise<IKnownOntologyInfo | undefined>;
    pickOneOntologyLink(ontology: IKnownOntologyInfo): Promise<IKnownOntologyLink | undefined>;
    
    openKnownOntologyDocument(ontologyId: string): Promise<void>;
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