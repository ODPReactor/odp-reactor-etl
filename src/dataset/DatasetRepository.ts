import { IClient, IRepository, SparqlClient } from "odp-reactor-persistence-interface";
import { UrlParser } from "../url/UrlParser";
import { Dataset } from "./Dataset";
import { DatasetQueryBuilder } from "./DatasetQueryBuilder";

type CreateDatasetRepositoryInput = {
    datasetQueryBuilder? : DatasetQueryBuilder
    dbClient : SparqlClient
}

export class DatasetRepository implements IRepository {


    dbClient: IClient;
    datasetQueryBuilder: DatasetQueryBuilder;
    urlParser: UrlParser;

    constructor(dbClient : IClient, datasetQueryBuilder: DatasetQueryBuilder) {
        this.dbClient = dbClient
        this.datasetQueryBuilder = datasetQueryBuilder
        this.urlParser = new UrlParser()
    }

    static create({
        dbClient,
        datasetQueryBuilder
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

        return new DatasetRepository(dbClient, datasetQueryBuilder)
    }

    async getDatasetById(datasetId : string) {

        const configRes = await this.dbClient.sendRequest(
            this.datasetQueryBuilder.getConfigByDatasetId(datasetId)
        );
        const config = configRes[0];

        const sparqlEndpoint = `${config.protocol}://${config.host}${
            config.port != '' ? `:${config.port}` : ''
        }${config.path}`

        const graph = config.graph

        return Dataset.create({
            datasetId: datasetId, 
            sparqlEndpoint: sparqlEndpoint, 
            graph: graph}
            )
    }

    async getDatasetBySparqlEndpointAndGraph(sparqlEndpoint : string, graph : string) {
 
        
        const { host, sparqlPath } = this.getHostAndPathBySparqlEndpoint(sparqlEndpoint)

        if (!host || !sparqlPath) {
            throw new Error(`Cannot extract host and sparql path from sparql endpoint string: ${sparqlEndpoint}`)
        }

        const configRes = await this.dbClient.sendRequest(
            this.datasetQueryBuilder.getConfigBySparqlEndpointHostAndPathAndGraph(
                {
                    host: host,
                    sparqlPath: sparqlPath,
                    graph: graph
                }
            )
        );
        const config = configRes[0];

        return config ? Dataset.create({
            datasetId: config.datasetId,
            sparqlEndpoint: sparqlEndpoint,
            graph: graph
        }) : undefined
    }

    getHostAndPathBySparqlEndpoint(sparqlEndpoint : string) {
        const host = this.urlParser.getHost(sparqlEndpoint);
        const sparqlPath = this.urlParser.getPath(sparqlEndpoint);
        return {
            host: host,
            sparqlPath: sparqlPath
        }
    }


}