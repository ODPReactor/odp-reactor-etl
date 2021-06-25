import express, {Request, Response} from "express"
import {json} from "body-parser"

const ArCoETLRouter = express.Router()
ArCoETLRouter.use(json())


enum ArCoETLApiStatus {
    ERROR = "ERROR",
    OK = "OK"
}

ArCoETLRouter.post("/index", async (req: Request<{}, {}, {
    apiKey: string,
}>, res: Response) => {



    // manager.start()
    // manager.instances_buffer = []
    // manager.transformed_instances_buffer = []
    // manager.instance_loader_buffer = []
    // while(not_finished)
    //     async(instancesExtractor.get_and_push_to_instances_buffer()) <= keeps its state with pagination / when finished notify manager 
    //     async(instanceExtractor.get_single_instance_data_and_push_to_manager())
    //     async(instanceLoader.push_maximum_of_4K_instances_from_buffer_and_push_to_index())




    // const createOrderInput = req.body.create
    // const apiKey = req.body.cassanovaApiKey
    // if (!apiKey || !apiKey) return res.status(400).json({
    //     status: CassanovaAdapterApiStatus.ERROR,
    //     reason: `Missing either "cassanovaApiKey" or "create" parameter`
    // })

    // const adapter = container.resolve(CassanovaAdapter)
    // try {
    //     await adapter.sendOrder(
    //         apiKey,
    //         createOrderInput
    //     )
    // } catch (e) {
    //     return res.status(500).json({
    //         status: CassanovaAdapterApiStatus.ERROR,
    //         reason: e.message
    //     })
    // }

    // return res.status(200).json({
    //     status: CassanovaAdapterApiStatus.OK
    // })

})


export {
    ArCoETLRouter
}