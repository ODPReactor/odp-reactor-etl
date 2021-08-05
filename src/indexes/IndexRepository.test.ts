import { nanoid } from "nanoid"
import { IndexTestHelper } from "./test/IndexTestHelper"
import { ElasticClient } from "./ElasticClient"
import { IndexRepository } from "./IndexRepository"


describe.skip("IndexRepository test",() =>{

    const elasticTestUrl = process.env.TEST_ES_INDEX_URL

    const indexTestHelper = new IndexTestHelper()
    const indexClient = new ElasticClient(elasticTestUrl)



    test.skip("It should create a new index", async () => {

        const testIndex = indexTestHelper.generateUniqueIndexName()
        const indexRepo = IndexRepository.create({
            client : indexClient,
            mappingIndexName : testIndex
        })

        const testGraph = "TestGraph" + nanoid()
        const testSpEndpoint = "https://localhost:9090/sparql" + nanoid()
    
    
        const index = await indexRepo.createIndex({
            sparqlEndpoint : testSpEndpoint,
            graph: testGraph
        })



        expect(index).toBeDefined()
        expect(index.getGraph()).toBe(testGraph)
        expect(index.getSparqlEndpoint()).toBe(testSpEndpoint)

        await new Promise(resolve => setTimeout(resolve, 5000));

        console.log("Index to delete", testIndex, JSON.stringify(index))
        await indexClient.deleteIndex({
            index: testIndex
        })
    })

    test.skip("It should silently return undefined for not existing index", async () => {

        const testIndex = indexTestHelper.generateUniqueIndexName()
        const indexRepo = IndexRepository.create({
            client : indexClient,
            mappingIndexName : testIndex
        })
    
        const index = await indexRepo.getMappingBySparqlEndpointAndGraph({
            sparqlEndpoint: "not existing",
            graph: "not existing"
        })
        expect(index).toBeUndefined()

        try {
            await indexClient.deleteIndex({
                index: testIndex
            })
        } catch(err) {

        }

    })

    test.skip("It should return index mapping from the index", async () => {

        const testIndex = indexTestHelper.generateUniqueIndexName()
        const indexRepo = IndexRepository.create({
            client : indexClient,
            mappingIndexName : testIndex
        })
    

        const endpoint = "endpoint4" + nanoid()
        const graph = "graph4" + nanoid()

        await indexRepo.createIndex({
            sparqlEndpoint: endpoint,
            graph: graph
        })

        const index = await indexRepo.getMappingBySparqlEndpointAndGraph({
            sparqlEndpoint: endpoint,
            graph: graph
        })

        expect(index).toBeDefined()
        expect(index?.getGraph()).toBe(graph)
        expect(index?.getSparqlEndpoint()).toBe(endpoint)

        try {
            await indexClient.deleteIndex({
                index: testIndex
            })
        } catch(err) {

        }

    })

    test.skip("It should silently delete not existing index mapping", async() => {

        const testIndex = indexTestHelper.generateUniqueIndexName()
        const indexRepo = IndexRepository.create({
            client : indexClient,
            mappingIndexName : testIndex
        })
    
        await indexRepo.deleteIndexMapping({
            sparqlEndpoint: "not existing",
            graph: "not existing"
        })

        try {
            await indexClient.deleteIndex({
                index: testIndex
            })
        } catch(err) {

        }

    })

    test.skip("It should delete an index mapping", async () => {

        const testIndex = indexTestHelper.generateUniqueIndexName()
        const indexRepo = IndexRepository.create({
            client : indexClient,
            mappingIndexName : testIndex
        })
    

        const endpoint = "endpoint" + nanoid()
        const graph = "graph4" + nanoid()

        const newIndex = await indexRepo.createIndex({
            sparqlEndpoint: endpoint,
            graph: graph
        })

        await indexRepo.deleteIndexMapping({
            indexName : newIndex.getIndexName(),
            sparqlEndpoint: endpoint,
            graph: graph
        })

        const deletedIndex = await indexRepo.getMappingBySparqlEndpointAndGraph({
            sparqlEndpoint: endpoint,
            graph: graph
        })

        expect(deletedIndex).toBeUndefined()

        try {
            await indexClient.deleteIndex({
                index: testIndex
            })
        } catch(err) {

        }

    })
})