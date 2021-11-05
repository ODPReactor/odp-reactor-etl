import { nanoid } from "nanoid"
import { SparqlClient, SparqlGraphTestHelper } from "odp-reactor-persistence-interface"
import { IndexingStatus, IndexingStatusEnum } from "../indexes/IndexingStatus"
import { Pattern } from "../pattern/Pattern"
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

    test("It update a dataset", async () => {
   
        
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
            label: "DBPedia",
            indexed: false
        })

        if (!await catchUnpredictableErrorsFromDependency( async ()=>{                await datasetRepository.create(d1)


        })) {
            console.log("Test skipped as SPARQL endpoint return occasional BAD response")
            return
        }


        let createdDataset : any
        if (!await catchUnpredictableErrorsFromDependency( async ()=>{              createdDataset = await datasetRepository.getById(d1.id)



        })) {
            console.log("Test skipped as SPARQL endpoint return occasional BAD response")
            return
        }



        expect(createdDataset).toBeDefined()
        expect(createdDataset.graph).toBe("https://dbpedia")
        expect(createdDataset.label).toBe("DBPedia")
        expect(createdDataset.indexed).toBeFalsy()
        expect(createdDataset.sparqlEndpoint).toBe(se1)

        const updatedDataset = Dataset.create({
            id: d1.id,
            sparqlEndpoint: se1,
            graph: "https://wikidata",
            label: "WikiData",
            indexed: true
        })

        if (!await catchUnpredictableErrorsFromDependency( async ()=>{                      await datasetRepository.update(updatedDataset)

        })) {
            console.log("Test skipped as SPARQL endpoint return occasional BAD response")
            return
        }

        let updateDataset : any

        if (!await catchUnpredictableErrorsFromDependency( async ()=>{              updateDataset = await datasetRepository.getById(d1.id)

        })) {
            console.log("Test skipped as SPARQL endpoint return occasional BAD response")
            return
        }

        expect(updateDataset).toBeDefined()
        expect(updateDataset.id).toBe(d1.id)
        expect(updateDataset.sparqlEndpoint).toBe(se1)
        expect(updateDataset.label).toBe("WikiData")
        expect(updateDataset.indexed).toBeTruthy()
        expect(updateDataset.graph).toBe("https://wikidata")


        if (!await catchUnpredictableErrorsFromDependency( async ()=>{        await graphTester.cleanGraph(testConfigGraph)

        })) {
            console.log("Test skipped as SPARQL endpoint return occasional BAD response")
            return
        }
    })

    test("It retrieve and update indexing status for dataset", async () => {
       
        
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
            label: "DBPedia",
            indexed: false
        })

        if (!await catchUnpredictableErrorsFromDependency( async ()=>{                await datasetRepository.create(d1)


        })) {
            console.log("Test skipped as SPARQL endpoint return occasional BAD response")
            return
        }

        let indexingStatus : any
        if (!await catchUnpredictableErrorsFromDependency( async ()=>{   indexingStatus = await datasetRepository.getIndexingStatusByDatasetId(d1.getId())

        })) {
            console.log("Test skipped as SPARQL endpoint return occasional BAD response")
            return
        }
        expect(indexingStatus).toBeUndefined()


        const indexingStatusToCreate : IndexingStatus = {
            status: IndexingStatusEnum.NOTSTARTED,
        }

        if (!await catchUnpredictableErrorsFromDependency( async ()=>{   await datasetRepository.updateIndexingStatus(d1.getId(), indexingStatusToCreate)        })) {
            console.log("Test skipped as SPARQL endpoint return occasional BAD response")
            return
        }


        if (!await catchUnpredictableErrorsFromDependency( async ()=>{   indexingStatus = await datasetRepository.getIndexingStatusByDatasetId(d1.getId())

        })) {
            console.log("Test skipped as SPARQL endpoint return occasional BAD response")
            return
        }
        expect(indexingStatus).toBeDefined()
        expect(indexingStatus?.status).toBe(IndexingStatusEnum.NOTSTARTED)

        let createdDataset : any
        if (!await catchUnpredictableErrorsFromDependency( async ()=>{              createdDataset = await datasetRepository.getById(d1.id)



        })) {
            console.log("Test skipped as SPARQL endpoint return occasional BAD response")
            return
        }



        expect(createdDataset).toBeDefined()
        expect(createdDataset.graph).toBe("https://dbpedia")
        expect(createdDataset.label).toBe("DBPedia")
        expect(createdDataset.indexed).toBeFalsy()
        expect(createdDataset.sparqlEndpoint).toBe(se1)




        const indexingStatusToUpdate : IndexingStatus = {
            status: IndexingStatusEnum.RUNNING,
            progress: 30,
        }

        if (!await catchUnpredictableErrorsFromDependency( async ()=>{   await datasetRepository.updateIndexingStatus(d1.getId(), indexingStatusToUpdate)        })) {
            console.log("Test skipped as SPARQL endpoint return occasional BAD response")
            return
        }


        if (!await catchUnpredictableErrorsFromDependency( async ()=>{   indexingStatus = await datasetRepository.getIndexingStatusByDatasetId(d1.getId())

        })) {
            console.log("Test skipped as SPARQL endpoint return occasional BAD response")
            return
        }

        expect(indexingStatus).toBeDefined()
        expect(indexingStatus?.status).toBe(IndexingStatusEnum.RUNNING)
        expect(indexingStatus?.progress).toBe(30)
        expect(indexingStatus?.id).toBeDefined()
        expect(indexingStatus?.dateTime).toBeDefined()
                



        if (!await catchUnpredictableErrorsFromDependency( async ()=>{        await graphTester.cleanGraph(testConfigGraph)

        })) {
            console.log("Test skipped as SPARQL endpoint return occasional BAD response")
            return
        }

    } )

    test("It should add and retrieve pattern to and from a dataset", async ()=> {


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
            label: "DBPedia",
            indexed: false
        })

        if (!await catchUnpredictableErrorsFromDependency( async ()=>{                await datasetRepository.create(d1)


        })) {
            console.log("Test skipped as SPARQL endpoint return occasional BAD response")
            return
        }


        const idP1 = nanoid()
        const newPattern1 = Pattern.create({
            uri: "https://example.com/p1",
            label: "Pattern 1",
            id: idP1
        })

        let dsPatterns : any
        if (!await catchUnpredictableErrorsFromDependency( async ()=>{ dsPatterns =  await datasetRepository.getAllPatternsByDatasetId(d1.getId())

        })) {
            console.log("Test skipped as SPARQL endpoint return occasional BAD response")
            return
        }

        expect(dsPatterns).toHaveLength(0)


        if (!await catchUnpredictableErrorsFromDependency( async ()=>{                await datasetRepository.addPattern(d1.getId(), newPattern1)

        }, true)) {
            console.log("Test skipped as SPARQL endpoint return occasional BAD response")
            return
        }

        if (!await catchUnpredictableErrorsFromDependency( async ()=>{ dsPatterns =  await datasetRepository.getAllPatternsByDatasetId(d1.getId())

        })) {
            console.log("Test skipped as SPARQL endpoint return occasional BAD response")
            return
        }

        expect(dsPatterns).toHaveLength(1)

        const foundP = dsPatterns[0] as Pattern

        expect(foundP.id).toBe(idP1)
        expect(foundP.label).toBe("Pattern 1")
        expect(foundP.uri).toBe("https://example.com/p1")

        const newPattern2 = Pattern.create({
            uri : "https://example.com/p2",
            label: "Pattern 2"
        })

        if (!await catchUnpredictableErrorsFromDependency( async ()=>{                await datasetRepository.addPattern(d1.getId(), newPattern2)

        }, true)) {
            console.log("Test skipped as SPARQL endpoint return occasional BAD response")
            return
        }

        if (!await catchUnpredictableErrorsFromDependency( async ()=>{ dsPatterns =  await datasetRepository.getAllPatternsByDatasetId(d1.getId())

        })) {
            console.log("Test skipped as SPARQL endpoint return occasional BAD response")
            return
        }

        expect(dsPatterns).toHaveLength(2)


        if (!await catchUnpredictableErrorsFromDependency( async ()=>{        await graphTester.cleanGraph(testConfigGraph)

        })) {
            console.log("Test skipped as SPARQL endpoint return occasional BAD response")
            return
        }

    })


})