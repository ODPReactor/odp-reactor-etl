// move this global library
type Dataset = {
    sparqlEndpoint: string
    graph : string
}

type IndexPatternCollectionsServiceInput = {
    dataset : Dataset
    offset : number
}

type IndexResponse = {
    // statusCode?
}



export class IndexPatternCollectionsService {
    async handle(input : IndexPatternCollectionsServiceInput) {
        //for each pattern


        // PatternInstance extends Resource and is a collection of Resource
        
        // patternInstanceRepository.getTotalPatternInstances(input.dataset)
        // for (let i=offset; i<=totalPatternInstances; i = i + offset)
            // uniqueEntities: Resource[] : patternInstanceRepository.getMainUniqueEntitiesBatch(patternResource : Resource, offset : number)
            // patternInstances: PatternInstance[] patternInstanceRepository.getPatternInstancesFromUniqueEntities(patternEntities : Resource[])
            // transformedPatternInstances = PatternInstanceTransformer.enrichEntities(patternEntities: Resource[]) ?
            // indexResponse IndexResponse = indexRepository.push(transofrmedPatternInstances, generatedIndexName)
        // 

        // c'è un errore che si fa? Si blocca tutto e si avvisa la GUI ?
        // una % di errore è tollerata? si emettono messaggi e si ascolta se qualcun'altro blocca tutto ?


        // altra roba da notificare? La progressione delle operazioni. Tempo totale stimato (si tiene la distribuzione di ogni iterazione si fa la media e 
        // si calcola il tempo totale stimato)
        // Quanti pattern ci sono da indicizzare per il dato grafo
        // Quale si sta indicizzando e quante ne sono fatte sul totale

        // alla fine si notifica procedura completata e i nuovi id degli indici

        // odp-reactor server deve aggiornare i nomi degli indici per rispondere alle chiamate di GUI

    }
}