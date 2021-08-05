import { IQueryBuilder } from "odp-reactor-persistence-interface";

export class DatasetQueryBuilder implements IQueryBuilder {

    graph: string;

    constructor(graph : string) {
        this.graph = graph
    }

    getConfigByDatasetId(datasetId : string) {
        return `
                PREFIX ldr: <https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#>

                SELECT ?protocol ?host ?port ?path ?endpointType ?graph WHERE {

                    GRAPH <${this.graph}> {
              
                      ?serverConfig a ldr:ServerConfig ;
                      ldr:dataset <${datasetId}> ;
                      ldr:host ?host ;
                      ldr:port ?port ;
                      ldr:path ?path ;
                      ldr:protocol ?protocol ;
                      ldr:endpointType ?endpointType ;
                      ldr:graphName ?graph .              
                   } 
              }
                `;
    }

    getConfigBySparqlEndpointHostAndPathAndGraph({host, sparqlPath, graph} : {
        host: string,
        sparqlPath: string,
        graph: string
    }) {
        return `
      PREFIX ldr: <https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#>

      SELECT ?datasetId WHERE {

          GRAPH <${this.graph}> {
    
            ?serverConfig a ldr:ServerConfig ;
            ldr:dataset ?datasetId ;
            ldr:host "${host}" ;
            ldr:path "${sparqlPath}" ;
            ldr:graphName "${graph}" .
         } 
    }
      `;
    }
}