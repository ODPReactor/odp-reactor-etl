import { nanoid } from "nanoid"
import { Pattern } from "../pattern/Pattern"
import { DatasetDTO } from "./DatasetDataMapper"

export type CreateDatasetInput = {
    id?: string,
    sparqlEndpoint: string,
    graph?: string | undefined,
    label: string,
    indexed?: boolean,
    patterns?: Pattern[] | undefined
}

export class Dataset {

    patterns?: Pattern[]
    indexed: boolean
    graph: string | undefined
    label: string
    sparqlEndpoint: string
    id: string

    constructor(id : string, sparqlEndpoint : string, graph : string | undefined, label:string, indexed: boolean, patterns: Pattern[]) {
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
