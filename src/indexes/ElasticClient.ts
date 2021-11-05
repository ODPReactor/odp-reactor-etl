import { Client as ESClient } from "@elastic/elasticsearch"
import { IClient } from "odp-reactor-persistence-interface"

type IndexDataInput = {
    index: string,
    data: any
}

type DeleteIndexInput = {
    index: string
}

export class ElasticClient implements IClient {

    client?: ESClient

    constructor(nodeURL? : string | undefined) {
        if (nodeURL) {
        this.client = new ESClient({
            node: nodeURL
            })
        }
    }

    sendRequest(requestInput: any): Promise<any> {
        throw new Error("Method not implemented.")
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

    private async indexExists(index: string) {
        const itExistsRes = await this.client?.indices.exists({
            index: index
        })

        if (!itExistsRes) {
            throw Error("Error in connection to elastic index ")
        }

        return itExistsRes?.body
    }


  
    async deleteIndex({ index }: DeleteIndexInput): Promise<void> {

        const itExists = await this.indexExists(index)

        if (itExists) {
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

        const itExists = await this.indexExists(index)


        return itExists ? await this.client?.search({
            index: index,
            body: query
        }) : undefined
    }



    async loadBulkDocuments(index: string, docs: any[]) : Promise<void> {

        const body = docs.flatMap(doc => [{ index: { _index: index } }, doc])

        const res = await this.client?.bulk({ refresh: true, body })


        if (res?.body.errors) {

            // collect errored documents and log them

            const erroredDocuments: {
                // If the status is 429 it means that you can retry the document,
                // otherwise it's very likely a mapping error, and you should
                // fix the document before to try it again.
                status: any; error: any; operation: any; document: any
            }[] = []

            res.body.items.forEach((action : any, i : any) => {
                const operation = Object.keys(action)[0]
                if (action[operation].error) {
                  erroredDocuments.push({
                    // If the status is 429 it means that you can retry the document,
                    // otherwise it's very likely a mapping error, and you should
                    // fix the document before to try it again.
                    status: action[operation].status,
                    error: action[operation].error,
                    operation: body[i * 2],
                    document: body[i * 2 + 1]
                  })
                }
              })
              console.log("Errored documents:", erroredDocuments)
        }

    }
    
}