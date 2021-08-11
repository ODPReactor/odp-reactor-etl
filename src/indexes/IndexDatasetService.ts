import { query } from "express";
import { DatasetRepository } from "../dataset/DatasetRepository";
import { Query } from "../queries/Query";
import { QueryRepository } from "../queries/QueryRepository";
import { InstancesExtractor } from "./InstancesExtractor";

type IndexDatasetServiceInput = {
    datasetId: string
}

type CreateIndexDatasetServiceInput = {
    instancesExtractor? : InstancesExtractor
    queryRepository? : QueryRepository,
    datasetRepository? : DatasetRepository
}

export class IndexDatasetService {

    constructor(private instancesExtractor : InstancesExtractor,
        private queryRepository : QueryRepository,
        private datasetRepository: DatasetRepository) {
    }

    static create({
        instancesExtractor,
        queryRepository,
        datasetRepository,
    } : CreateIndexDatasetServiceInput) {
        return new IndexDatasetService(
            instancesExtractor || InstancesExtractor.create({}),
            queryRepository || QueryRepository.create({}),
            datasetRepository || DatasetRepository.create({})
        )
    }

    async handle({
        datasetId
    } : IndexDatasetServiceInput) {




        const datasetToIndex = await this.datasetRepository.getById(datasetId)
        if (!datasetToIndex) {
            return undefined
        }
        // configure instances extractor with dataset to query
        this.instancesExtractor.sparqlClient.graph = datasetToIndex?.graph
        this.instancesExtractor.sparqlClient.setSparqlEndpoint(datasetToIndex.sparqlEndpoint)


        const queries = await this.queryRepository.getAll()

        const collectionsToRetrieve : {
            query: Query,
            count: number
        }[] = []

        
        queries.forEach(async query => {
            const instancesCount = await this.instancesExtractor.getInstancesCount(query.string)
            if (instancesCount && instancesCount > 0) {
                collectionsToRetrieve.push({
                    query: query,
                    count: instancesCount
                })
            }
        })


        // compute totalCount
        // progress = current count / totalCount

        const instancesBatchSize = 4000
        collectionsToRetrieve.forEach( async (
            collectionToRetrieve
        ) => {
            for( let offset=instancesBatchSize; offset < collectionToRetrieve.count + instancesBatchSize; offset = offset + instancesBatchSize) {
                const instancesDTOs = await this.instancesExtractor.extractInstances({
                    offset : offset,
                    limit:  collectionToRetrieve.count,
                    query: collectionToRetrieve.query.string
                })
                // update currentCount
                // PatternInstanceRepositories.loadBatch()
                // the instanceDTO should have a type patternURI (you get this from Query)
                // and you name the index with the patternURI

                // DatasetRepository.addPattern/Collection(patternURI)   here you map a Dataset with pattern it have
            }
        })

        // DatasetRepository
        //      IndexStatus (non serve senza il Dataset quindi va nella DatasetRepository)
        //      mentre il servizio indicizza scrive queste info nel DB
        //      es.  Stopped. Canceled. Progress. Complete. 
        //      completion %
        //      params to resume
        //      last index data
    }
}