import { IClient, IRepository, SparqlClient, SparqlDataMapper } from "odp-reactor-persistence-interface";
import { UrlParser } from "../url/UrlParser";
import { Dataset } from "./Dataset";
import { DatasetDataMapper } from "./DatasetDataMapper";
import { DatasetQueryBuilder } from "./DatasetQueryBuilder";

type CreateDatasetRepositoryInput = {
    datasetQueryBuilder? : DatasetQueryBuilder
    dbClient? : SparqlClient
    dataMapper? : DatasetDataMapper
}

export class DatasetRepository implements IRepository {


    dbClient: SparqlClient;
    datasetQueryBuilder: DatasetQueryBuilder;
    urlParser: UrlParser;
    dataMapper: DatasetDataMapper;


    constructor(dbClient : SparqlClient, datasetQueryBuilder: DatasetQueryBuilder, dataMapper : DatasetDataMapper) {
        this.dbClient = dbClient
        this.datasetQueryBuilder = datasetQueryBuilder
        this.urlParser = new UrlParser()
        this.dataMapper = dataMapper
    }

    static create({
        dbClient,
        datasetQueryBuilder,
        dataMapper
    } : CreateDatasetRepositoryInput) {
        if (!dbClient) {

            const configSparqlEndpoint = process.env.CONFIG_SPARQL_ENDPOINT_URI
            const configGraph = process.env.CONFIG_GRAPH
            if (!configSparqlEndpoint && !configGraph) {
                throw new Error("process.env.CONFIG_GRAPH and process.env.CONFIG_SPARQL_ENDPOINT_URI not found. Cannot instance repository")
            }

            dbClient = new SparqlClient(configSparqlEndpoint, configGraph)
        }

        if (!datasetQueryBuilder) {
            if (!dbClient.graph) {
                throw new Error("no config graph for dataset query builder")
            }
            datasetQueryBuilder = new DatasetQueryBuilder(dbClient.graph)
        }

        if (!dataMapper) {
            dataMapper = new DatasetDataMapper()
        }


        return new DatasetRepository(dbClient, datasetQueryBuilder, dataMapper)
    }

    async create(dataset: Dataset) : Promise<void> {
        await this.dbClient.sendUpdateRequest({
            query: this.datasetQueryBuilder.createDataset(dataset)
        })
    }

    async getAll(noCache: boolean=true) : Promise<Dataset[]> {
        if (noCache) {
            await this.dbClient.invalidateCache()
        }
        const datasetBindings = await this.dbClient.sendRequest({
            query: this.datasetQueryBuilder.getAllDatasets()
        })


        const sparqlDataMapper = new SparqlDataMapper()

        const queryResults = await sparqlDataMapper.parseBindings(datasetBindings)


        return queryResults.map((queryResult: any) => {
            return this.dataMapper.toEntity({
                id: queryResult.id,
                label: queryResult.label,
                sparqlEndpoint: queryResult.sparqlEndpoint,
                graph: queryResult.graphName,
                indexed: (queryResult.indexed === "true")
            })        
        })
    }

    async getById(datasetId: string, noCache : boolean=true) : Promise<Dataset | undefined> {
        if (noCache) {
            await this.dbClient.invalidateCache()
        }
        const queryBindings = await this.dbClient.sendRequest({
            query: this.datasetQueryBuilder.getById(datasetId) 
        })
        const sparqlDataMapper = new SparqlDataMapper()
        const queryResults = await sparqlDataMapper.parseBindings(queryBindings)

        return queryResults[0] ? this.dataMapper.toEntity({
            id: queryResults[0].id,
            label: queryResults[0].label,
            graph: queryResults[0].graphName,
            sparqlEndpoint: queryResults[0].sparqlEndpoint,
            indexed: (queryResults[0].indexed === "true")
        }) : undefined
    }

    // async delete(queryId: string) : Promise<void> {
    //     await this.dbClient.sendUpdateRequest({
    //         query: this.queryBuilder.deleteQuery(queryId)
    //     })
    // }

    // async update(query: Query) : Promise<void> { 
    //     await this.dbClient.sendUpdateRequest({
    //         query: this.queryBuilder.updateQuery(query)
    //     })
    // }

}