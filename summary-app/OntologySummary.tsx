import * as React from 'react';
import { useObservableState } from "observable-hooks";

import {
    stateService,
    IOntologyPrefix,
    IOntologyCounters,
    IOntologyGraphSummary,
    IOntologyTypeSummary
} from "./state-service";

export const OntologySummary = () => {
    const summary = useObservableState(stateService.summary$);

    const renderError = (error: string) => {
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

    const renderLoading = () => {
        return (
            <div>
                <p>Loading...</p>
            </div>
        );
    };

    const renderCounters = (name: string, counters: IOntologyCounters) => (
        <p>
            This {name} have <span className="has-text-info">{counters.quads} statements</span>.
            <br/>
            It describes <span className="has-text-info">{counters.subjects} subjects</span>&nbsp;
            of <span className="has-text-info">{counters.types} types</span>,
            using <span className="has-text-info">{counters.predicates} predicates</span>&nbsp;
            in <span className="has-text-info">{counters.graphs} graphs</span>.
        </p>
    );

    const renderPrefixes = (prefixes: typeof summary.prefixes) => {
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
                    {summary.prefixes.map(row)}
                </tbody>
            </table>
            </>
        );
    };

    const renderType = (type: IOntologyTypeSummary) => {
        const typeName = type.type === undefined ? "Untyped" : type.type.value;

        return (
            <>
            <h2 className="is-size-5">{typeName}</h2>
            </>
        );
    }

    const renderGraph = (graph: IOntologyGraphSummary) => {
        const graphName = graph.graph.termType === "DefaultGraph" ? "Default graph" : graph.graph.value;

        return (
            <>
            <h2 className="is-size-4">Graph {graphName}</h2>
            { renderCounters("graph", graph.counters) }
            { graph.types.map(renderType) }
            </>
        );
    };

    const renderSummary = () => {
        console.log(summary);
        
        return (
            <div>
                <h1 className="is-size-3">Summary</h1>
                { renderCounters('ontology', summary.counters) }
                { renderPrefixes(summary.prefixes) }
                { summary.graphs.map(renderGraph)}
            </div>
        );
    };

    if (!summary) {
        return renderLoading();
    } else if (summary.error) {
        return renderError(summary.error);
    } else {
        return renderSummary();
    }
};
