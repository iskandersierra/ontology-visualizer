import { IKnownOntologyInfo, IKnownOntologyLink } from './IKnownOntologiesRepository';
import { IOnlineKnownOntologiesRepositoryHost, OnlineKnownOntologiesRepository } from "./OnlineKnownOntologiesRepository";

function createLinks(links: {
    homepage: string | undefined,
    lov: string | undefined,
}) {
    const arr: IKnownOntologyLink[] = [];

    if (links.homepage) {
        arr.push({
            key: 'homepage',
            displayName: 'Homepage',
            uri: links.homepage,
        });
    }

    if (links.lov) {
        arr.push({
            key: 'lov',
            displayName: 'Linked Open Vocabulary',
            uri: links.lov,
        });
    }

    return arr;
}

const ontologies: readonly IKnownOntologyInfo[] = [
    {
        ontologyId: 'rdf.ttl',
        defaultPrefix: 'rdf',
        displayName: 'Resource Description Framework',
        description: 'This is the RDF Schema for the RDF vocabulary terms in the RDF Namespace, defined in RDF 1.1 Concepts.',
        namespace: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
        sourceUri: 'https://www.w3.org/1999/02/22-rdf-syntax-ns#',
        links: createLinks({
            homepage: 'https://www.w3.org/TR/rdf11-concepts/',
            lov: 'https://lov.linkeddata.es/dataset/lov/vocabs/rdf',
        }),
    },
    {
        ontologyId: 'rdfs.ttl',
        defaultPrefix: 'rdfs',
        displayName: 'RDF Schema',
        description: 'RDF Schema provides a data-modelling vocabulary for RDF data. RDF Schema is an extension of the basic RDF vocabulary.',
        namespace: 'http://www.w3.org/2000/01/rdf-schema#',
        sourceUri: 'http://www.w3.org/2000/01/rdf-schema#',
        links: createLinks({
            homepage: 'https://www.w3.org/TR/rdf-schema/',
            lov: 'https://lov.linkeddata.es/dataset/lov/vocabs/rdfs',
        }),
    },
    {
        ontologyId: 'owl.ttl',
        defaultPrefix: 'owl',
        displayName: 'The OWL 2 Schema vocabulary (OWL 2)',
        description: 'RDF Schema provides a data-modelling vocabulary for RDF data. RDF Schema is an extension of the basic RDF vocabulary.',
        namespace: 'http://www.w3.org/2002/07/owl#',
        sourceUri: 'https://www.w3.org/2002/07/owl#',
        links: createLinks({
            homepage: 'http://www.w3.org/TR/owl2-rdf-based-semantics/',
            lov: 'https://lov.linkeddata.es/dataset/lov/vocabs/owl',
        }),
    },
    {
        ontologyId: 'XMLSchema.xsd',
        defaultPrefix: 'xsd',
        displayName: 'XML Schema',
        description: 'The XML Schema representation',
        namespace: 'http://www.w3.org/2001/XMLSchema#',
        sourceUri: 'https://www.w3.org/2009/XMLSchema/XMLSchema.xsd',
        links: [
            ...createLinks({
                homepage: 'https://www.w3.org/TR/xmlschema-2/',
                lov: 'https://lov.linkeddata.es/dataset/lov/vocabs/xsd',
            }),
            {
                key: 'xsd-datatypes',
                displayName: 'XSD Datatypes',
                uri: 'https://www.w3.org/2011/rdf-wg/wiki/XSD_Datatypes',
            }
        ],
    },
    {
        ontologyId: 'shacl.ttl',
        defaultPrefix: 'sh',
        displayName: 'W3C Shapes Constraint Language (SHACL) Vocabulary',
        description: 'This vocabulary defines terms used in SHACL, the W3C Shapes Constraint Language.',
        namespace: 'http://www.w3.org/ns/shacl#',
        sourceUri: 'https://www.w3.org/ns/shacl.ttl',
        links: createLinks({
            homepage: 'https://www.w3.org/TR/shacl/',
            lov: 'https://lov.linkeddata.es/dataset/lov/vocabs/sh',
        }),
    },
    {
        ontologyId: 'spin.rdf',
        defaultPrefix: 'spin',
        displayName: 'SPIN Inferencing Vocabulary',
        description: 'An RDF Schema that can be used to attach constraints and rules to RDFS classes, and to encapsulate reusable SPARQL queries into functions and templates',
        namespace: 'http://spinrdf.org/spin#',
        sourceUri: 'https://spinrdf.org/spin',
        links: createLinks({
            homepage: 'https://spinrdf.org/spin.html',
            lov: 'https://lov.linkeddata.es/dataset/lov/vocabs/spin',
        }),
    },
    {
        ontologyId: 'dces.ttl',
        defaultPrefix: 'dce',
        displayName: 'Dublin Core Metadata Element Set',
        description: 'The Dublin Core Metadata Element Set is a vocabulary of fifteen properties for use in resource description. The name "Dublin" is due to its origin at a 1995 invitational workshop in Dublin, Ohio; "core" because its elements are broad and generic, usable for describing a wide range of resources.',
        namespace: 'http://purl.org/dc/elements/1.1/',
        sourceUri: 'https://www.dublincore.org/2012/06/14/dcelements.ttl',
        links: createLinks({
            homepage: 'http://dublincore.org/documents/dces',
            lov: 'https://lov.linkeddata.es/dataset/lov/vocabs/dce',
        }),
    },
    {
        ontologyId: 'dcterms.ttl',
        defaultPrefix: 'dce',
        displayName: 'DCMI Metadata Terms',
        description: 'An up-to-date specification of all metadata terms maintained by the Dublin Core Metadata Initiative, including properties, vocabulary encoding schemes, syntax encoding schemes, and classes.',
        namespace: 'http://purl.org/dc/terms/',
        sourceUri: 'https://www.dublincore.org/2012/06/14/dcterms.ttl',
        links: createLinks({
            homepage: 'http://dublincore.org/documents/dcmi-terms',
            lov: 'https://lov.linkeddata.es/dataset/lov/vocabs/dcterms',
        }),
    },
    {
        ontologyId: 'dctype.ttl',
        defaultPrefix: 'dctype',
        displayName: 'DCMI Type Vocabulary',
        description: 'The DCMI Type Vocabulary provides a general, cross-domain list of approved terms that may be used as values for the Resource Type element to identify the genre of a resource.',
        namespace: 'http://purl.org/dc/dcmitype/',
        sourceUri: 'https://www.dublincore.org/2012/06/14/dctype.ttl',
        links: createLinks({
            homepage: 'http://dublincore.org/documents/dcmi-type-vocabulary',
            lov: 'https://lov.linkeddata.es/dataset/lov/vocabs/dctype',
        }),
    },
    {
        ontologyId: 'schema.ttl',
        defaultPrefix: 'schema',
        displayName: 'Schema.org',
        description: 'Search engines including Bing, Google, Yahoo! and Yandex rely on schema.org markup to improve the display of search results, making it easier for people to find the right web pages.',
        namespace: 'http://schema.org/',
        sourceUri: 'https://raw.githubusercontent.com/ontola/ontologies/master/ontologies/schema/ontology.ttl',
        links: createLinks({
            homepage: 'https://schema.org/docs/about.html',
            lov: 'https://lov.linkeddata.es/dataset/lov/vocabs/schema',
        }),
    },
    {
        ontologyId: 'skos.rdf',
        defaultPrefix: 'skos',
        displayName: 'SKOS Simple Knowledge Organization System',
        description: 'The Simple Knowledge Organization System (SKOS) is a common data model for sharing and linking knowledge organization systems via the Semantic Web.',
        namespace: 'http://www.w3.org/2004/02/skos/core#',
        sourceUri: 'https://www.w3.org/2009/08/skos-reference/skos.rdf',
        links: createLinks({
            homepage: 'https://www.w3.org/2009/08/skos-reference/skos.html',
            lov: 'https://lov.linkeddata.es/dataset/lov/vocabs/skos',
        }),
    },
    {
        ontologyId: 'foaf.rdf',
        defaultPrefix: 'foaf',
        displayName: 'Friend of a Friend vocabulary',
        description: 'FOAF is a project devoted to linking people and information using the Web. Regardless of whether information is in people\'s heads, in physical or digital documents, or in the form of factual data, it can be linked.',
        namespace: 'http://xmlns.com/foaf/0.1/',
        sourceUri: 'https://raw.githubusercontent.com/ontola/ontologies/master/ontologies/foaf/ontology.rdf',
        links: createLinks({
            homepage: 'http://www.foaf-project.org/',
            lov: 'https://lov.linkeddata.es/dataset/lov/vocabs/foaf',
        }),
    },
    {
        ontologyId: 'prov.ttl',
        defaultPrefix: 'prov',
        displayName: 'W3C PROVenance Interchange',
        description: 'The namespace name http://www.w3.org/ns/prov# is intended for use with the PROV family of documents that support the interchange of provenance on the web.',
        namespace: 'http://www.w3.org/ns/prov#',
        sourceUri: 'https://www.w3.org/ns/prov-o',
        links: createLinks({
            homepage: 'https://www.w3.org/TR/prov-o/',
            lov: 'https://lov.linkeddata.es/dataset/lov/vocabs/prov',
        }),
    },
];

class OnlineKnownOntologiesRepositoryHost implements IOnlineKnownOntologiesRepositoryHost {
    async fetchContent(uri: string): Promise<string | undefined> {
        const axios = (await import('axios')).default;
        const response = await axios.get<string>(uri);
        return await response.data;
    }
}

export default new OnlineKnownOntologiesRepository(
    ontologies,
    new OnlineKnownOntologiesRepositoryHost());
