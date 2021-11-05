import { IRepository,  } from "odp-reactor-persistence-interface";
import { ElasticClient } from "../indexes/ElasticClient";
import { PatternInstance } from "./PatternInstance";
import { PatternInstanceDataMapper } from "./PatternInstanceDataMapper";

type CreatePatternInstanceRepositoryInput = {
    dbClient?: ElasticClient
    dataMapper? : PatternInstanceDataMapper
}

export class PatternInstanceRepository implements IRepository {


    indexNamePrefix : string = "pattern_collection_"

    constructor(public dbClient : ElasticClient, public dataMapper: PatternInstanceDataMapper) {
    }

    static create({
        dbClient,
        dataMapper
    } : CreatePatternInstanceRepositoryInput) {
        if (!dbClient) {

            const elasticURL = process.env.ES_INDEX_URL

            if (!elasticURL) {
                throw new Error("process.env.ES_INDEX_URL not found. Cannot instance repository")
            }

            dbClient = new ElasticClient(elasticURL)
        }
    
        return new PatternInstanceRepository(dbClient, dataMapper || new PatternInstanceDataMapper())
    }


    async loadInstances(patternInstances: PatternInstance[]) {

        if (!(patternInstances.length > 0)) {
            return
        }

        const patternId = patternInstances[0].patternId

        await this.dbClient.loadBulkDocuments(patternId , patternInstances.map(p => {
            return this.dataMapper.toDto(p)
        }))
    }

    async getAllByPattern(type: string) : Promise<PatternInstance[]> {

        const results = await this.dbClient.searchDocuments(type, {
            query : {
                match_all : {}
            }
        })

        if (!results || !results.body.hits.hits) {
            return []
        }

        results.body.hits.hits._source

        return results.body.hits.hits.map((res : any) => {

            const data = res._source

            return this.dataMapper.toEntity({
                id: data.id,
                type: data.type,
                patternId: data.patternId,
                data: data.data
            })
        })

    }

    async deleteInstancesByType(type: string) : Promise<void> {

        await this.dbClient.deleteIndex({
            index: type
        })

    }

}