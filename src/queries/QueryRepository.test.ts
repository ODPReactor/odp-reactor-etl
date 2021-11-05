import { nanoid } from "nanoid"
import { SparqlClient, SparqlGraphTestHelper } from "odp-reactor-persistence-interface"
import { catchUnpredictableErrorsFromDependency } from "../test/catchUnpredictableErrorsFromDependency"
import { Query } from "./Query"
import { QueryRepository } from "./QueryRepository"

describe("Test for query repository", ()=>{

 

    const testSparqlEndpoint = process.env.TEST_SPARQL_ENDPOINT_URI
    if (!testSparqlEndpoint) {
        throw new Error("Cannot run test no process.env.TEST_SPARQL_ENDPOINT_URI specified")
    }


    const graphTester = new SparqlGraphTestHelper()
    graphTester.setTestSparqlEndpoint(testSparqlEndpoint)


    test("It creates a query", async () => {


            const testConfigGraph = graphTester.getUniqueGraphId()

            const queryRepository = QueryRepository.create({
                dbClient: new SparqlClient(testSparqlEndpoint, testConfigGraph)
            })
        
            if (!await catchUnpredictableErrorsFromDependency( async ()=>{ await graphTester.createGraph(testConfigGraph)})) {
                console.log("Test skipped as SPARQL endpoint return occasional BAD response")
                return
            }

            const queryString = `SELECT ?a ?b ?c WHERE {
                ?a ?b ?c
            }`
            const query = Query.create({
                string : queryString,
                patternUri : "https://example.com/collection-pattern",
                patternLabel : "The collection pattern!"
            })


            if (!await catchUnpredictableErrorsFromDependency( async ()=>{ await queryRepository.create(query) })) {
                console.log("Test skipped as SPARQL endpoint return occasional BAD response")
                return
            }
            

            if (!await catchUnpredictableErrorsFromDependency( async ()=>{ await graphTester.cleanGraph(testConfigGraph) })) {
                console.log("Test skipped as SPARQL endpoint return occasional BAD response")
                return
            }
            


    })

    test("It get all queries", async () => {


        const testConfigGraph = graphTester.getUniqueGraphId()
        const queryRepository = QueryRepository.create({
            dbClient: new SparqlClient(testSparqlEndpoint, testConfigGraph)
        })

        if (!await catchUnpredictableErrorsFromDependency( async ()=>{ await graphTester.createGraph(testConfigGraph)})) {
            console.log("Test skipped as SPARQL endpoint return occasional BAD response")
            return
        }

        const queryString = `SELECT ?a ?b ?c WHERE {
            ?a ?b ?c
        }`
        const query1 = Query.create({
            string : queryString,
            patternUri : "https://example.com/collection-pattern",
            patternLabel : "The collection pattern!"
        })

        const query2 = Query.create({
            string : queryString,
            patternUri : "https://example.com/partof-pattern",
            patternLabel : "The partof pattern!"
        })

        if (!await catchUnpredictableErrorsFromDependency( async ()=>{ await queryRepository.create(query1) })) {
            console.log("Test skipped as SPARQL endpoint return occasional BAD response")
            return
        }

        if (!await catchUnpredictableErrorsFromDependency( async ()=>{ await queryRepository.create(query2) })) {
            console.log("Test skipped as SPARQL endpoint return occasional BAD response")
            return
        }
        
       

        let queries;


        if (!await catchUnpredictableErrorsFromDependency( async ()=>{ queries = await queryRepository.getAll() })) {
            console.log("Test skipped as SPARQL endpoint return occasional BAD response")
            return
        }

        expect(queries).toBeDefined()
        expect(queries).toHaveLength(2)



        if (!await catchUnpredictableErrorsFromDependency( async ()=>{ await graphTester.cleanGraph(testConfigGraph) })) {
            console.log("Test skipped as SPARQL endpoint return occasional BAD response")
            return
        }


        if (!await catchUnpredictableErrorsFromDependency( async ()=>{ await graphTester.createGraph(testConfigGraph)})) {
            console.log("Test skipped as SPARQL endpoint return occasional BAD response")
            return
        }

        const uniqueQuery = Query.create({
            string : queryString,
            patternUri : "https://example.com/partof-pattern",
            patternLabel : "The partof pattern!"
        })


        if (!await catchUnpredictableErrorsFromDependency( async ()=>{ await queryRepository.create(uniqueQuery) })) {
            console.log("Test skipped as SPARQL endpoint return occasional BAD response")
            return
        }
        


        let singleQueries : any;


        if (!await catchUnpredictableErrorsFromDependency( async ()=>{ singleQueries =  await queryRepository.getAll() })) {
            console.log("Test skipped as SPARQL endpoint return occasional BAD response")
            return
        }

        const q = singleQueries[0]

        expect(q).toBeDefined()
        expect(singleQueries).toHaveLength(1)
        expect(q.patternLabel).toBe("The partof pattern!")
        expect(q.patternUri).toBe("https://example.com/partof-pattern")
        expect(q.string).toBe(queryString)


        if (!await catchUnpredictableErrorsFromDependency( async ()=>{ await graphTester.cleanGraph(testConfigGraph) })) {
            console.log("Test skipped as SPARQL endpoint return occasional BAD response")
            return
        }

    })

    test("It deletes a query", async () => {


        const testConfigGraph = graphTester.getUniqueGraphId()
        const queryRepository = QueryRepository.create({
            dbClient: new SparqlClient(testSparqlEndpoint, testConfigGraph)
        })



        if (!await catchUnpredictableErrorsFromDependency( async ()=>{ await graphTester.createGraph(testConfigGraph) })) {
            console.log("Test skipped as SPARQL endpoint return occasional BAD response")
            return
        }
        

        const queryString = `SELECT ?a ?b ?c WHERE {
            ?a ?b ?c
        }`
        const query1 = Query.create({
            string : queryString,
            patternUri : "https://example.com/collection-pattern",
            patternLabel : "The collection pattern!"
        })


        const query2 = Query.create({
            string : queryString,
            patternUri : "https://example.com/partof-pattern",
            patternLabel : "The partof pattern!"
        })

        if (!await catchUnpredictableErrorsFromDependency( async ()=>{ await queryRepository.create(query1) })) {
            console.log("Test skipped as SPARQL endpoint return occasional BAD response")
            return
        }
        
        if (!await catchUnpredictableErrorsFromDependency( async ()=>{ await queryRepository.create(query2) })) {
            console.log("Test skipped as SPARQL endpoint return occasional BAD response")
            return
        }

        
        let queries : any
        if (!await catchUnpredictableErrorsFromDependency( async ()=>{ queries = await queryRepository.getAll() })) {
            console.log("Test skipped as SPARQL endpoint return occasional BAD response")
            return
        }


        expect(queries).toBeDefined()
        expect(queries).toHaveLength(2)

        const queryToDelete = queries[0]
        const queryToKeep = queries[1]

        if (!await catchUnpredictableErrorsFromDependency( async ()=>{ await queryRepository.delete(queryToDelete.id) })) {
            console.log("Test skipped as SPARQL endpoint return occasional BAD response")
            return
        }


        let refetchedQueries : any
        if (!await catchUnpredictableErrorsFromDependency( async ()=>{ refetchedQueries = await queryRepository.getAll() })) {
            console.log("Test skipped as SPARQL endpoint return occasional BAD response")
            return
        }

        expect(refetchedQueries).toBeDefined()
        expect(refetchedQueries).toHaveLength(1)
        expect(refetchedQueries[0].id).toBe(queryToKeep.id)


        if (!await catchUnpredictableErrorsFromDependency( async ()=>{ await graphTester.cleanGraph(testConfigGraph) })) {
            console.log("Test skipped as SPARQL endpoint return occasional BAD response")
            return
        }

    })

    test("It gets a query by id", async() => {


        const testConfigGraph = graphTester.getUniqueGraphId()
        const queryRepository = QueryRepository.create({
            dbClient: new SparqlClient(testSparqlEndpoint, testConfigGraph)
        })


        if (!await catchUnpredictableErrorsFromDependency( async ()=>{ await graphTester.createGraph(testConfigGraph) })) {
            console.log("Test skipped as SPARQL endpoint return occasional BAD response")
            return
        }

       

        const queryString = `SELECT ?a ?b ?c WHERE {
            ?a ?b ?c
        }`
        const query1 = Query.create({
            string : queryString,
            patternUri : "https://example.com/collection-pattern",
            patternLabel : "The collection pattern!"
        })


        const query2 = Query.create({
            string : queryString,
            patternUri : "https://example.com/partof-pattern",
            patternLabel : "The partof pattern!"
        })


        if (!await catchUnpredictableErrorsFromDependency( async ()=>{ await queryRepository.create(query1) })) {
            console.log("Test skipped as SPARQL endpoint return occasional BAD response")
            return
        }

        if (!await catchUnpredictableErrorsFromDependency( async ()=>{ await queryRepository.create(query2) })) {
            console.log("Test skipped as SPARQL endpoint return occasional BAD response")
            return
        }


        let queries : any

        if (!await catchUnpredictableErrorsFromDependency( async ()=>{ queries = await queryRepository.getAll() })) {
            console.log("Test skipped as SPARQL endpoint return occasional BAD response")
            return
        }

        expect(queries).toBeDefined()
        expect(queries).toHaveLength(2)

        const queryToRetrieve = queries[0]


        let queryById : any

        if (!await catchUnpredictableErrorsFromDependency( async ()=>{ queryById = await queryRepository.getById(queryToRetrieve.id) })) {
            console.log("Test skipped as SPARQL endpoint return occasional BAD response")
            return
        }



        expect(queryById).toBeDefined()
        expect(queryById?.id).toBe(queryToRetrieve.id)
        expect(queryById?.patternUri).toBe(queryToRetrieve.patternUri)
        expect(queryById?.patternLabel).toBe(queryToRetrieve.patternLabel)
        expect(queryById?.string).toBe(queryToRetrieve.string)


        if (!await catchUnpredictableErrorsFromDependency( async ()=>{         await graphTester.cleanGraph(testConfigGraph)
        })) {
            console.log("Test skipped as SPARQL endpoint return occasional BAD response")
            return
        }


    })

    test("It updates a query", async () => {


        const testConfigGraph = graphTester.getUniqueGraphId()
        const queryRepository = QueryRepository.create({
            dbClient: new SparqlClient(testSparqlEndpoint, testConfigGraph)
        })


        if (!await catchUnpredictableErrorsFromDependency( async ()=>{         await graphTester.createGraph(testConfigGraph) })) {
            console.log("Test skipped as SPARQL endpoint return occasional BAD response")
            return
        }
       

        const queryString = `SELECT ?a ?b ?c WHERE {
            ?a ?b ?c
        }`
        const query1 = Query.create({
            string : queryString,
            patternUri : "https://example.com/collection-pattern",
            patternLabel : "The collection pattern!"
        })

        if (!await catchUnpredictableErrorsFromDependency( async ()=>{  await queryRepository.create(query1) })) {
            console.log("Test skipped as SPARQL endpoint return occasional BAD response")
            return
        }

        let queries : any

        if (!await catchUnpredictableErrorsFromDependency( async ()=>{  queries = await queryRepository.getAll()
        })) {
            console.log("Test skipped as SPARQL endpoint return occasional BAD response")
            return
        }

        const oldQuery = queries[0]


        const newPatternUri = "https://example.com/measurement-collection-pattern"
        const newPatternLabel = "The measurement collection pattern!"

        const updateQuery1 = Query.create({
            id: oldQuery.id,
            patternUri : newPatternUri,
            patternLabel : newPatternLabel,
            string : queryString
        })

        if (!await catchUnpredictableErrorsFromDependency( async ()=>{ await queryRepository.update(updateQuery1)
        })) {
            console.log("Test skipped as SPARQL endpoint return occasional BAD response")
            return
        }




        let refetchedQueries : any
        if (!await catchUnpredictableErrorsFromDependency( async ()=>{ refetchedQueries = await queryRepository.getAll()
        })) {
            console.log("Test skipped as SPARQL endpoint return occasional BAD response")
            return
        }

        const newQuery = refetchedQueries[0]

        expect(newQuery).toBeDefined()
        expect(newQuery.id).toBe(oldQuery.id)
        expect(newQuery.patternLabel).toBe(newPatternLabel)
        expect(newQuery.string).toBe(queryString)
        expect(newQuery.patternUri).toBe(newPatternUri)


        const customId = nanoid()

        const query2 = Query.create({
            id: customId,
            string : queryString,
            patternUri : "https://example.com/partof-pattern",
            patternLabel : "The partof pattern!"
        })


        if (!await catchUnpredictableErrorsFromDependency( async ()=>{ await queryRepository.create(query2)
        })) {
            console.log("Test skipped as SPARQL endpoint return occasional BAD response")
            return
        }

        

        const updateQuery2 = Query.create({
            id: customId,
            string : queryString,
            patternUri: "https://example.com/partof-pattern",
            patternLabel: "Update partof pattern!"
        })


        if (!await catchUnpredictableErrorsFromDependency( async ()=>{ await queryRepository.update(updateQuery2)
        })) {
            console.log("Test skipped as SPARQL endpoint return occasional BAD response")
            return
        }


        let allQueries : any

        if (!await catchUnpredictableErrorsFromDependency( async ()=>{ allQueries = await queryRepository.getAll()
        })) {
            console.log("Test skipped as SPARQL endpoint return occasional BAD response")
            return
        }

        

        expect(allQueries).toBeDefined()
        expect(allQueries).toHaveLength(2)

        let q1 : any
        let q2 : any

        if (!await catchUnpredictableErrorsFromDependency( async ()=>{ q1 = await queryRepository.getById(newQuery.id)
        })) {
            console.log("Test skipped as SPARQL endpoint return occasional BAD response")
            return
        }

        if (!await catchUnpredictableErrorsFromDependency( async ()=>{ q2 = await queryRepository.getById(customId)
        })) {
            console.log("Test skipped as SPARQL endpoint return occasional BAD response")
            return
        }


        expect(q1?.patternLabel).toBe(newPatternLabel)

        expect(q2?.id).toBe(customId)
        expect(q2?.string).toBe(queryString)
        expect(q2?.patternLabel).toBe("Update partof pattern!")


        if (!await catchUnpredictableErrorsFromDependency( async ()=>{ await graphTester.cleanGraph(testConfigGraph)
        })) {
            console.log("Test skipped as SPARQL endpoint return occasional BAD response")
            return
        }
        


    })
})