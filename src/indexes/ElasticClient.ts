import { Client as ESClient } from "@elastic/elasticsearch"
import { DeleteIndexInput, IIndexClient, IndexDataInput } from "./IIndexClient"

export class ElasticClient implements IIndexClient<any> {

    client?: ESClient

    constructor(nodeURL? : string | undefined) {
        if (nodeURL) {
        this.client = new ESClient({
            node: nodeURL
            })
        }
    }

    setNodeURL(nodeURL: string) {
        this.client = new ESClient({
            node: nodeURL
        })
    }

    async indexData({index, data} : IndexDataInput) : Promise<void> {
        if (!this.client) {
            throw Error("No connection established to elastic node. Please provide a NodeURL")
        }
        await this.client.index({
            index: index,
            body: data,
            refresh: "wait_for"
        })
        await this.client?.indices.refresh()
    }

    async deleteIndex({ index }: DeleteIndexInput): Promise<void> {

        const itExistsRes = await this.client?.indices.exists({
            index: index
        })

        if (!itExistsRes) {
            throw Error("Error in connection to elastic index ")
        }

        console.log("Exists:", index, itExistsRes.body)

        if (itExistsRes?.body) {
            await this.client?.indices.delete({
                index : index
            })
            await this.client?.indices.refresh()
        }
    }

    async deleteDocuments(index : string, query : any) {
        await this.client?.deleteByQuery({
            index: index,
            body: query
        })
        await this.client?.indices.refresh()
    }

    async searchDocuments(index : string, query : any) : Promise<any> {
        return await this.client?.search({
            index: index,
            body: query
        })
     }
    
}