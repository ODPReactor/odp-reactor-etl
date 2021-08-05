import { IQueryBuilder } from "odp-reactor-persistence-interface";
import { ODPRSparqlQueryBuilder } from "../sparql/SparqlQueryBuilder";
import { Query } from "./Query";

export class RepositoryQueryBuilder extends ODPRSparqlQueryBuilder implements IQueryBuilder  {
    
    graph: string;

    constructor(graph : string) {
        super();
        this.graph = graph
    }

    getAllQueries() {
        return `
            ${this.addPrefixes()}

            SELECT * WHERE {
                GRAPH <${this.graph}> {
                    ?queryURI a odpr:Query ;
                        odpr:queryString ?queryString ;
                        odpr:isQueryForPattern ?patternUri ;
                        odpr:patternLabel ?patternLabel ;
                        odpr:id ?id .
                }
            }
        `
    }

    getById(queryId: string) {
        return `
            ${this.addPrefixes()}

            SELECT * WHERE {
                GRAPH <${this.graph}> {
                    odpr:${queryId} a odpr:Query ;
                        odpr:queryString ?queryString ;
                        odpr:isQueryForPattern ?patternUri ;
                        odpr:patternLabel ?patternLabel ;
                        odpr:id ?id .
                }
            }
        `
    }

    createQuery(query: Query) : string {
       return  `
            ${this.addPrefixes()}

            INSERT DATA {
                GRAPH <${this.graph}> {
                    odpr:${query.id} a odpr:Query ;
                                     odpr:queryString """${query.string}""" ;
                                     odpr:isQueryForPattern <${query.patternUri}> ;
                                     odpr:patternLabel """${query.patternLabel}""" ;
                                     odpr:id """${query.id}""" .
                }
            }
        `
    }

    deleteQuery(queryId : string) : string {
        return `

            ${this.addPrefixes()}

            DELETE { 
                GRAPH <${this.graph}> {
                    odpr:${queryId} ?p ?o . 
                    }
                }
            WHERE {
                    GRAPH <${this.graph}> {
                    odpr:${queryId} a odpr:Query .
                    odpr:${queryId} ?p ?o .
                }
            }
        `
    }

    updateQuery(query: Query) : string {
        return `

            ${this.addPrefixes()}

            DELETE {
                GRAPH <${this.graph}> {
                    odpr:${query.id} ?p ?o .
                }
            }
            INSERT {
                GRAPH <${this.graph}> {
                    odpr:${query.id} a odpr:Query ;
                                     odpr:queryString """${query.string}""" ;
                                     odpr:isQueryForPattern <${query.patternUri}> ;
                                     odpr:patternLabel """${query.patternLabel}""" ;
                                     odpr:id """${query.id}""" .
                }
            }
            WHERE {
                GRAPH <${this.graph}> {
                    odpr:${query.id} a odpr:Query ;
                                     ?p ?o .
                }
            }
        `
    }
}