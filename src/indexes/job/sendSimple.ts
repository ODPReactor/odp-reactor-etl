import { DatasetIndexingHandler } from "./DatasetIndexingHandler";


const datasetIndexer = new DatasetIndexingHandler({})

datasetIndexer.index("ds1").then(()=>{
    datasetIndexer.close()
})


