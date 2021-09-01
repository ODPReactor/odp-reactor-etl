import { IQueryBuilder } from "odp-reactor-persistence-interface";
import { IndexingStatus } from "../indexes/IndexingStatus";
import { Pattern } from "../pattern/Pattern";
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

    getAllDatasetPatterns(datasetId: string) : string {
      return `
      ${this.addPrefixes()}

      SELECT DISTINCT ?label ?uri ?id WHERE {
          GRAPH <${this.graph}> {
              odpr:${datasetId} a odpr:Dataset ;
                odpr:hasPatternCollection ?patternCollection .

              ?patternCollection odpr:hasPattern ?uri .
                ?uri odpr:label ?label .
                ?uri odpr:id ?id .
          }
      }
    `

    }

    createPatternCollection(datasetId: string, patterns: Pattern[]) {
      return `
      ${this.addPrefixes()}

        INSERT DATA {
          GRAPH <${this.graph}> {
              odpr:${datasetId} odpr:hasPatternCollection odpr:pattern_collection_${datasetId} .
              
              ${patterns.map(p => {
                return `odpr:pattern_collection_${datasetId} odpr:hasPattern <${p.uri}>.
                        <${p.uri}>                           odpr:label """${p.label}""";
                                                             odpr:id """${p.id}""" . `
              }).reduce((queryBlock, queryLine) => {
                return queryBlock + "\n" + queryLine
              })}
          }
      }
      `
    }

    addPattern(datasetId: string, pattern: Pattern) {
      return `
      ${this.addPrefixes()}

      INSERT DATA {
          GRAPH <${this.graph}> {
            odpr:pattern_collection_${datasetId} odpr:hasPattern <${pattern.uri}>.
              <${pattern.uri}>   odpr:label """${pattern.label}""";
                                 odpr:id  """${pattern.id}""".           
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
                    odpr:${datasetId} a odpr:Dataset ; 
                              odpr:datasetGraph ?graph2B .
                  }
                  BIND ( IF (BOUND ( ?graph2B ), ?graph2B, "" )  as ?graphName ) .

                  OPTIONAL {
                    odpr:${datasetId} a odpr:Dataset ; 
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

    updateQuery(dataset: Dataset) {
      return `

        ${this.addPrefixes()}

        DELETE {
            GRAPH <${this.graph}> {
                odpr:${dataset.id} ?p ?o .
            }
        }
        INSERT {
            GRAPH <${this.graph}> {
              odpr:${dataset.id} a odpr:Dataset ;
                               odpr:sparqlEndpoint """${dataset.sparqlEndpoint}""" ;
                               odpr:datasetGraph """${dataset.graph}""" ;
                               odpr:label """${dataset.label}""" ;
                               odpr:indexed """${dataset.indexed}""";
                               odpr:id """${dataset.id}""" .
            }
        }
        WHERE {
            GRAPH <${this.graph}> {
                odpr:${dataset.id} a odpr:Dataset ;
                                 ?p ?o .
            }
        }
    `
    }

    getIndexingStatusByDatasetId(datasetId: string)  {
      return `
      
        ${this.addPrefixes()}

        SELECT ?id ?status ?progress ?date WHERE {

          GRAPH <${this.graph}> {

            odpr:${datasetId} a odpr:Dataset ;
              odpr:hasIndexingStatus ?statusUri .
              ?statusUri a odpr:IndexingStatus ;
                  odpr:id ?id ;
                  odpr:status ?status ;
                  odpr:dateTime ?date .

              OPTIONAL {
                odpr:${datasetId} a odpr:Dataset ;
                odpr:hasIndexingStatus ?statusUri .
                ?statusUri a odpr:IndexingStatus ;
                    odpr:progress ?progress2B .
              }
              BIND ( IF (BOUND ( ?progress2B ), ?progress2B, "" )  as ?progress ) .

      }
    }

      `
    }

    createIndexingStatus(datasetId: string, indexingStatus: IndexingStatus) : string {
      return `
        ${this.addPrefixes()}

        INSERT DATA {
          GRAPH <${this.graph}> {
            odpr:${datasetId} odpr:hasIndexingStatus odpr:${indexingStatus.id} .

            odpr:${indexingStatus.id} a odpr:IndexingStatus;
                odpr:id """${indexingStatus.id}""";
                odpr:status """${indexingStatus.status}""";
                odpr:progress """${indexingStatus.progress || ""}""";
                odpr:dateTime """${indexingStatus.dateTime}""" .
          }
      }
      `
    }

    updateIndexingStatus(datasetId: string, indexingStatus: IndexingStatus) {

      return `
        ${this.addPrefixes()}

        DELETE {
          GRAPH <${this.graph}> {
              odpr:${datasetId} odpr:hasIndexingStatus ?statusUri .
              ?statusUri ?p ?o .
          }
        }
        INSERT {
            GRAPH <${this.graph}> {
              odpr:${datasetId} odpr:hasIndexingStatus odpr:${indexingStatus.id} .

              odpr:${indexingStatus.id} a odpr:IndexingStatus;
                  odpr:id """${indexingStatus.id}""";
                  odpr:status """${indexingStatus.status}""";
                  odpr:progress """${indexingStatus.progress || ""}""";
                  odpr:dateTime """${indexingStatus.dateTime}""" .
            }
        }
        WHERE {
          GRAPH <${this.graph}> {
            odpr:${datasetId} odpr:hasIndexingStatus ?statusUri .
            ?statusUri ?p ?o .
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