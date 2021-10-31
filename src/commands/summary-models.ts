export type SummaryViewMessage = SummarizeOntologyMessage;

export interface SummarizeOntologyMessage {
    action: 'summarize-ontology';
    ontologyContent: string;
}
