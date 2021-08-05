type CreateDatasetInput = {
    datasetId: string,
    sparqlEndpoint: string,
    graph: string
}

export class Dataset {
    constructor(private datasetId : string, private sparqlEndpoint : string, private graph : string) {
    }
    static create({
        datasetId,
        sparqlEndpoint,
        graph
    } : CreateDatasetInput) {
        return new Dataset(datasetId,sparqlEndpoint,graph)
    }
    getDataset() : string {
        return this.datasetId
    }
    getSparqlEndpoint() : string {
        return this.sparqlEndpoint
    }
    getGraph() : string {
        return this.graph
    }
}
