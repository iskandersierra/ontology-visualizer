import * as React from 'react';
import { useObservableState } from "observable-hooks";
import { Term, DataFactory } from "n3";

import {
    stateService,
    IOntologySummary,
    IOntologyPrefix,
    IOntologyCounters,
    IOntologyGraphSummary,
    IOntologyTypeSummary,
    IOntologySubjectSummary,
} from "./state-service";

const { namedNode } = DataFactory;

const stringType = namedNode('http://www.w3.org/2001/XMLSchema#string');
const integerType = namedNode('http://www.w3.org/2001/XMLSchema#integer');
const decimalType = namedNode('http://www.w3.org/2001/XMLSchema#decimal');
const booleanType = namedNode('http://www.w3.org/2001/XMLSchema#boolean');

interface ShowNodeProps {
    node: Term;
    prefixes: IOntologyPrefix[];
}

const ShowNode = ({ node, prefixes }: ShowNodeProps) => {
    switch (node.termType) {
        case 'BlankNode':
            return (<span>_:{node.value}</span>);

        case 'NamedNode':
            const prefix = prefixes.find(p => node.value.startsWith(p.iri) && node.value !== p.iri);
            if (prefix) {
                return (<span>{prefix.prefix}:{node.value.substr(prefix.iri.length)}</span>);
            } else {
                return (<span>&lt;{node.value}&gt;</span>);
            }

        case 'Literal':
            if (node.language) {
                return (<span>"{node.value}"@{node.language}</span>);
            } else if (node.datatype) {
                if (node.datatype.equals(stringType)) {
                    return (<span>"{node.value}"</span>);
                } else if (node.datatype.equals(integerType)) {
                    return (<span>{node.value}</span>);
                } else if (node.datatype.equals(decimalType)) {
                    return (<span>{node.value}</span>);
                } else if (node.datatype.equals(booleanType)) {
                    return (<span>{node.value}</span>);
                } else {
                    return (<span>"{node.datatype.value}"^^<ShowNode node={node.datatype} prefixes={prefixes}/></span>);
                }
            } else {
                return (<span>&lt;{node.value}&gt;</span>);
            }

        case 'Variable':
            return (<span>?{node.value}</span>);

        case 'DefaultGraph':
            return (<span>DEFAULT_GRAPH</span>);
    
        default:
            break;
    }
};

const RenderError = ({ error }: { error: string }) => {
    return (
        <article className="message is-danger">
            <div className="message-header">
                <p>Danger</p>
                <button className="delete" aria-label="delete"></button>
            </div>
            <div className="message-body">
            {error}
            </div>
        </article>
    );
};

const RenderLoading = () => {
    return (
        <div>
            <p>Loading...</p>
        </div>
    );
};

const RenderCounters = ({ name, counters }: { name: string, counters: IOntologyCounters }) => (
    <p>
        This {name} have <span className="has-text-info">{counters.quads} statements</span>.
        <br/>
        It describes <span className="has-text-info">{counters.subjects} subjects</span>&nbsp;
        of <span className="has-text-info">{counters.types} types</span>,
        using <span className="has-text-info">{counters.predicates} predicates</span>&nbsp;
        in <span className="has-text-info">{counters.graphs} graphs</span>.
    </p>
);

const RenderPrefixes = ({ prefixes }: { prefixes: IOntologyPrefix[] }) => {
    const row = (prefix: IOntologyPrefix) => (
        <tr key={prefix.prefix}>
            <td>{prefix.prefix}</td>
            <td>{prefix.iri}</td>
        </tr>
    );

    return (
        <>
        <h2 className="is-size-4">Prefixes</h2>
        <table className="table is-fullwidth is-striped">
            <thead>
                <tr>
                    <th>Prefix</th>
                    <th>IRI</th>
                </tr>
            </thead>
            <tbody>
                {prefixes.map(row)}
            </tbody>
        </table>
        </>
    );
};

