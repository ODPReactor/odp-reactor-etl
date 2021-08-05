import { nanoid } from "nanoid"
import { BaseEntity } from "odp-reactor-persistence-interface"

export type CreateIndexInput = {
    sparqlEndpoint: string
    graph: string
}

export class Index extends BaseEntity {
    constructor(private indexName : string, private sparqlEndpoint: string, private graph : string ){
        super()
    }
    static create({
        sparqlEndpoint,
        graph
    } : CreateIndexInput) : Index {
        const indexName = nanoid()
        return new Index(indexName, sparqlEndpoint, graph)
    }
    getIndexName() {
        return this.indexName
    }
    getSparqlEndpoint() {
        return this.sparqlEndpoint
    }
    getGraph() {
        return this.graph
    }
    toJSON() {
        return {
          indexName: this.indexName,
          sparqlEndpoint : this.sparqlEndpoint,
          graph: this.graph
        }
    }
}