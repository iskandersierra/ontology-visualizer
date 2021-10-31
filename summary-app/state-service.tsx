import { BehaviorSubject, Observable, switchMap, filter } from "rxjs";
import { Parser, Quad, Prefixes, DataFactory, Quad_Graph, NamedNode } from "n3";

const { namedNode } = DataFactory;

export interface IOntologyPrefix {
    prefix: string;
    iri: string;
}

export interface IOntologyCounters {
    quads: number;
    graphs: number;
    subjects: number;
    predicates: number;
    types: number;
}

export interface IOntologyGraphSummary {
    graph: Quad_Graph;
    counters: IOntologyCounters;
    types: IOntologyTypeSummary[];
}

export interface IOntologyTypeSummary {
    type: NamedNode | undefined;
}

export interface IOntologySummary {
    error?: string;
    counters: IOntologyCounters;
    prefixes: IOntologyPrefix[];
    graphs: IOntologyGraphSummary[];
}

const isA = namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type");

function groupBy<T, K>(
    arr: T[],
    getKey: (item: T) => K,
    areEqual: (a: K, b: K) => boolean): ({ key: K, values: T[] })[] {
    const result: ({ key: K, values: T[] })[] = [];

    arr.forEach(item => {
        const key = getKey(item);
        const existing = result.find(r => areEqual(r.key, key));
        if (existing) {
            existing.values.push(item);
        } else {
            result.push({ key, values: [item] });
        }
    });

    return result;
}

export class StateService {
    private contentSubject = new BehaviorSubject('');
    private _summary$: Observable<IOntologySummary>;

    public get content$() {
        return this.contentSubject.pipe(
            filter(ontologyContent => !!ontologyContent)
        );
    }

    public setContent(content: string) {
        this.contentSubject.next(content);
    }

    public get summary$() {
        return this._summary$;
    }

    constructor() {
        this._summary$ = this.content$.pipe(
            switchMap(content => this.createSummary(content)),
            filter(summary => !!summary)
        );
    }

    private async createSummary(content: string): Promise<IOntologySummary> {
        try {
            const [quads, prefixes] = await this.readContent(content);
    
            return {
                prefixes: this.createPrefixes(prefixes),
                counters: this.createCounters(quads),
                graphs: this.createGraphs(quads),
            };
        } catch (error) {
            return {
                error: error.message
            } as IOntologySummary;
        }
    }

    private createPrefixes(prefixes: Prefixes): IOntologyPrefix[] {
        return Object.entries(prefixes).map(([prefix, namedNode]) => ({
            prefix,
            iri: typeof namedNode === 'string' ? namedNode : namedNode.value,
        }));
    }

    private createCounters(quads: Quad[]): IOntologyCounters {
        const quadsCount = quads.length;
        
        const countDistinct = (values: string[]) => 
            Object.keys(values.reduce((acc, value) => 
                ({...acc, [value]: 1}), {})).length;
        
        const graphCount = countDistinct(quads.map(quad => quad.graph.value));
        const subjectsCount = countDistinct(quads.map(quad => quad.subject.value));
        const predicatesCount = countDistinct(quads.map(quad => quad.predicate.value));
        const typesCount = countDistinct(quads
            .filter(q => q.predicate.equals(isA) && q.object.termType === 'NamedNode')
            .map(quad => quad.object.value));

        return {
            quads: quadsCount,
            graphs: graphCount,
            subjects: subjectsCount,
            predicates: predicatesCount,
            types: typesCount,
        };
    }

    private createGraphs(quads: Quad[]): IOntologyGraphSummary[] {
        const groups = groupBy(quads, quad => quad.graph, (a, b) => a.equals(b));

        return groups.map(group => {
            const graph = group.key;
            const counters = this.createCounters(group.values);
            const types = this.createTypes(group.values);
            return { graph, counters, types };
        });
    }

    private createTypes(quads: Quad[]): IOntologyTypeSummary[] {
        const groups = groupBy(
            quads,
            quad => quad.predicate.equals(isA) && quad.object.termType === 'NamedNode' ? quad.object : undefined,
            (a, b) => a === undefined && b === undefined || a !== undefined && b !== undefined && a.equals(b));

        return groups.map(group => {
            const type = group.key;
            return { type };
        });
    }

    private readContent(content: string): Promise<[Quad[], Prefixes]> {
        return new Promise<[Quad[], Prefixes]>((resolve, reject) => {
            const parser = new Parser();
            const quads: Quad[] = [];
            parser.parse(content, (error, quad, prefixes) => {
                if (error) {
                    reject(error);
                } else if (quad) {
                    quads.push(quad);
                } else {
                    resolve([quads, prefixes]);
                }
            });
        });
    }
}

export const stateService = new StateService();
