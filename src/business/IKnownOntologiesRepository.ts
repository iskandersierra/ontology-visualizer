export interface IKnownOntologyInfo {
    ontologyId: string;
    defaultPrefix: string;
    displayName: string;
    description: string;
    namespace: string;
    sourceUri: string;
    links: readonly IKnownOntologyLink[];
}

export interface IKnownOntologyLink {
    key: string;
    displayName: string;
    uri: string;
}

export interface IKnownOntologiesRepository {
    getKnownOntologies(): Promise<readonly IKnownOntologyInfo[]>;

    getOntologyContent(ontologyId: string): Promise<string | undefined>;
}


