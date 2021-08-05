import express, {Request, Response} from "express"
import {json} from "body-parser"
import { GetAllQueriesService } from "../queries/services/GetAllQueriesService"
import { CreateQueryService } from "../queries/services/CreateQueryService"
import { DeleteQueryService, DeleteQueryServiceStatusEnum } from "../queries/services/DeleteQueryService"
import { GetQueryByIdService } from "../queries/services/GetQueryByIdService"

const QueryRouter = express.Router()
QueryRouter.use(json())

enum RouterApiStatus {
    ERROR = "ERROR",
    OK = "OK"
}

QueryRouter.get("/queries", async (req: Request<{}, {}, {

}>, res: Response) => {

    const getAllQueryService = new GetAllQueriesService()

    const queries = await getAllQueryService.handle()

    res.send({
        queries : queries,
        status : RouterApiStatus.OK
    })

})

QueryRouter.get("/queries/:queryId", async (req: Request<{
    queryId: string
}, {}, {

}>, res: Response) => {
    

    if (!req.params.queryId) {
        return res.send({
            status: RouterApiStatus.ERROR,
            msg: "Parameters not valid"
        })
    }

    const getQueryByIdService = new GetQueryByIdService()

    const result = await getQueryByIdService.handle({
       queryId: req.params.queryId
    })

    if (result.status && result.query) {
        return res.send({
            query : result.query,
            status : RouterApiStatus.OK
        })    
    } else {
        return res.send({
            status: RouterApiStatus.ERROR,
            msg: "Query not found"
        })
    }
})

QueryRouter.post("/queries", async (req: Request<{}, {}, {
    query : {
        patternUri : string,
        patternLabel: string,
        string: string
    }
}>, res: Response) => {

    console.log("req:",req.body.query)

    if (!req.body.query || !req.body.query.patternUri || !req.body.query.patternLabel || !req.body.query.string) {
        return res.send({
            status: RouterApiStatus.ERROR,
            msg: "Parameters not valid"
        })
    }

    const createQueryService = new CreateQueryService()

    const createdQuery = await createQueryService.handle({
        queryDTO: req.body.query
    })


    if (!createdQuery) {
        return res.send({
            status: RouterApiStatus.ERROR,
            msg: "Error while creating query"
        })
    }

    return res.send({
        newQuery: createQueryService.queryRepository.dataMapper.toDto(createdQuery),
        status : RouterApiStatus.OK
    })

})

QueryRouter.delete("/queries/:queryId", async (req: Request<{
    queryId: string
}, {}, {
}>, res: Response) => {
    console.log(req)

    if (!req.params || !req.params.queryId) {
        return res.send({
            status: RouterApiStatus.ERROR,
            msg: "Parameters not valid"
        })
    }

    const deleteQueryService = new DeleteQueryService()

    const result = await deleteQueryService.handle({ queryId: req.params.queryId })

    result.status === DeleteQueryServiceStatusEnum.FAILED ? res.send({
        status: RouterApiStatus.ERROR,
        msg: "Error while deleting query"
    }) : res.send({
        status: RouterApiStatus.OK,
        queries: result.queries
    })

})

export {
    QueryRouter
}