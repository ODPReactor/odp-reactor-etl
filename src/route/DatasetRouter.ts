import express, {Request, Response} from "express"
import {json} from "body-parser"
import { GetAllDatasetsService } from "../dataset/service/GetAllDatasetsService"
import { CreateDatasetService } from "../dataset/service/CreateDatasetService"


const DatasetRouter = express.Router()
DatasetRouter.use(json())

enum RouterApiStatus {
    ERROR = "ERROR",
    OK = "OK"
}

DatasetRouter.get("/datasets", async (req: Request<{}, {}, {

}>, res: Response) => {


    const getAllDatasetsService = new GetAllDatasetsService()

    const datasets = await getAllDatasetsService.handle()

    console.log("Datasets", datasets)

    res.send({
        datasets : datasets,
        status : RouterApiStatus.OK
    })
})

DatasetRouter.post("/datasets", async (req: Request<{}, {}, {
    dataset : {
        sparqlEndpoint: string,
        label: string,
        graph: string
    }
}>, res: Response) => {

    console.log("req:",req.body.dataset)

    if (!req.body.dataset || !req.body.dataset.sparqlEndpoint || !req.body.dataset.label) {
        return res.send({
            status: RouterApiStatus.ERROR,
            msg: "Parameters not valid"
        })
    }

    const createDatasetService = new CreateDatasetService()

    const createdDataset = await createDatasetService.handle({
        datasetDTO: {indexed: false, ...req.body.dataset}
    })


    if (!createdDataset) {
        return res.send({
            status: RouterApiStatus.ERROR,
            msg: "Error while creating query"
        })
    }

    return res.send({
        newDataset: createDatasetService.datasetRepository.dataMapper.toDto(createdDataset),
        status : RouterApiStatus.OK
    })

})

// DatasetRouter.get("/datasets/:datasetId", async (req: Request<{
//     datasetId: string
// }, {}, {

// }>, res: Response) => {

//     console.log(req.params)

//     if (!req.params.datasetId) {
//         return res.send({
//             status: RouterApiStatus.ERROR,
//             msg: "Parameters not valid"
//         })
//     }

//     const getQueryByIdService = new GetQueryByIdService()

//     const result = await getQueryByIdService.handle({
//        queryId: req.params.queryId
//     })

//     if (result.status && result.query) {
//         return res.send({
//             query : result.query,
//             status : RouterApiStatus.OK
//         })    
//     } else {
//         return res.send({
//             status: RouterApiStatus.ERROR,
//             msg: "Query not found"
//         })
//     }
// })

export {
    DatasetRouter
}