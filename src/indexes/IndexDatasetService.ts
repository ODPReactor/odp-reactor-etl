import { DatasetRepository } from "../dataset/DatasetRepository";
import { Pattern } from "../pattern/Pattern";
import { PatternInstance } from "../patterninstances/PatternInstance";
import { PatternInstanceDTO } from "../patterninstances/PatternInstanceDTO";
import { PatternInstanceRepository } from "../patterninstances/PatternInstanceRepository";
import { Query } from "../queries/Query";
import { QueryRepository } from "../queries/QueryRepository";
import { IndexingStatusEnum } from "./IndexingStatus";
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
    datasetRepository? : DatasetRepository,
    patternInstanceRepository?: PatternInstanceRepository
}


const DEFAULT_BATCH_SIZE = 4000

export class IndexDatasetService {

    constructor(private instancesExtractor : InstancesExtractor,
        private queryRepository : QueryRepository,
        private datasetRepository: DatasetRepository,
        private patternInstanceRepository: PatternInstanceRepository) {
    }

    static create({
        instancesExtractor,
        queryRepository,
        datasetRepository,
        patternInstanceRepository
    } : CreateIndexDatasetServiceInput) {
        return new IndexDatasetService(
            instancesExtractor || InstancesExtractor.create({}),
            queryRepository || QueryRepository.create({}),
            datasetRepository || DatasetRepository.create({}),
            patternInstanceRepository || PatternInstanceRepository.create({})
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



        // here progress is 0 we set status to RUNNING
        await this.datasetRepository.updateIndexingStatus(datasetToIndex.getId(), {
            status: IndexingStatusEnum.RUNNING,
            progress: progressCounter.getProgress()
        })

        // here start the running
        for (const collectionToRetrieve of collectionsToRetrieve) {

            const extractedPattern = Pattern.create({
                uri: collectionToRetrieve.query.patternUri,
                label: collectionToRetrieve.query.patternLabel
            })



            await this.datasetRepository.addPattern(datasetToIndex.getId(), extractedPattern)


            for( let offset=0; offset < collectionToRetrieve.count + instancesBatchSize; offset = offset + instancesBatchSize) {


                await this.datasetRepository.indexingStatusNotCanceled(datasetToIndex.getId())

                // check in the db what i have to do (continue, cancel)

                const instancesDTOs = await this.instancesExtractor.extractInstances({
                    offset : offset,
                    limit:  instancesBatchSize,
                    query: collectionToRetrieve.query.string
                })


                // PatternInstanceRepositories.loadBatch()
                // the instanceDTO should have a type patternURI (you get this from Query)
                // and you name the index with the patternURI

                await this.patternInstanceRepository.loadInstances(
                    instancesDTOs.map((instanceData : any) => {
                        return PatternInstance.create({
                            type: collectionToRetrieve.query.patternUri,
                            data: instanceData,
                            patternId: extractedPattern.id,
                            datasetId: datasetToIndex.getId()
                        })
                    })
                )


                // update progress status
                progressCounter.updateProgress(instancesDTOs.length)
                await this.datasetRepository.updateIndexingStatus(datasetToIndex.getId(), {
                    progress: progressCounter.getProgress()
                })                
            }
        }



        // update indexing status to complete!
        await this.datasetRepository.updateIndexingStatus(datasetToIndex.getId(),
        {
            status: IndexingStatusEnum.COMPLETED,
            progress: progressCounter.getProgress()
        })



    }
}