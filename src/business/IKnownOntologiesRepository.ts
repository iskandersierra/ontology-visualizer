import { OntologyFileFormat } from "./OntologyFileFormat";

export interface IKnownOntologyInfo {
    readonly ontologyId: string;
    readonly ontologyUri: string;
    readonly defaultPrefix: string;
    readonly format: OntologyFileFormat;
    readonly displayName: string;
    readonly description: string;
    readonly namespace: string;
    readonly sourceUri: string;
    readonly links: readonly IKnownOntologyLink[];
}

export interface IKnownOntologyLink {
    readonly key: string;
    readonly displayName: string;
    readonly uri: string;
}

export interface IKnownOntologyContent extends IKnownOntologyInfo {
    readonly content: string;
}

export interface IKnownOntologiesRepository {
    getKnownOntologies(): Promise<readonly IKnownOntologyInfo[]>;
    getKnownOntology(ontologyId: string): Promise<IKnownOntologyInfo | undefined>;

    getOntologyContent(ontologyId: string): Promise<IKnownOntologyContent | undefined>;
}


