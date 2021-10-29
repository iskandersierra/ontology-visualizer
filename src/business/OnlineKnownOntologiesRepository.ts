import { IKnownOntologiesRepository, IKnownOntologyInfo } from "./IKnownOntologiesRepository";

export interface IOnlineKnownOntologiesRepositoryHost {
    fetchContent(uri: string): Promise<string | undefined>;
}

export class OnlineKnownOntologiesRepository implements IKnownOntologiesRepository {
    constructor(
        private ontologies: readonly IKnownOntologyInfo[],
        private host: IOnlineKnownOntologiesRepositoryHost
    ) {
        if (!ontologies) {
            throw new Error('ontologies must be defined');
        }

        if (!host) {
            throw new Error('host must be defined');
        }
    }

    getKnownOntologies(): Promise<readonly IKnownOntologyInfo[]> {
        return Promise.resolve(this.ontologies);
    }

    async getOntologyContent(ontologyId: string): Promise<string | undefined> {
        const ontology = this.ontologies.find(o => o.ontologyId === ontologyId);

        if (!ontology) {
            return undefined;
        }

        return await this.host.fetchContent(ontology.sourceUri);
    }
}
