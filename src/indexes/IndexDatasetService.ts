import { DatasetRepository } from "../dataset/DatasetRepository";
import { PatternInstanceRepository } from "../patterninstances/PatternInstanceRepository";
import { Query } from "../queries/Query";
import { QueryRepository } from "../queries/QueryRepository";
import { InstancesExtractor } from "./InstancesExtractor";
import { ProgressCounter } from "./progress/ProgressCounter";

type IndexDatasetServiceInput = {
    datasetId: string,
    options?: IndexDatasetServiceOptions
}

type IndexDatasetServiceOptions = {
    batchSize?: number
}

type CreateIndexDatasetServiceInput = {
    instancesExtractor? : InstancesExtractor
    queryRepository? : QueryRepository,
    datasetRepository? : DatasetRepository
}


const DEFAULT_BATCH_SIZE = 4000

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
        datasetId,
        options
    } : IndexDatasetServiceInput) : Promise<void> {




        const datasetToIndex = await this.datasetRepository.getById(datasetId)
        if (!datasetToIndex) {
            return undefined
        }
        // configure instances extractor with dataset to query
        datasetToIndex.graph && this.instancesExtractor.setGraph(datasetToIndex.graph)
        this.instancesExtractor.setSparqlEndpoint(datasetToIndex.sparqlEndpoint)



        const collectionQueries = await this.queryRepository.getAll()

        const collectionsToRetrieve : {
            query: Query,
            count: number
        }[] = []

       
        for (const query of collectionQueries)  {
            // find total count of items for every collection
            const instancesCount = await this.instancesExtractor.getInstancesCount(query.string)

            if (instancesCount && instancesCount > 0) {

                collectionsToRetrieve.push({
                    query: query,
                    count: instancesCount
                })
            } 
        }



        const totalCollectionToIndex = collectionsToRetrieve.reduce((accumulator, currentValue)=> {
            return accumulator + currentValue.count
        },0)
        const progressCounter = new ProgressCounter(0, totalCollectionToIndex)


        const instancesBatchSize = options && options.batchSize ? options.batchSize : DEFAULT_BATCH_SIZE 



        for (const collectionToRetrieve of collectionsToRetrieve) {



            // DatasetRepository.addPattern/Collection(patternURI)   here you map a Dataset with patterns it have



            for( let offset=0; offset < collectionToRetrieve.count + instancesBatchSize; offset = offset + instancesBatchSize) {

                // check in the db what i have to do (continue, cancel)

                const instancesDTOs = await this.instancesExtractor.extractInstances({
                    offset : offset,
                    limit:  instancesBatchSize,
                    query: collectionToRetrieve.query.string
                })
                progressCounter.updateProgress(instancesDTOs.length)

                
                // PatternInstanceRepositories.loadBatch()
                // the instanceDTO should have a type patternURI (you get this from Query)
                // and you name the index with the patternURI

                // DatasetRepository.updateIndexStatus()

            }
        }

        // DatasetRepository
        //      IndexStatus (non serve senza il Dataset quindi va nella DatasetRepository)
        //      mentre il servizio indicizza scrive queste info nel DB
        //      es.  Stopped. Canceled. Progress. Complete. 
        //      completion %
        //      params to resume
        //      last index data
    }
}