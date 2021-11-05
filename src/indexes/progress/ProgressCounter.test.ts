import { ProgressCounter } from "./ProgressCounter"

describe("Test ProgressCounter", () => {


    const initialCount = 0
    const totalCount = 100


    test("It keep progress update", () => {

        let progress : number

        const progressCounter = new ProgressCounter(initialCount, totalCount)

        progress = progressCounter.getProgress()

        expect(progress).toBe(0)

        progressCounter.updateProgress(20)

        progress = progressCounter.getProgress()

        expect(progress).toBe(20)

        progressCounter.updateProgress(30)

        progress = progressCounter.getProgress(false)

        expect(progress).toBe(0.5)

        progressCounter.updateProgress(100)

        progress = progressCounter.getProgress()

        expect(progress).toBe(100)

        progress = progressCounter.getProgress(false)

        expect(progress).toBe(1)

    })

})