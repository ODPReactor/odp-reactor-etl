import { nanoid } from "nanoid"
import { Pattern } from "../pattern/Pattern"
import { DatasetDTO } from "./DatasetDataMapper"

type CreateDatasetInput = {
    id?: string,
    sparqlEndpoint: string,
    graph: string,
    label: string,
    indexed?: boolean,
    patterns?: Pattern[]
}

export class Dataset {

    patterns?: Pattern[]
    indexed: boolean
    graph: string
    label: string
    sparqlEndpoint: string
    id: string

    constructor(id : string, sparqlEndpoint : string, graph : string, label:string, indexed: boolean, patterns: Pattern[]) {
        this.id = id
        this.sparqlEndpoint = sparqlEndpoint
        this.label = label
        this.graph = graph
        this.indexed = indexed
        this.patterns = patterns
    }
    static create({
        id,
        sparqlEndpoint,
        graph,
        label,
        indexed,
        patterns
    } : CreateDatasetInput) {
        return new Dataset(id || nanoid(),sparqlEndpoint,graph,label, indexed || false, patterns || [])
    }
    getId() : string {
        return this.id
    }
    getSparqlEndpoint() : string {
        return this.sparqlEndpoint
    }
    getGraph() : string {
        return this.graph
    }
    toJSON() : DatasetDTO {
        return {
            id: this.id,
            sparqlEndpoint: this.sparqlEndpoint,
            graph: this.graph,
            indexed: this.indexed,
            label: this.label,
            patterns: this.patterns || undefined
        }
    }
}
