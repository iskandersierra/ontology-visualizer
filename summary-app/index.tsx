import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { stateService } from "./state-service";
import { SummaryViewMessage } from "../src/commands/summary-models";
import { OntologySummary } from "./OntologySummary";

import './index.css';

interface VsCodeWebApi {
    postMessage: (message: any) => void;
    setState: (state: any) => void;
    getState: () => any;
}

declare global {
    interface Window {
        acquireVsCodeApi(): VsCodeWebApi;
    }
}

// const vscode = window.acquireVsCodeApi();

window.addEventListener('message', (event: MessageEvent<SummaryViewMessage>) => {
    switch (event.data.action) {
        case 'summarize-ontology':
            stateService.setContent(event.data.ontologyContent);
            break;
    }
});

const App = () => (<OntologySummary/>);

ReactDOM.render(
    <App/>,
    document.getElementById('root')
);
