import { catchUnpredictableErrorsFromDependency } from "./catchUnpredictableErrorsFromDependency"

describe("It execute function catching errors and returning false", () => {
    test("It return true with no errors", async () => {
        const noErrors = async () => {
            return new Promise(function(resolve,reject) {
                resolve("Hi async succeed")
            })
        }

        const result = await catchUnpredictableErrorsFromDependency(noErrors)
        expect(result).toBeTruthy()
    })
    test("It return false with errors", async () => {
        const throwError = async () => {
            return new Promise(function(resolve,reject) {
                reject(new Error("I async throw error"))
            })
        }
        const result = await catchUnpredictableErrorsFromDependency(throwError)
        expect(result).toBeFalsy()
    })
})