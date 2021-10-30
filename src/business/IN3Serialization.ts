import {
    Parser, Prefixes, Writer, DataFactory,
    Term, NamedNode, Quad
} from "n3";
import { NamedNode as RDFNamedNode } from "rdf-js";

import { 
    Store, parse, Formula, Statement as LibStatement, 
    Node as LibNode, Literal as LibLiteral, BlankNode as LibBlankNode, NamedNode as LibNamedNode,
    Variable as LibVariable,
} from "rdflib";
import { SubjectType, PredicateType, ObjectType, GraphType } from "rdflib/lib/types";
import LibDefaultGraph from "rdflib/lib/default-graph";
import { findOntologyFormat, IOntologyFileFormatInfo, OntologyFileFormat } from "./OntologyFileFormat";

function convertFromLibNode(node: LibNode) : Term {

    if (node instanceof LibBlankNode) {
        return DataFactory.blankNode(node.id);
    }

    if (node instanceof LibLiteral) {
        if (node.datatype) {
            const dataType = convertFromLibNode(node.datatype);
            return DataFactory.literal(node.value, dataType as NamedNode);
        } else if (node.language) {
            return DataFactory.literal(node.value, node.language);
        } else {
            return DataFactory.literal(node.value);
        }
    }

    if (node instanceof LibNamedNode) {
        return DataFactory.namedNode(node.value);
    }

    if (node instanceof LibVariable) {
        return DataFactory.variable(node.value);
    }

    if (node instanceof LibDefaultGraph) {
        return DataFactory.defaultGraph();
    }

    throw new Error(`Unknown node type: ${node.constructor.name}`);
}

function convertFromLibStatement(
    statement: LibStatement<SubjectType, PredicateType, ObjectType, GraphType>) : Quad {

    const graph = statement.graph.termType === 'DefaultGraph' 
        ? DataFactory.defaultGraph() 
        : convertFromLibNode(statement.graph);

    return DataFactory.quad(
        convertFromLibNode(statement.subject) as any,
        convertFromLibNode(statement.predicate) as any,
        convertFromLibNode(statement.object) as any,
        graph as any);
}

export const KNOWN_PREFIXES: Prefixes = {
    rdf: DataFactory.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#'),
    rdfs: DataFactory.namedNode('http://www.w3.org/2000/01/rdf-schema#'),
    owl: DataFactory.namedNode('http://www.w3.org/2002/07/owl#'),
    dc: DataFactory.namedNode('http://purl.org/dc/elements/1.1/'),
    dct: DataFactory.namedNode('http://purl.org/dc/terms/'),
    dctype: DataFactory.namedNode('http://purl.org/dc/dcmitype/'),
    prov: DataFactory.namedNode('http://www.w3.org/ns/prov#'),
    skos: DataFactory.namedNode('http://www.w3.org/2004/02/skos/core#'),
    sh: DataFactory.namedNode('http://www.w3.org/ns/shacl#'),
    sp: DataFactory.namedNode('http://spinrdf.org/spin#'),
    sd: DataFactory.namedNode('http://www.w3.org/ns/sparql-service-description#'),
    xsd: DataFactory.namedNode('http://www.w3.org/2001/XMLSchema#'),
    foaf: DataFactory.namedNode('http://xmlns.com/foaf/0.1/'),
    wot: DataFactory.namedNode('http://xmlns.com/wot/0.1/'),
    vs: DataFactory.namedNode('http://www.w3.org/2003/06/sw-vocab-status/ns#'),
    schema: DataFactory.namedNode('http://schema.org/'),
    con: DataFactory.namedNode('http://www.w3.org/2000/10/swap/pim/contact#'),
    geo: DataFactory.namedNode('http://www.w3.org/2003/01/geo/wgs84_pos#'),
};

export interface IN3Reader {
    read(
        content: string,
        baseUri: string,
        sourceFormat: OntologyFileFormat)
        : Promise<[readonly Quad[], Prefixes<RDFNamedNode<string>>]>;
}

export interface IN3Writer {
    write(
        quads: readonly Quad[],
        prefixes: Prefixes<RDFNamedNode<string>>,
        targetFormat: OntologyFileFormat)
        : Promise<string>;
}

export class N3Reader implements IN3Reader {

    public async read(
        content: string,
        baseUri: string,
        sourceFormat: OntologyFileFormat)
        : Promise<[readonly Quad[], Prefixes<RDFNamedNode<string>>]> {

        const sourceFmt = findOntologyFormat(sourceFormat);

        if (!sourceFmt) {
            throw new Error(`Unsupported ontology format: ${sourceFormat}`);
        }

        switch (sourceFmt.reader) {
            case 'rdflib':
                return await this.readRDF(content, baseUri, sourceFmt);

            case 'n3':
                return await this.readN3(content, sourceFmt);
        
            default:
                throw new Error(`Format ${sourceFormat} does not support reading`);
        }
    }

    private async readRDF(content: string, baseUri: string, sourceFmt: IOntologyFileFormatInfo)
        : Promise<[readonly Quad[], Prefixes<RDFNamedNode<string>>]> {
        
        const formula = await new Promise<Formula | null>((resolve, reject) => {
            parse(content, new Store(), baseUri, 'application/rdf+xml', (error, formula) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(formula);
                }
            });
        });

        if (!formula) {
            return [ [], {} ];
        }

        const quads: Quad[] = [];

        formula.statements.forEach(statement => {
            const quad = convertFromLibStatement(statement);
            quads.push(quad);
        });

        // TODO: detect automatically known prefixes and other prefixes
        return [quads, KNOWN_PREFIXES];
    }

    private async readN3(
        content: string,
        sourceFmt: IOntologyFileFormatInfo)
        : Promise<[readonly Quad[], Prefixes<RDFNamedNode<string>>]> {

        const parser = new Parser({ format: sourceFmt?.mimeTypes[0] });

        return await new Promise<[readonly Quad[], Prefixes<RDFNamedNode<string>>]>((resolve, reject) => {
            const quads: Quad[] = [];
            parser.parse(
                content,
                (error, quad, prefixes) => {
                    if (error) {
                        reject(error);
                    } else {
                        if (quad) {
                            quads.push(quad);
                        }
                        if (prefixes) {
                            resolve([quads, prefixes]);
                        }
                    }
                });
            });
    }
}

export class N3Writer implements IN3Writer {
    public async write(
        quads: readonly Quad[],
        prefixes: Prefixes<RDFNamedNode<string>>,
        targetFormat: OntologyFileFormat) {

        const targetFmt = findOntologyFormat(targetFormat);

        if (!targetFmt) {
            throw new Error(`Unsupported ontology format: ${targetFormat}`);
        }

        switch (targetFmt.writer) {
            case 'n3':
                return await this.writeN3(quads, prefixes, targetFmt);

            default:
                throw new Error(`Format ${targetFormat} does not support writing`);
        }
    }

    private async writeN3(
        quads: readonly Quad[],
        prefixes: Prefixes<RDFNamedNode<string>>,
        targetFmt: IOntologyFileFormatInfo) {

        const writer = new Writer({
            prefixes,
            format: targetFmt.mimeTypes[0],
        });

        writer.addQuads(quads as Quad[]);

        return await new Promise<string>((resolve, reject) => {
            writer.end((error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result as string);
                }
            });
        });
    }
}
