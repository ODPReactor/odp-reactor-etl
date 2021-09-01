import { nanoid } from "nanoid"
import { ElasticClient } from "../indexes/ElasticClient"
import { PatternInstance } from "./PatternInstance"
import { PatternInstanceDTO } from "./PatternInstanceDTO"
import { PatternInstanceRepository } from "./PatternInstanceRepository"

describe("PatternInstanceRepository test", () => {


    const elasticTestUrl = process.env.TEST_ES_INDEX_URL

    if (!elasticTestUrl) {
        throw new Error("Cannot run test no process.env.TEST_ES_INDEX_URL specified")
    }

    const patternInstanceRepo = PatternInstanceRepository.create({

        dbClient : new ElasticClient(elasticTestUrl)

    })

    test("It creates and retrieves pattern instances and deletes them", async () => {

        const uniqueType = "geopoint" + nanoid().toLowerCase()

        const patternInstancesDTOs : PatternInstanceDTO[] = [

            {
                id: "wefew32",
                data: {
                    lat: 45,
                    long: 32
                },
                patternId: uniqueType,
                type: uniqueType
            },
            {
                id: "wef3wefc2",
                data: {
                    lat: 45,
                    long: 20
                },
                patternId: uniqueType,
                type: uniqueType
            },
            {
                id: "wefeweafcvq",
                data: {
                    lat: 30,
                    long: 15
                },
                patternId: uniqueType,
                type: uniqueType
            }
        ]

        await patternInstanceRepo.loadInstances(patternInstancesDTOs.map((dto) => {
            return PatternInstance.create(dto)
        }))


        const createdPatternInstances = await patternInstanceRepo.getAllByPattern(uniqueType)

        expect(createdPatternInstances).toBeDefined()
        expect(createdPatternInstances).toHaveLength(3)
        expect(createdPatternInstances[0].type).toBe(uniqueType)

        await patternInstanceRepo.deleteInstancesByType(uniqueType)

        const deletedInstances = await patternInstanceRepo.getAllByPattern(uniqueType)

        expect(deletedInstances).toBeDefined()
        expect(deletedInstances).toHaveLength(0)

    })

})