import { nanoid } from "nanoid";
import { IRepository, SparqlClient, SparqlDataMapper } from "odp-reactor-persistence-interface";
import { IndexingStatus, IndexingStatusEnum } from "../indexes/IndexingStatus";
import { Pattern } from "../pattern/Pattern";
import { PatternDataMapper } from "../pattern/PatternDataMapper";
import { PatternDTO } from "../pattern/PatternDTO";
import { UrlParser } from "../url/UrlParser";
import { Dataset } from "./Dataset";
import { DatasetDataMapper } from "./DatasetDataMapper";
import { DatasetQueryBuilder } from "./DatasetQueryBuilder";

type CreateDatasetRepositoryInput = {
    datasetQueryBuilder? : DatasetQueryBuilder
    dbClient? : SparqlClient
    dataMapper? : DatasetDataMapper
    patternDataMapper? : PatternDataMapper
}

export class DatasetRepository implements IRepository {


    dbClient: SparqlClient;
    datasetQueryBuilder: DatasetQueryBuilder;
    urlParser: UrlParser;
    dataMapper: DatasetDataMapper;
    patternDataMapper: PatternDataMapper;


    constructor(dbClient : SparqlClient, datasetQueryBuilder: DatasetQueryBuilder, dataMapper : DatasetDataMapper, patternDataMapper : PatternDataMapper) {
        this.dbClient = dbClient
        this.datasetQueryBuilder = datasetQueryBuilder
        this.urlParser = new UrlParser()
        this.dataMapper = dataMapper
        this.patternDataMapper = patternDataMapper
    }

    static create({
        dbClient,
        datasetQueryBuilder,
        dataMapper,
        patternDataMapper
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

        if (!patternDataMapper) {
            patternDataMapper = new PatternDataMapper()
        }


        return new DatasetRepository(dbClient, datasetQueryBuilder, dataMapper, patternDataMapper)
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
                graph: queryResult.graphName && queryResult.graphName !== "undefined" ? queryResult.graphName : undefined ,
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
            graph: queryResults[0].graphName && queryResults[0].graphName !== "undefined" ? queryResults[0].graphName : undefined,
            sparqlEndpoint: queryResults[0].sparqlEndpoint,
            indexed: (queryResults[0].indexed === "true")
        }) : undefined
    }

    async delete(datasetId: string) : Promise<void> {
        await this.dbClient.sendUpdateRequest({
            query: this.datasetQueryBuilder.deleteQuery(datasetId)
        })
    }

    async update(dataset: Dataset) : Promise<void> { 
        await this.dbClient.sendUpdateRequest({
            query: this.datasetQueryBuilder.updateQuery(dataset)
        })
    }

    async getAllPatternsByDatasetId(datasetId: string) {

        const queryBindings = await this.dbClient.sendRequest({
            query: this.datasetQueryBuilder.getAllDatasetPatterns(datasetId)
        })

        const sparqlDataMapper = new SparqlDataMapper()
        const queryResults = await sparqlDataMapper.parseBindings(queryBindings)

        return queryResults.map((d: PatternDTO) => {
           return this.patternDataMapper.toEntity(d)
        })

    }

    async addPattern(datasetId: string, pattern: Pattern) : Promise<void> {

        const patterns = await this.getAllPatternsByDatasetId(datasetId)

        if (patterns.length === 0) {

            await this.dbClient.sendUpdateRequest({
                query: this.datasetQueryBuilder.createPatternCollection(datasetId, [pattern])
            })
        } else {
            await this.dbClient.sendUpdateRequest({
                
                query: this.datasetQueryBuilder.addPattern(datasetId, pattern)
            })
        }
    }

    async updateIndexingStatus(datasetId: string, status: IndexingStatus) : Promise<void> {

        const oldIndexingStatus = await this.getIndexingStatusByDatasetId(datasetId)

        // if no indexing status create a new one else replace data where present and add set existing where present

        status = oldIndexingStatus ? {
            id: oldIndexingStatus.id,
            status: status.status ? status.status : oldIndexingStatus.status,
            progress: status.progress ? status.progress : oldIndexingStatus.progress,
            dateTime: new Date().toString()
        } : {
            id: nanoid(),
            status: status.status,
            progress: status.progress,
            dateTime: new Date().toString()
        }
        
        oldIndexingStatus ? await this.dbClient.sendUpdateRequest({
            query: this.datasetQueryBuilder.updateIndexingStatus(datasetId, status)
        }) : await this.dbClient.sendUpdateRequest({
            query: this.datasetQueryBuilder.createIndexingStatus(datasetId, status)
        })
    }

    async getIndexingStatusByDatasetId(datasetId: string) : Promise<IndexingStatus | undefined> {


        const queryBindings = await this.dbClient.sendRequest({
            query: this.datasetQueryBuilder.getIndexingStatusByDatasetId(datasetId)
        })

        const sparqlDataMapper = new SparqlDataMapper()
        const queryResults = await sparqlDataMapper.parseBindings(queryBindings)

        const data = queryResults[0]

        const indexingStatus = data && data.id ? {
            id: data.id,
            status: data.status,
            progress: data.progress != "" ? parseInt(data.progress) : undefined ,
            dateTime: data.date

        } : undefined

        return indexingStatus
        
    }

    async indexingStatusNotCanceled(datasetId: string) {

        const indexingStatus = await this.getIndexingStatusByDatasetId(datasetId)

        return indexingStatus?.status !== IndexingStatusEnum.CANCELED

    }

}