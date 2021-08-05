import { ElasticClient } from "./ElasticClient"

describe.skip("ElasticClient test",() =>{

    const elasticTestUrl = process.env.TEST_ES_INDEX_URL

    const indexClient = new ElasticClient(elasticTestUrl)
    const testIndex = "test-index"
    
    test.skip("It should delete document in index by query", async () => {

        await indexClient.deleteIndex({
            index: testIndex
        })

        await indexClient.indexData({
            index: testIndex,
            data: {
                name: "John",
                surname: "Doe"
            }
        })

        const res = await indexClient.searchDocuments(testIndex, {
            query: {
                bool: {
                    filter : [ 
                        { match: { name : "John" } },
                        { match: { surname: "Doe"}}
                    ],
                    must : [ { match_all : {} }] // makes score to 1.0 to all retrieved documents
                }
            } 
        })

        const johnDoe = res.body.hits.hits[0]._source

        expect(johnDoe).toBeDefined()
        expect(johnDoe.name).toBe("John")
        expect(johnDoe.surname).toBe("Doe")

        await indexClient.deleteDocuments(testIndex, {
            query: {
                bool: {
                    filter : [
                        { match: { name: "John" } },
                        { match: { surname: "Doe"} }
                    ]
                }}})
        
        const res2 = await indexClient.searchDocuments(testIndex, {
               query: {
                        bool: {
                            filter : [ 
                                { match: { name : "John" } },
                                { match: { surname: "Doe"}}
                            ],
                            must : [ { match_all : {} }] // makes score to 1.0 to all retrieved documents
                        }
                    } 
                })

        expect(res2.body.hits.hits[0]).toBeUndefined()

        await indexClient.deleteIndex({ index: testIndex})
                
    })
})
