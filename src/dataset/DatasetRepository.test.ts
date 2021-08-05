import { nanoid } from "nanoid"
import { SparqlClient, SparqlGraphTestHelper } from "odp-reactor-persistence-interface"
import { Dataset } from "./Dataset"
import { DatasetRepository } from "./DatasetRepository"

describe("Test for dataset repository", ()=>{


    const testSparqlEndpoint = process.env.TEST_SPARQL_ENDPOINT_URI
    if (!testSparqlEndpoint) {
        throw new Error("Cannot run test no process.env.TEST_SPARQL_ENDPOINT_URI specified")
    }


    const graphTester = new SparqlGraphTestHelper()
    graphTester.setTestSparqlEndpoint(testSparqlEndpoint)


    test("It creates a dataset", async () => {        

        const testConfigGraph = graphTester.getUniqueGraphId()
        const datasetRepository = DatasetRepository.create({
            dbClient: new SparqlClient(testSparqlEndpoint, testConfigGraph)
        })
    
        console.log("create graph:", testConfigGraph)
        await graphTester.createGraph(testConfigGraph)

        const sparqlEndpoint = "https://dpedia.org/sparql"

        const dataset = Dataset.create({
            sparqlEndpoint : sparqlEndpoint,
            label: "DBPedia",
            graph: "default"
        })

        await datasetRepository.create(dataset)

        await graphTester.cleanGraph(testConfigGraph)

    })

    test("It get all datasets", async () => {


        const testConfigGraph = graphTester.getUniqueGraphId()
        const datasetRepository = DatasetRepository.create({
            dbClient: new SparqlClient(testSparqlEndpoint, testConfigGraph)
        })

        console.log("create graph:", testConfigGraph)
        await graphTester.createGraph(testConfigGraph)

        const se1 = "https://dbpedia.org/sparql"
        const se2 = "https://wikidata.org/sparql"


        const d1 = Dataset.create({
            sparqlEndpoint: se1,
            graph: "default",
            label: "DBPedia"
        })

        const d2 = Dataset.create({
            sparqlEndpoint: se2,
            graph: "default",
            label: "WikiData"
        })

        await datasetRepository.create(d1)
        await datasetRepository.create(d2)

        const datasets = await datasetRepository.getAll()

        expect(datasets).toBeDefined()
        expect(datasets).toHaveLength(2)

        await graphTester.cleanGraph(testConfigGraph)

        await graphTester.createGraph(testConfigGraph)

    })

    test("It gets a single dataset", async() => {

        const testConfigGraph = graphTester.getUniqueGraphId()
        const datasetRepository = DatasetRepository.create({
            dbClient: new SparqlClient(testSparqlEndpoint, testConfigGraph)
        })

        console.log("create graph:", testConfigGraph)
        await graphTester.createGraph(testConfigGraph)

        const se1 = "https://dbpedia.org/sparql"


        const d1 = Dataset.create({
            sparqlEndpoint: se1,
            graph: "https://dbpedia",
            label: "DBPedia"
        })

        await datasetRepository.create(d1)

        const createdDataset = await datasetRepository.getById(d1.id)
        expect(createdDataset).toBeDefined()
        expect(createdDataset?.id).toBe(d1.id)
        expect(createdDataset?.sparqlEndpoint).toBe(d1.sparqlEndpoint)
        expect(createdDataset?.graph).toBe(d1.graph)
        expect(createdDataset?.label).toBe(d1.label)
        expect(createdDataset?.indexed).toBeFalsy()

    })

})