import { IRepository, SparqlClient, SparqlDataMapper } from "odp-reactor-persistence-interface";
import { Query } from "./Query";
import { QueryDataMapper } from "./QueryDataMapper";
import { RepositoryQueryBuilder } from "./RepositoryQueryBuilder";

type CreateQueryRepositoryInput = {
    dbClient?: SparqlClient
    queryBuilder?: RepositoryQueryBuilder 
    dataMapper? : QueryDataMapper
}

export class QueryRepository implements IRepository {

    dbClient: SparqlClient;
    queryBuilder: RepositoryQueryBuilder;
    dataMapper: QueryDataMapper;

    constructor(dbClient: SparqlClient, queryBuilder: RepositoryQueryBuilder, dataMapper : QueryDataMapper) {
        this.dbClient = dbClient
        this.queryBuilder = queryBuilder
        this.dataMapper = dataMapper
    }

    static create({
        dbClient,
        queryBuilder,
        dataMapper
    } : CreateQueryRepositoryInput) : QueryRepository {

        if (!dbClient) {

            const configSparqlEndpoint = process.env.CONFIG_SPARQL_ENDPOINT_URI
            const configGraph = process.env.CONFIG_GRAPH

            if (!configSparqlEndpoint && !configGraph) {
                throw new Error("process.env.CONFIG_GRAPH and process.env.CONFIG_SPARQL_ENDPOINT_URI not found. Cannot instance repository")
            }

            dbClient = new SparqlClient(configSparqlEndpoint, configGraph)
        }

        if (!queryBuilder) {
            if (!dbClient.graph) {
                throw new Error("no config graph for dataset query builder")
            }
            queryBuilder = new RepositoryQueryBuilder(dbClient.graph)
        }

        if (!dataMapper) {
            dataMapper = new QueryDataMapper()
        }

        return new QueryRepository(dbClient, queryBuilder, dataMapper)
    }

    async getAll(noCache : boolean =true) : Promise<Query[]> {

        if (noCache) {
            await this.dbClient.invalidateCache()
        }
        const queryBindings = await this.dbClient.sendRequest({
            query: this.queryBuilder.getAllQueries()
        })

        const sparqlDataMapper = new SparqlDataMapper()

        const queryResults = await sparqlDataMapper.parseBindings(queryBindings)

      
        return queryResults.map((queryResult : any) => {
            return this.dataMapper.toEntity({
                id: queryResult.id,
                string: queryResult.queryString,
                patternUri: queryResult.patternUri,
                patternLabel: queryResult.patternLabel
            })
        })
    }

    async getById(queryId: string, noCache : boolean=true) : Promise<Query | undefined> {
        if (noCache) {
            await this.dbClient.invalidateCache()
        }
        const queryBindings = await this.dbClient.sendRequest({
            query: this.queryBuilder.getById(queryId) 
        })

        const sparqlDataMapper = new SparqlDataMapper()

        const queryResults = await sparqlDataMapper.parseBindings(queryBindings)



        return queryResults[0] ? this.dataMapper.toEntity({
            id: queryResults[0].id,
            string: queryResults[0].queryString,
            patternUri: queryResults[0].patternUri,
            patternLabel: queryResults[0].patternLabel
        }) : undefined
    }

    async create(query: Query) : Promise<void> {
        await this.dbClient.sendUpdateRequest({
            query: this.queryBuilder.createQuery(query)
        })
    }

    async delete(queryId: string) : Promise<void> {
        await this.dbClient.sendUpdateRequest({
            query: this.queryBuilder.deleteQuery(queryId)
        })
    }

    async update(query: Query) : Promise<void> { 
        await this.dbClient.sendUpdateRequest({
            query: this.queryBuilder.updateQuery(query)
        })
    }

}
