import { IClient } from "../IClient";
import { newEngine } from "@comunica/actor-init-sparql";
import { Bindings } from '@comunica/bus-query-operation';
import { DataFactory } from 'rdf-data-factory';

const factory = new DataFactory();

export type CreateSparqlClientInput = {
    sparqlEndpoint: string | undefined
    graph: string | undefined
}

export class SparqlClient implements IClient  {
    sparqlEndpoint: string;
    graph: string;
    sparqlQueryingEngine: any;

    constructor(sparqlEndpoint : string, graph : string) {
        this.sparqlEndpoint = sparqlEndpoint;
        this.graph = graph;
        this.sparqlQueryingEngine = newEngine();
    }
    static create({ sparqlEndpoint , graph } : CreateSparqlClientInput) {
        if (!sparqlEndpoint) return undefined;
        return new SparqlClient(sparqlEndpoint, graph ? graph : "default");
    }

    async sendRequest(requestInput: any): Promise<any> {
        const query = requestInput.query
        console.log(query);
        let bindings;
        try {
            let comunicaParams = {
                sources: [{ type: "sparql", value: this.sparqlEndpoint }],
                // bind ?graph variable if not default graph
                ...(this.graph !== "default" && {initialBindings: Bindings({
                    '?graph' : factory.namedNode(this.graph)
                })})
            }
            console.log("[*] Comunica params: ", comunicaParams);
            const result = await this.sparqlQueryingEngine.query(query, comunicaParams);
            bindings = await result.bindings();
            console.log("Result:", result)
        } catch (e) {
            console.log("[!] DbClient.executeQuery error:", e);
            bindings = undefined;
        }
        return bindings;    
    }
}