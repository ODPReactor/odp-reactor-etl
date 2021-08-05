import { IRepository } from "odp-reactor-persistence-interface";
import { ElasticClient } from "./ElasticClient";
import { IIndexClient } from "./IIndexClient";
import { Index } from "./Index";
import { IndexDataMapper, IndexDTO } from "./IndexDataMapper";

function throwNoIndexUrlError() : void {
    throw Error("No es index url specified")
}

type CreateIndexRepositoryInput = {
    dataMapper?: IndexDataMapper
    client?: IIndexClient<any>
    mappingIndexName?: string
}

export class IndexRepository implements IRepository {
    
    dataMapper: IndexDataMapper;
    client: IIndexClient<any>;
    mappingIndexName: string;

    /**
     * 
     * @param dataMapper 
     * @param client Client to connect to the index
     * @param mappingIndexName The name of index storing mapping between an index and a sparql endpoint and a graph
     */
    constructor(dataMapper: IndexDataMapper, client : IIndexClient<any>, mappingIndexName : string){
        this.dataMapper = dataMapper
        this.client = client
        this.mappingIndexName = mappingIndexName
    }

    static create({
        dataMapper,
        client,
        mappingIndexName
    } : CreateIndexRepositoryInput) {
        if (!client && !process.env.ES_INDEX_URL) {
            throwNoIndexUrlError()
        }
        return new IndexRepository(dataMapper || new IndexDataMapper(), client || new ElasticClient(process.env.ES_INDEX_URL), mappingIndexName || "indexmap")
    }

    async createIndex(input : IndexDTO) : Promise<Index> {

        const index = Index.create(input)

        this.client.indexData({
            index: this.mappingIndexName,
            data: index.toJSON(),
        })

        return index
    }

    /**
     * Deletes a mapping between a sparqlEndpoint and a graph and an index
     * It deletes both the mapping from <mappingIndexName> { id, graph, sparqlEndpoint } and all the data in the index with name <id> { }
     * 
     * @param input 
     */
    async deleteIndexMapping(input: IndexDTO) : Promise<void> {     

        if (input.indexName) {
            try {
                await this.client.deleteIndex({index: input.indexName}) // delete the index with documents
            } catch(err) {
                // console.log("[!] deleteIndexMapping error", err)
            }
            await this.client.deleteDocuments(this.mappingIndexName ,{
                query: {
                    bool: {
                        filter : [
                            { match: { indexName: input.indexName } }
                        ]
                    }
                }
            })
        } else {
            const indexToDelete = await this.getMappingBySparqlEndpointAndGraph(input)

            if (indexToDelete) {
                try {
                    await this.client.deleteIndex({index: indexToDelete.getIndexName()})
                } catch(err) {
                    // console.log("[!] deleteIndexMapping error", err)
                }
                await this.client.deleteDocuments(this.mappingIndexName, {
                    query: {
                        bool: {
                            filter : [
                                { match: { indexName: indexToDelete.getIndexName() } }
                            ]
                        }
                    }
                })
            }
        }
    }

    async getMappingBySparqlEndpointAndGraph(input: IndexDTO) : Promise<Index | undefined> {
        if (!input.sparqlEndpoint || !input.graph) {
            return undefined
        }
        const response = await this.client.searchDocuments(this.mappingIndexName, {
            query: {
                bool: {
                    filter : [ 
                        { match: { graph : input.graph } },
                        { match: { sparqlEndpoint: input.sparqlEndpoint}}
                    ],
                    must : [ { match_all : {} }] // makes score to 1.0 to all retrieved documents
                }
            } 
        })
       if (response.body.hits.hits[0]) {
           const indexDTO = response.body.hits.hits[0]._source
           return this.dataMapper.toEntity(indexDTO)
       } else {
           return undefined
       }
    }

    setMappingIndexName(indexName : string) {
        this.mappingIndexName = indexName
    }
}