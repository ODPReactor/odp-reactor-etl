import express, {Request, Response} from "express"
import {json} from "body-parser"
import { GetAllDatasetsService } from "../dataset/service/GetAllDatasetsService"
import { CreateDatasetService } from "../dataset/service/CreateDatasetService"
import { DeleteDatasetService, DeleteDatasetServiceStatusEnum } from "../dataset/service/DeleteDatasetService"
import { GetDatasetByIdService } from "../dataset/service/GetDatasetByIdService"
import { UpdateDatasetService } from "../dataset/service/UpdateDatasetService"


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
            msg: "Error while creating dataset"
        })
    }

    return res.send({
        newDataset: createDatasetService.datasetRepository.dataMapper.toDto(createdDataset),
        status : RouterApiStatus.OK
    })

})

DatasetRouter.delete("/datasets/:datasetId", async (req: Request<{
    datasetId: string
}, {}, {
}>, res: Response) => {

    console.log(req.params)

    if (!req.params || !req.params.datasetId) {
        return res.send({
            status: RouterApiStatus.ERROR,
            msg: "Parameters not valid"
        })
    }

    const deleteDatasetService = new DeleteDatasetService()

    const result = await deleteDatasetService.handle({ id: req.params.datasetId })

    result.status === DeleteDatasetServiceStatusEnum.FAILED ? res.send({
        status: RouterApiStatus.ERROR,
        msg: "Error while deleting dataset"
    }) : res.send({
        status: RouterApiStatus.OK,
        datasets: result.datasets
    })

})

DatasetRouter.get("/datasets/:datasetId", async (req: Request<{
    datasetId: string
}, {}, {

}>, res: Response) => {

    console.log(req.params)

    if (!req.params.datasetId) {
        return res.send({
            status: RouterApiStatus.ERROR,
            msg: "Parameters not valid"
        })
    }

    const getDatasetByIdService = new GetDatasetByIdService()

    const result = await getDatasetByIdService.handle({
       datasetId: req.params.datasetId
    })

    if (result.status && result.dataset) {
        return res.send({
            dataset : result.dataset,
            status : RouterApiStatus.OK
        })    
    } else {
        return res.send({
            status: RouterApiStatus.ERROR,
            msg: "Dataset not found"
        })
    }
})

DatasetRouter.put("/datasets", async (req: Request<{
}, {}, {
    dataset: {
        id: string,
        sparqlEndpoint: string,
        graph: string | undefined,
        label: string,
        indexed: boolean    
    }
}>, res: Response) => {


    console.log(req.body)

    if (!req.body || !req.body.dataset || !req.body.dataset.sparqlEndpoint || !req.body.dataset.id || !req.body.dataset.label ) {
        return res.send({
            status: RouterApiStatus.ERROR,
            msg: "Parameters not valid"
        })
    }

    const updatedatasetService = new UpdateDatasetService()


    const updateddataset = await updatedatasetService.handle({ datasetDTO: req.body.dataset })

    if (!updateddataset) {
        res.send({
            status: RouterApiStatus.ERROR,
            msg: "Error while updating dataset"
        })
    }

    return res.send({
        status: RouterApiStatus.OK,
        dataset: updateddataset?.toJSON()
    })
})

export {
    DatasetRouter
}