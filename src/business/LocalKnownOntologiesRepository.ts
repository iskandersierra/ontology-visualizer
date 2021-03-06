import { IKnownOntologiesRepository, IKnownOntologyContent, IKnownOntologyInfo } from "./IKnownOntologiesRepository";

export interface ILocalKnownOntologiesRepositoryHost {
    readFileContent(fileName: string): Promise<string | undefined>;
    listFileNames(): Promise<readonly string[]>;
}

export class LocalKnownOntologiesRepository implements IKnownOntologiesRepository {
    constructor(private host: ILocalKnownOntologiesRepositoryHost) {
        if (!host) {
            throw new Error('host must be defined');
        }
    }

    public async getKnownOntologies(): Promise<readonly IKnownOntologyInfo[]> {
        const allFiles = await this.host.listFileNames();

        const infoFileNames = allFiles.filter(f => f.endsWith('.info.json'));

        const ontologies = await Promise.all(infoFileNames.map(async (fileName) => {
            const content = await this.host.readFileContent(fileName);
            const ontology = JSON.parse(content!) as IKnownOntologyInfo;
            return ontology;
        }));

        return ontologies;
    }

    public async getKnownOntology(ontologyId: string): Promise<IKnownOntologyInfo | undefined> {
        const fileName = ontologyId + '.info.json';
        const content = await this.host.readFileContent(fileName);
        
        if (!content) {
            return undefined;
        }
        
        const ontology = JSON.parse(content!) as IKnownOntologyInfo;
        return ontology;
    }

    public async getOntologyContent(ontologyId: string): Promise<IKnownOntologyContent | undefined> {
        const info = await this.getKnownOntology(ontologyId);

        if (!info) {
            return undefined;
        }

        const content = await this.host.readFileContent(info.ontologyUri);

        if (!content) {
            return undefined;
        }

        return { ...info, content };
    }
}