const RenderSubject = ({ subject, prefixes }: { subject: IOntologySubjectSummary, prefixes: IOntologyPrefix[] }) => {
    const subjectName = <ShowNode node={subject.subject} prefixes={prefixes}/>;

    return (
        <>
        <h3 className="is-size-6">Subject {subjectName} has {subject.quads.length} statements</h3>
        <dl>
            {subject.quads.map((quad, index) => (
                <React.Fragment key={index}>
                <dt>
                    <ShowNode node={quad.predicate} prefixes={prefixes}/>
                </dt>
                <dd>
                    <ShowNode node={quad.object} prefixes={prefixes}/>
                </dd>
                </React.Fragment>
            ))}
        </dl>
        </>
    );
};


const RenderType = ({ type, prefixes, graphIndex, typeIndex, previousType, nextType }: { 
        type: IOntologyTypeSummary;
        prefixes: IOntologyPrefix[];
        graphIndex: number;
        typeIndex: number;
        previousType?: number;
        nextType?: number;
    }) => {
    const typeName = type.type === undefined
        ? <span>Untyped</span>
        : <ShowNode node={type.type} prefixes={prefixes}/>;

    return (
        <>
        <h2 className="is-size-5">
            Type {typeName} has {type.subjects.length} subjects
            <a id={`type-${graphIndex}-${typeIndex}`}>&nbsp;</a>
            { previousType !== undefined ? (<a href={`#type-${graphIndex}-${previousType}`}>&nbsp;prev</a>) : null }
            { nextType !== undefined ? (<a href={`#type-${graphIndex}-${nextType}`}>&nbsp;next</a>) : null }
        </h2>
        <dl>
            <dt>Subjects:</dt>
            <dd>
            {type.subjectList.map((t, i) => (
                <React.Fragment key={`node${i}`}>
                    <i>
                        <ShowNode key={`node${i}`} node={t} prefixes={prefixes}/>
                    </i>, </React.Fragment>
            ))}
            </dd>
        </dl>
        { type.subjects.map((s, i) => <RenderSubject key={`sub${i}`} subject={s} prefixes={prefixes}/>) }
        </>
    );
};

const RenderGraph = ({ graph, prefixes, graphIndex, previousGraph, nextGraph }: { 
        graph: IOntologyGraphSummary;
        prefixes: IOntologyPrefix[];
        graphIndex: number;
        previousGraph?: number;
        nextGraph?: number;
    }) => {
    const graphHeader = <ShowNode node={graph.graph} prefixes={prefixes} />;

    return (
        <>
        <h2 className="is-size-4">
            Graph {graphHeader}
            <a id={`graph-${graphIndex}`}>&nbsp;</a>
            { previousGraph !== undefined ? (<a href={`#graph-${previousGraph}`}>&nbsp;prev</a>) : null }
            { nextGraph !== undefined ? (<a href={`#graph-${nextGraph}`}>&nbsp;next</a>) : null }
        </h2>
        { <RenderCounters name="graph" counters={graph.counters} /> }
        <dl>
            <dt>Types:</dt>
            <dd>
            {graph.typeList.map((t, i) => (
                <React.Fragment key={`node${i}`}>
                    <i>
                        <ShowNode key={`node${i}`} node={t} prefixes={prefixes}/>
                    </i>, </React.Fragment>
            ))}
            </dd>
        </dl>
        { graph.types.map((t, i) => (
            <RenderType key={`type${i}`} type={t} prefixes={prefixes} graphIndex={graphIndex}
                        typeIndex={i+1}
                        previousType={ i > 0 ? i : undefined } 
                        nextType={ i < graph.types.length - 1 ? i+2 : undefined }/>)) }
        </>
    );
};

const RenderSummary = ({ summary }: { summary: IOntologySummary }) => {
    return (
        <div>
            <h1 className="is-size-3">Summary</h1>
            { <RenderCounters name="ontology" counters={summary.counters}/> }
            { <RenderPrefixes prefixes={summary.prefixes}/> }
            { summary.graphs.map((g, i) => (
                <RenderGraph key={i} graph={g} prefixes={summary.prefixes} 
                            graphIndex={i+1}
                            previousGraph={ i > 0 ? i : undefined } 
                            nextGraph={ i < summary.graphs.length - 1 ? i+2 : undefined }/>)) }
        </div>
    );
};

export const OntologySummary = () => {
    const summary = useObservableState(stateService.summary$);

    if (!summary) {
        return <RenderLoading/>;
    } else if (summary.error) {
        return <RenderError error={summary.error}/>;
    } else {
        return <RenderSummary summary={summary}/>;
    }
};
