import { IKnownOntologiesRepository, IKnownOntologyInfo } from "./IKnownOntologiesRepository";

export type FetchContent = (uri: string) => Promise<string | undefined>;

export class OnlineKnownOntologiesRepository
    implements IKnownOntologiesRepository {
    constructor(
        private ontologies: readonly IKnownOntologyInfo[],
        private fetchContent: FetchContent
    ) {
        if (!ontologies) {
            throw new Error('ontologies must be defined');
        }

        if (!fetchContent) {
            throw new Error('fetchContent must be defined');
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

        return await this.fetchContent(ontology.sourceUri);
    }
}
