export type OntologyFileFormat =
    'turtle' | 'trig' | 'n-triples' | 'n-quads' | 'rdf' | 'n3';

export type OntologyFileFormatReader = 'n3' | 'rdflib' | undefined;
export type OntologyFileFormatWriter = 'n3' | undefined;

export interface IOntologyFileFormatInfo {
    readonly formatId: OntologyFileFormat;
    readonly displayName: string;
    readonly extensions: readonly string[];
    readonly mimeTypes: readonly string[];
    readonly homepage: string;
    readonly reader: OntologyFileFormatReader;
    readonly writer: OntologyFileFormatWriter;
}

export interface IOntologyFormatConverter {
    convertOntology(
        content: string,
        baseUri: string,
        sourceFormat: OntologyFileFormat,
        targetFormat: OntologyFileFormat)
        : Promise<string | undefined>;
}

export const ONTOLOGY_FORMATS: readonly IOntologyFileFormatInfo[] = [
    {
        formatId: 'turtle',
        displayName: 'Turtle',
        extensions: ['.ttl', '.turtle'],
        mimeTypes: ['text/turtle'],
        homepage: 'https://www.w3.org/TR/turtle/',
        reader: 'n3',
        writer: 'n3',
    },
    {
        formatId: 'trig',
        displayName: 'TriG',
        extensions: ['.trig'],
        mimeTypes: ['application/trig'],
        homepage: 'https://www.w3.org/TR/trig/',
        reader: 'n3',
        writer: 'n3',
    },
    {
        formatId: 'n-triples',
        displayName: 'N-Triples',
        extensions: ['.nt'],
        mimeTypes: ['application/n-triples'],
        homepage: 'https://www.w3.org/TR/n-triples/',
        reader: 'n3',
        writer: 'n3',
    },
    {
        formatId: 'n-quads',
        displayName: 'N-Quads',
        extensions: ['.nq'],
        mimeTypes: ['application/n-quads'],
        homepage: 'https://www.w3.org/TR/n-quads/',
        reader: 'n3',
        writer: 'n3',
    },
    {
        formatId: 'rdf',
        displayName: 'RDF/XML',
        extensions: ['.rdf', '.owl'],
        mimeTypes: ['application/rdf+xml'],
        homepage: 'https://www.w3.org/TR/rdf-syntax-grammar/',
        reader: 'rdflib',
        writer: undefined,
    },
    {
        formatId: 'n3',
        displayName: 'Notation3',
        extensions: ['.n3'],
        mimeTypes: ['text/n3'],
        homepage: 'https://www.w3.org/TeamSubmission/n3/',
        reader: 'n3',
        writer: 'n3',
    }
];

export function findOntologyFormat(formatId: OntologyFileFormat): IOntologyFileFormatInfo | undefined {
    return ONTOLOGY_FORMATS.find(f => f.formatId === formatId);
}
