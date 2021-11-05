import { nanoid } from "nanoid"
import { skipTestIfCI } from "../test/skipTestIfCI"
import { ElasticClient } from "./ElasticClient"


skipTestIfCI(()=>{ describe("ElasticClient test",() =>{

    const elasticTestUrl = process.env.TEST_ES_INDEX_URL

    if (!elasticTestUrl) {
        throw new Error("Cannot run test no process.env.TEST_ES_INDEX_URL specified")
    }

    const indexClient = new ElasticClient(elasticTestUrl)
    const testIndex = "test-index"
    
    test("It should delete document in index by query", async () => {

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

    test("It should bulk load document into index", async () => {

        const index = "bulk-" + nanoid().toLowerCase()


        const docs = [
            {
                name: "Pluto",
                age: 20,
                id: 1
            },
            {
                name: "Minnie",
                age: 30,
            }
        ]

        await indexClient.loadBulkDocuments(index, docs)

        const res = await indexClient.searchDocuments(index, {
            query : {
                match_all : {}
            }
        })

        const uploaded = res.body.hits.hits
        expect(uploaded).toBeDefined()

        const pluto = res.body.hits.hits[0]._source

        expect(pluto.age).toBe(20)
        expect(pluto.name).toBe("Pluto")


        await indexClient.deleteIndex({ index: index })

        })
    })
})