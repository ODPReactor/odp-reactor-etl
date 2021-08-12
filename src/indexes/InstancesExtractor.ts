import { SparqlClient, SparqlDataMapper } from "odp-reactor-persistence-interface";
import { SparqlQueryParser } from "../sparql/SparqlQueryParser";

export class InstancesExtractor {

    constructor(private sparqlQueryParser :  SparqlQueryParser, 
        public sparqlClient: SparqlClient,
        private sparqlDataMapper : SparqlDataMapper) {
        this.sparqlQueryParser = sparqlQueryParser
        this.sparqlClient = sparqlClient
    }

    static create({ sparqlQueryParser, 
                    sparqlClient,
                    sparqlDataMapper,    
    } : { sparqlQueryParser?: SparqlQueryParser, 
        sparqlClient? : SparqlClient,
        sparqlDataMapper?   : SparqlDataMapper}) {
        return new InstancesExtractor(sparqlQueryParser || new SparqlQueryParser(),
                            sparqlClient || new SparqlClient(),
                            sparqlDataMapper || new SparqlDataMapper()
        )
    }

    async getInstancesCount(query: string) : Promise<number | undefined> {

        const countQuery = this.sparqlQueryParser.toCountResultsQuery(query)


        if (!countQuery) {
            return 
        }

        const countBindings = await this.sparqlClient.sendRequest({
            query: countQuery
        })

        const results = await this.sparqlDataMapper.parseBindings(countBindings)

        if (!results) {
            return undefined
        }
        return Number.parseInt(results[0].count)
    }

    async extractInstances({
        offset,
        limit,
        query
    } : ExtractInstancesInput) {

        const batchQuery = this.sparqlQueryParser.toLimitOffsetQuery(query, offset, limit)

        // console.log(batchQuery)

        const batchInstancesBindings = await this.sparqlClient.sendRequest({
            query: batchQuery
        })

        const results = await this.sparqlDataMapper.parseBindings(batchInstancesBindings)

        return results

    }

}

type ExtractInstancesInput = {
    offset: number,
    limit: number,
    query: string
}