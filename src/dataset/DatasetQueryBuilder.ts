import { IQueryBuilder } from "odp-reactor-persistence-interface";
import { ODPRSparqlQueryBuilder } from "../sparql/SparqlQueryBuilder";
import { Dataset } from "./Dataset";

export class DatasetQueryBuilder extends ODPRSparqlQueryBuilder implements IQueryBuilder {

    graph: string;

    constructor(graph : string) {
        super()
        this.graph = graph
    }

    createDataset(dataset: Dataset) : string {
      return `
        ${this.addPrefixes()}

        INSERT DATA {
          GRAPH <${this.graph}> {
              odpr:${dataset.id} a odpr:Dataset ;
                               odpr:sparqlEndpoint """${dataset.sparqlEndpoint}""" ;
                               odpr:datasetGraph """${dataset.graph}""" ;
                               odpr:label """${dataset.label}""" ;
                               odpr:indexed """${dataset.indexed}""";
                               odpr:id """${dataset.id}""" .
          }
      }
      `
    }

    getAllDatasets() : string {
      return `
        ${this.addPrefixes()}

        SELECT ?id ?sparqlEndpoint ?label ?graphName ?indexed WHERE {
            GRAPH <${this.graph}> {
                ?datasetId a odpr:Dataset ;
                  odpr:sparqlEndpoint ?sparqlEndpoint ;
                  odpr:label ?label ;
                  odpr:id ?id .

                  OPTIONAL {
                    ?datasetId a odpr:Dataset ; 
                      odpr:datasetGraph ?graph2B .
                  }
                  BIND ( IF (BOUND ( ?graph2B ), ?graph2B, "" )  as ?graphName )

                  OPTIONAL {
                    ?datasetId a odpr:Dataset ; 
                              odpr:indexed ?indexed2B .
                  }
                  BIND ( IF (BOUND ( ?indexed2B ), ?indexed2B, "" )  as ?indexed )
            }
        }
    `    
    }


    getById(datasetId: string) {
      return `
          ${this.addPrefixes()}

          SELECT ?id ?sparqlEndpoint ?label ?graphName ?indexed WHERE {
              GRAPH <${this.graph}> {
                odpr:${datasetId} a odpr:Dataset ;
                  odpr:sparqlEndpoint ?sparqlEndpoint ;
                  odpr:label ?label ;
                  odpr:id ?id .

                  OPTIONAL {
                    ?datasetId a odpr:Dataset ; 
                              odpr:datasetGraph ?graph2B .
                  }
                  BIND ( IF (BOUND ( ?graph2B ), ?graph2B, "" )  as ?graphName ) .

                  OPTIONAL {
                    ?datasetId a odpr:Dataset ; 
                              odpr:indexed ?indexed2B .
                  }
                  BIND ( IF (BOUND ( ?indexed2B ), ?indexed2B, "" )  as ?indexed ) .
          }
        }
      `
    }

    deleteQuery(datasetId: string) {
          return `
    
          ${this.addPrefixes()}
    
          DELETE { 
              GRAPH <${this.graph}> {
                  odpr:${datasetId} ?p ?o . 
                  }
              }
          WHERE {
                  GRAPH <${this.graph}> {
                  odpr:${datasetId} a odpr:Dataset .
                  odpr:${datasetId} ?p ?o .
              }
          }
      `
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