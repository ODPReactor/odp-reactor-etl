import {Index} from "./Index"

describe("Index class test", () => {
    test("Create an Index object with random id", () => {
        const index = Index.create({
            sparqlEndpoint: "end",
            graph: "gra"
        })

        expect(index).toBeDefined()
        expect(index.getIndexName()).toBeDefined()
        expect(index.getGraph()).toBe("gra")
        expect(index.getSparqlEndpoint()).toBe("end")
    })
})