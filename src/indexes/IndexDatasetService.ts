export class IndexDatasetService {
    async handle({}) {
        // get All queries

        // recupera queries

        // forEveryQuery
            // patternExtractor.verifyIfThereArePatterns(someInput: the query)
            // if (true) associate the pattern to the dataset: DatasetRepository.addPattern({ uri, label, indexname?})
            // for offset ...
                // instances = patternExtractor.extractPattern()   <= come lo fa non importa, una query, due, dieci degli offset ecc. l'algoritmo di valentina
                // DatasetRepository.addPatternInstances(patternId, instances) // le carica sull'indice
        
        // elimina indice: elimina l'indice in base all'uri elimina l'associazione tra il Dataset e i pattern
        
    }
}