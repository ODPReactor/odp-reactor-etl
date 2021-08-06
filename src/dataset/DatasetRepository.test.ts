import { nanoid } from "nanoid"
import { SparqlClient, SparqlGraphTestHelper } from "odp-reactor-persistence-interface"
import { catchUnpredictableErrorsFromDependency } from "../test/catchUnpredictableErrorsFromDependency"
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
    

        if (!await catchUnpredictableErrorsFromDependency( async ()=>{ await graphTester.createGraph(testConfigGraph) })) {
            console.log("Test skipped as SPARQL endpoint return occasional BAD response")
            return
        }

        const sparqlEndpoint = "https://dpedia.org/sparql"

        const dataset = Dataset.create({
            sparqlEndpoint : sparqlEndpoint,
            label: "DBPedia",
            graph: "default"
        })

        if (!await catchUnpredictableErrorsFromDependency( async ()=>{         await datasetRepository.create(dataset)
        })) {
            console.log("Test skipped as SPARQL endpoint return occasional BAD response")
            return
        }

        if (!await catchUnpredictableErrorsFromDependency( async ()=>{         await graphTester.cleanGraph(testConfigGraph)
        })) {
            console.log("Test skipped as SPARQL endpoint return occasional BAD response")
            return
        }


        

    })

    test("It get all datasets", async () => {


        const testConfigGraph = graphTester.getUniqueGraphId()
        const datasetRepository = DatasetRepository.create({
            dbClient: new SparqlClient(testSparqlEndpoint, testConfigGraph)
        })


        if (!await catchUnpredictableErrorsFromDependency( async ()=>{ await graphTester.createGraph(testConfigGraph) })) {
            console.log("Test skipped as SPARQL endpoint return occasional BAD response")
            return
        }

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

        if (!await catchUnpredictableErrorsFromDependency( async ()=>{ await datasetRepository.create(d1) })) {
            console.log("Test skipped as SPARQL endpoint return occasional BAD response")
            return
        }

        if (!await catchUnpredictableErrorsFromDependency( async ()=>{ await datasetRepository.create(d2) })) {
            console.log("Test skipped as SPARQL endpoint return occasional BAD response")
            return
        }

        let datasets: any
        if (!await catchUnpredictableErrorsFromDependency( async ()=>{         datasets = await datasetRepository.getAll()
        })) {
            console.log("Test skipped as SPARQL endpoint return occasional BAD response")
            return
        }

        
        


        expect(datasets).toBeDefined()
        expect(datasets).toHaveLength(2)


        if (!await catchUnpredictableErrorsFromDependency( async ()=>{        await graphTester.cleanGraph(testConfigGraph)

        })) {
            console.log("Test skipped as SPARQL endpoint return occasional BAD response")
            return
        }

    
    })

    test("It gets a single dataset", async() => {

        const testConfigGraph = graphTester.getUniqueGraphId()
        const datasetRepository = DatasetRepository.create({
            dbClient: new SparqlClient(testSparqlEndpoint, testConfigGraph)
        })

        

        if (!await catchUnpredictableErrorsFromDependency( async ()=>{        await graphTester.createGraph(testConfigGraph)

        })) {
            console.log("Test skipped as SPARQL endpoint return occasional BAD response")
            return
        }


        const se1 = "https://dbpedia.org/sparql"


        const d1 = Dataset.create({
            sparqlEndpoint: se1,
            graph: "https://dbpedia",
            label: "DBPedia"
        })


        if (!await catchUnpredictableErrorsFromDependency( async ()=>{        await datasetRepository.create(d1)

        })) {
            console.log("Test skipped as SPARQL endpoint return occasional BAD response")
            return
        }


        let createdDataset : any
        if (!await catchUnpredictableErrorsFromDependency( async ()=>{  createdDataset = await datasetRepository.getById(d1.id)


        })) {
            console.log("Test skipped as SPARQL endpoint return occasional BAD response")
            return
        }

        

        expect(createdDataset).toBeDefined()
        expect(createdDataset?.id).toBe(d1.id)
        expect(createdDataset?.sparqlEndpoint).toBe(d1.sparqlEndpoint)
        expect(createdDataset?.graph).toBe(d1.graph)
        expect(createdDataset?.label).toBe(d1.label)
        expect(createdDataset?.indexed).toBeFalsy()


        if (!await catchUnpredictableErrorsFromDependency( async ()=>{        await graphTester.cleanGraph(testConfigGraph)

        })) {
            console.log("Test skipped as SPARQL endpoint return occasional BAD response")
            return
        }

    })

    test("It deletes a dataset", async () => {
        const testConfigGraph = graphTester.getUniqueGraphId()
        const datasetRepository = DatasetRepository.create({
            dbClient: new SparqlClient(testSparqlEndpoint, testConfigGraph)
        })


        if (!await catchUnpredictableErrorsFromDependency( async ()=>{        await graphTester.createGraph(testConfigGraph)

        })) {
            console.log("Test skipped as SPARQL endpoint return occasional BAD response")
            return
        }


        const se1 = "https://dbpedia.org/sparql"


        const d1 = Dataset.create({
            sparqlEndpoint: se1,
            graph: "https://dbpedia",
            label: "DBPedia"
        })

        if (!await catchUnpredictableErrorsFromDependency( async ()=>{                await datasetRepository.create(d1)


        })) {
            console.log("Test skipped as SPARQL endpoint return occasional BAD response")
            return
        }


        let createdDataset
        if (!await catchUnpredictableErrorsFromDependency( async ()=>{              createdDataset = await datasetRepository.getById(d1.id)



        })) {
            console.log("Test skipped as SPARQL endpoint return occasional BAD response")
            return
        }



        expect(createdDataset).toBeDefined()


        if (!await catchUnpredictableErrorsFromDependency( async ()=>{                      await datasetRepository.delete(d1.id)

        })) {
            console.log("Test skipped as SPARQL endpoint return occasional BAD response")
            return
        }




        let deletedDataset
        if (!await catchUnpredictableErrorsFromDependency( async ()=>{                              deletedDataset = await datasetRepository.getById(d1.id)


        })) {
            console.log("Test skipped as SPARQL endpoint return occasional BAD response")
            return
        }



        expect(deletedDataset).toBeUndefined()



        if (!await catchUnpredictableErrorsFromDependency( async ()=>{        await graphTester.cleanGraph(testConfigGraph)

        })) {
            console.log("Test skipped as SPARQL endpoint return occasional BAD response")
            return
        }
    })

})