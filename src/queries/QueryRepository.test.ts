import { nanoid } from "nanoid"
import { SparqlClient, SparqlGraphTestHelper } from "odp-reactor-persistence-interface"
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
    
        console.log("create graph:", testConfigGraph)
        await graphTester.createGraph(testConfigGraph)


        const queryString = `SELECT ?a ?b ?c WHERE {
            ?a ?b ?c
        }`
        const query = Query.create({
            string : queryString,
            patternUri : "https://example.com/collection-pattern",
            patternLabel : "The collection pattern!"
        })

        await queryRepository.create(query)

        await graphTester.cleanGraph(testConfigGraph)

    })

    test("It get all queries", async () => {


        const testConfigGraph = graphTester.getUniqueGraphId()
        const queryRepository = QueryRepository.create({
            dbClient: new SparqlClient(testSparqlEndpoint, testConfigGraph)
        })

        console.log("create graph:", testConfigGraph)
        await graphTester.createGraph(testConfigGraph)

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

        await queryRepository.create(query1)
        await queryRepository.create(query2)

        const queries = await queryRepository.getAll()

        expect(queries).toBeDefined()
        expect(queries).toHaveLength(2)

        await graphTester.cleanGraph(testConfigGraph)

        await graphTester.createGraph(testConfigGraph)

        const uniqueQuery = Query.create({
            string : queryString,
            patternUri : "https://example.com/partof-pattern",
            patternLabel : "The partof pattern!"
        })

        await queryRepository.create(uniqueQuery)


        const singleQueries = await queryRepository.getAll()

        const q = singleQueries[0]

        expect(q).toBeDefined()
        expect(singleQueries).toHaveLength(1)
        expect(q.patternLabel).toBe("The partof pattern!")
        expect(q.patternUri).toBe("https://example.com/partof-pattern")
        expect(q.string).toBe(queryString)

        await graphTester.cleanGraph(testConfigGraph)

    })

    test("It deletes a query", async () => {


        const testConfigGraph = graphTester.getUniqueGraphId()
        const queryRepository = QueryRepository.create({
            dbClient: new SparqlClient(testSparqlEndpoint, testConfigGraph)
        })

        console.log("create graph:", testConfigGraph)

        await graphTester.createGraph(testConfigGraph)

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

        await queryRepository.create(query1)
        await queryRepository.create(query2)

        const queries = await queryRepository.getAll()

        expect(queries).toBeDefined()
        expect(queries).toHaveLength(2)

        const queryToDelete = queries[0]
        const queryToKeep = queries[1]


        await queryRepository.delete(queryToDelete.id)

        const refetchedQueries = await queryRepository.getAll()

        expect(refetchedQueries).toBeDefined()
        expect(refetchedQueries).toHaveLength(1)
        expect(refetchedQueries[0].id).toBe(queryToKeep.id)

        await graphTester.cleanGraph(testConfigGraph)


    })

    test("It gets a query by id", async() => {


        const testConfigGraph = graphTester.getUniqueGraphId()
        const queryRepository = QueryRepository.create({
            dbClient: new SparqlClient(testSparqlEndpoint, testConfigGraph)
        })

        console.log("create graph:", testConfigGraph)

        await graphTester.createGraph(testConfigGraph)

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

        await queryRepository.create(query1)
        await queryRepository.create(query2)

        const queries = await queryRepository.getAll()

        expect(queries).toBeDefined()
        expect(queries).toHaveLength(2)

        const queryToRetrieve = queries[0]

        const queryById = await queryRepository.getById(queryToRetrieve.id)

        expect(queryById).toBeDefined()
        expect(queryById?.id).toBe(queryToRetrieve.id)
        expect(queryById?.patternUri).toBe(queryToRetrieve.patternUri)
        expect(queryById?.patternLabel).toBe(queryToRetrieve.patternLabel)
        expect(queryById?.string).toBe(queryToRetrieve.string)

        await graphTester.cleanGraph(testConfigGraph)


    })

    test("It updates a query", async () => {


        const testConfigGraph = graphTester.getUniqueGraphId()
        const queryRepository = QueryRepository.create({
            dbClient: new SparqlClient(testSparqlEndpoint, testConfigGraph)
        })

        console.log("create graph:", testConfigGraph)
        await graphTester.createGraph(testConfigGraph)

        const queryString = `SELECT ?a ?b ?c WHERE {
            ?a ?b ?c
        }`
        const query1 = Query.create({
            string : queryString,
            patternUri : "https://example.com/collection-pattern",
            patternLabel : "The collection pattern!"
        })

        await queryRepository.create(query1)

        const queries = await queryRepository.getAll()

        const oldQuery = queries[0]


        const newPatternUri = "https://example.com/measurement-collection-pattern"
        const newPatternLabel = "The measurement collection pattern!"

        const updateQuery1 = Query.create({
            id: oldQuery.id,
            patternUri : newPatternUri,
            patternLabel : newPatternLabel,
            string : queryString
        })

        await queryRepository.update(updateQuery1)

        const refetchedQueries = await queryRepository.getAll()

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

        await queryRepository.create(query2)

        const updateQuery2 = Query.create({
            id: customId,
            string : queryString,
            patternUri: "https://example.com/partof-pattern",
            patternLabel: "Update partof pattern!"
        })

        await queryRepository.update(updateQuery2)

        const allQueries = await queryRepository.getAll()

        expect(allQueries).toBeDefined()
        expect(allQueries).toHaveLength(2)

        const q1 = await queryRepository.getById(newQuery.id)
        const q2 = await queryRepository.getById(customId)

        expect(q1?.patternLabel).toBe(newPatternLabel)

        expect(q2?.id).toBe(customId)
        expect(q2?.string).toBe(queryString)
        expect(q2?.patternLabel).toBe("Update partof pattern!")

        await graphTester.cleanGraph(testConfigGraph)


    })
})