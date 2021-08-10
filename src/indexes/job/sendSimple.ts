import { DatasetIndexer } from "./DatasetIndexer";


const datasetIndexer = new DatasetIndexer({})

datasetIndexer.index("ds1").then(()=>{
    datasetIndexer.close()
})


