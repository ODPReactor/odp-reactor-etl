import { nanoid } from "nanoid"
import { SparqlClient, SparqlGraphTestHelper } from "odp-reactor-persistence-interface"
import { Dataset } from "../dataset/Dataset"
import { DatasetRepository } from "../dataset/DatasetRepository"
import { PatternInstanceRepository } from "../patterninstances/PatternInstanceRepository"
import { Query } from "../queries/Query"
import { QueryRepository } from "../queries/QueryRepository"
import { catchUnpredictableErrorsFromDependency } from "../test/catchUnpredictableErrorsFromDependency"
import { ElasticClient } from "./ElasticClient"
import { IndexDatasetService } from "./IndexDatasetService"

describe("Test IndexDatasetService, the service to index datasets", () => {

    debugger;

    const testSparqlEndpoint = process.env.TEST_SPARQL_ENDPOINT_URI
    const testEsIndexUrl = process.env.TEST_ES_INDEX_URL
    if (!testSparqlEndpoint || !testEsIndexUrl) {
        throw new Error("Cannot run test no process.env.TEST_SPARQL_ENDPOINT_URI or no process.env.TEST_ES_INDEX_URL specified")
    }


    const graphTester = new SparqlGraphTestHelper()
    graphTester.setTestSparqlEndpoint(testSparqlEndpoint)
    

    test("It handle indexing of a dataset", async () => {


        const testConfigGraph = graphTester.getUniqueGraphId()
        const testToIndexGraph = graphTester.getUniqueGraphId()


        // create config graph
        if (!await catchUnpredictableErrorsFromDependency( async ()=>{ await graphTester.createGraph(testConfigGraph)
        })) {
            console.log("Test skipped as SPARQL endpoint return occasional BAD response: Create test config graph")
            return
        }

        // create data graph
        if (!await catchUnpredictableErrorsFromDependency( async ()=>{ await graphTester.createGraph(testToIndexGraph)
        })) {
            console.log("Test skipped as SPARQL endpoint return occasional BAD response: Create test to index graph")
            return
        }



        const queryRepository = QueryRepository.create({
            dbClient: new SparqlClient(testSparqlEndpoint, testConfigGraph)
        })
        const datasetRepository = DatasetRepository.create({
            dbClient: new SparqlClient(testSparqlEndpoint, testConfigGraph)
        })

        const patternInstancesRepository = PatternInstanceRepository.create({
            dbClient: new ElasticClient(testEsIndexUrl)
        })

        const indexDatasetService = IndexDatasetService.create({
            queryRepository: queryRepository,
            datasetRepository: datasetRepository,
            patternInstanceRepository: patternInstancesRepository
        })



        // create a fake dataset to index
        const datasetToIndex = Dataset.create({
            sparqlEndpoint: testSparqlEndpoint,
            graph: testToIndexGraph,
            label: "Test Graph to Index"
        })
        if (!await catchUnpredictableErrorsFromDependency( async ()=>{
            await datasetRepository.create(datasetToIndex)
        })) {console.log("Test skipped as SPARQL endpoint return occasional BAD response: Create dataset to index"); return }



        // check dataset is correctly created
        let createdDataset : Dataset | undefined
        if (!await catchUnpredictableErrorsFromDependency( async ()=>{
            createdDataset = await datasetRepository.getById(datasetToIndex.id)
        })) {console.log("Test skipped as SPARQL endpoint return occasional BAD response: Retrieve dataset to index"); return }
        expect(createdDataset).toBeDefined()
        expect(createdDataset?.id).toBe(datasetToIndex.id)
        expect(createdDataset?.sparqlEndpoint).toBe(testSparqlEndpoint)
        expect(createdDataset?.graph).toBe(testToIndexGraph)




        // Create two collections in the dataset to index
        const ns = "https://example.com"
        const collection1Class = `${ns}/Pears`
        const collection2Class = `${ns}/Apples`

        const generateResources = (count: number, type: string) => {
            const resources = []
            for(let i = 0; i<count; i++) {
                const id = nanoid()
                resources.push({
                    id: `${ns}/${id}`,
                    label: `resource ${id} of ${type}`
                })
            }
            return resources
        }

        const coll1Resources =  generateResources(10, collection1Class)
        const coll2Resources =  generateResources(25, collection2Class)

        const coll1IdTriples = coll1Resources.map((r) => {
            return `<${r.id}> rdf:type <${collection1Class}>`
        })
        const coll1LabelTriples = coll1Resources.map((r) => {
            return `<${r.id}> rdfs:label "${r.label}"`
        })
        const coll2IdTriples = coll2Resources.map((r) => {
            return `<${r.id}> rdf:type <${collection2Class}>`
        })
        const coll2LabelTriples = coll2Resources.map((r) => {
            return `<${r.id}> rdfs:label "${r.label}"`
        })

        const triples : string[] = coll1IdTriples.concat(coll1LabelTriples, coll2IdTriples, coll2LabelTriples)

        if (!await catchUnpredictableErrorsFromDependency( async ()=>{
            await graphTester.insertTriples(testToIndexGraph, triples)
        })) {console.log("Test skipped as SPARQL endpoint return occasional BAD response: Insert Triples"); return }
        



        // create two queries to index collections

        const getApplesQuery = `
            SELECT DISTINCT ?id ?label WHERE {
                GRAPH <${testToIndexGraph}> {
                ?id a <${collection1Class}> ;
                    rdfs:label ?label .
                }
            }
        `
        const applePatternURI = `${ns}/apple-pattern`

        const getPearsQuery = `
            SELECT DISTINCT ?id ?label WHERE {
                GRAPH <${testToIndexGraph}> {
                 ?id a <${collection2Class}> ;
                    rdfs:label ?label .
                }
            }
        `
        const pearPatternURI = `${ns}/pear-pattern`


        const query1 = Query.create({
            string: getApplesQuery,
            patternUri: applePatternURI,
            patternLabel: "Apples"
        })

        const query2 = Query.create({
            string: getPearsQuery,
            patternUri: pearPatternURI,
            patternLabel: "Pears"
        })

        if (!await catchUnpredictableErrorsFromDependency( async ()=>{
            await queryRepository.create(query1)
        })) {console.log("Test skipped as SPARQL endpoint return occasional BAD response: Create query to index 1"); return }       

        if (!await catchUnpredictableErrorsFromDependency( async ()=>{
            await queryRepository.create(query2)
        },true)) {console.log("Test skipped as SPARQL endpoint return occasional BAD response: Create query to index 2"); return }       



        // index dataset!
        if (!await catchUnpredictableErrorsFromDependency( async ()=>{
            await  indexDatasetService.handle({
                datasetId: datasetToIndex.id,
                options: {
                    batchSize: 30
                }
            })
        }, true)) {console.log("Test skipped as SPARQL endpoint return occasional BAD response: Indexing batchSize 30"); return }       

        console.log(testToIndexGraph)

        // clear graphs

        if (!await catchUnpredictableErrorsFromDependency( async ()=>{        await graphTester.cleanGraph(testConfigGraph)

        })) {
            console.log("Test skipped as SPARQL endpoint return occasional BAD response: Clear config graph")
            return
        }
        if (!await catchUnpredictableErrorsFromDependency( async ()=>{        await graphTester.cleanGraph(testToIndexGraph)

        })) {
            console.log("Test skipped as SPARQL endpoint return occasional BAD response: Clear graph to index")
            return
        }


    })

})