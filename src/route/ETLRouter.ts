import express, {Request, Response} from "express"
import {json} from "body-parser"
import { PatternInstanceRepository } from "../patterninstances/PatternInstanceRepository"
import { SparqlClient, SparqlDataMapper } from "odp-reactor-persistence-interface"

const ETLRouter = express.Router()
ETLRouter.use(json())


enum ETLApiStatus {
    ERROR = "ERROR",
    OK = "OK"
}

ETLRouter.post("/index", async (req: Request<{}, {}, {
    apiKey: string,
    concurrentReq : string
}>, res: Response) => {


    const sparqlEndpoint = "https://dati.beniculturali.it/sparql"

    const sparqlClient = new SparqlClient(
        sparqlEndpoint
   )
   const sparqlDataMapper = new SparqlDataMapper()
    const patternInstanceRepo = new PatternInstanceRepository({
        dbClient: new SparqlClient(
             sparqlEndpoint
        )
    })



    const queryTitlMainUniqePatternInstanceEntities = `
    PREFIX a-loc:https://w3id.org/arco/ontology/location/
    SELECT DISTINCT ?titl WHERE {
         ?culturalProperty a-loc:hasTimeIndexedTypedLocation ?titl .
    }`

    const queryTitlEntitySpecificData = `
    PREFIX opla: <http://ontologydesignpatterns.org/opla/>
PREFIX a-loc: <https://w3id.org/arco/ontology/location/>
PREFIX cis: <http://dati.beniculturali.it/cis/>
PREFIX tiapit: <https://w3id.org/italia/onto/TI/>
PREFIX arco: <https://w3id.org/arco/ontology/arco/>
PREFIX clvapit: <https://w3id.org/italia/onto/CLV/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX a-dd: <https://w3id.org/arco/ontology/denotative-description/>


SELECT DISTINCT 
    ?culturalProperty 
    ?titl
    ?tITLLabel 
    ?locationType 
    ?locationTypeLabel
    ?lat ?long ?addressLabel ?startTime ?endTime
    cPropLabel 
WHERE {

    ?culturalProperty a-loc:hasTimeIndexedTypedLocation ?titl .
    ?titl a-loc:hasLocationType ?locationType .
    ?locationType rdfs:label ?locationTypeLabel .
    FILTER langMatches(lang(?locationTypeLabel), "it")
    OPTIONAL { ?titl a-loc:atSite ?site .
               ?site cis:siteAddress ?siteAddress .
               ?siteAddress rdfs:label ?addressLabel2B . 
              }
    OPTIONAL { ?titl tiapit:atTime ?timeInterval . 
                ?timeInterval arco:startTime ?startTime2B .
                ?timeInterval arco:endTime ?endTime2B . 
              }
    OPTIONAL { ?titl a-loc:atSite ?site .
               ?site clvapit:hasGeometry ?geometry .
               ?geometry clvapit:lat ?lat2B .
               ?geometry clvapit:long ?long2B . 
              }
    OPTIONAL { ?culturalProperty rdfs:label ?cPropLabel2B . 
                FILTER langMatches(lang(?cPropLabel2B), "it")
              }
    OPTIONAL { ?titl rdfs:label ?tITLLabel2B . 
                FILTER langMatches(lang(?tITLLabel2B), "it")  
              }
    OPTIONAL { ?culturalProperty foaf:depiction ?depiction2B . 
              } .                
    BIND ( IF (BOUND (?depiction2B), ?depiction2B, '')  as ?depiction) . 
    BIND ( IF (BOUND (?tITLLabel2B), ?tITLLabel2B, '')  as ?tITLLabel) . 
    BIND ( IF (BOUND (?cPropLabel2B), ?cPropLabel2B, '')  as ?cPropLabel) .
    BIND ( IF (BOUND (?lat2B),  ?lat2B,  '')  as ?lat) . 
    BIND ( IF (BOUND (?long2B), ?long2B, '')  as ?long) . 
    BIND ( IF (BOUND (?addressLabel2B),?addressLabel2B,'')  as ?addressLabel ) .  
    BIND ( IF (BOUND (?startTime2B),?startTime2B,'')  as ?startTime) .         
    BIND ( IF (BOUND (?endTime2B),  ?endTime2B,'')  as ?endTime) .
}`

    // get 4k instances per query
    // const batchSize = 4000
    const batchSize = Number.parseInt(req.body.concurrentReq) || 100

    // get MaxNumber of instance
    // const maxInstances = patternInstanceRepo.getMaxNumber
    const maxInstances = 3317950
    
    
    for (let offset = batchSize; offset < maxInstances + batchSize; offset = offset + batchSize ) {
        console.log("Sending request")
        console.time("uniqe-instances")
        const batchInstancesBindings = await sparqlClient.sendRequest(
            {
                query: `
                PREFIX a-loc: <https://w3id.org/arco/ontology/location/>
                SELECT DISTINCT ?titl WHERE {
                     ?culturalProperty a-loc:hasTimeIndexedTypedLocation ?titl .
                }  LIMIT ${batchSize} OFFSET ${offset}
                `
                //ORDER BY ?titl 20s
            }

        )
        console.timeEnd("uniqe-instances")

        const titls = await sparqlDataMapper.parseBindings(batchInstancesBindings)

        console.time("instance-data")
        const getTitlsRequests = titls.map((result : {
            titl : string
        }, index: any)=> {
            const titl = result.titl
            return sparqlClient.sendRequest({
                query: `

                PREFIX opla: <http://ontologydesignpatterns.org/opla/>
                PREFIX a-loc: <https://w3id.org/arco/ontology/location/>
                PREFIX cis: <http://dati.beniculturali.it/cis/>
                PREFIX tiapit: <https://w3id.org/italia/onto/TI/>
                PREFIX arco: <https://w3id.org/arco/ontology/arco/>
                PREFIX clvapit: <https://w3id.org/italia/onto/CLV/>
                PREFIX foaf: <http://xmlns.com/foaf/0.1/>
                PREFIX a-dd: <https://w3id.org/arco/ontology/denotative-description/>
                
                SELECT DISTINCT 
    ?culturalProperty 
    ?tITLLabel 
    ?locationType 
    ?locationTypeLabel
    ?lat ?long ?addressLabel ?startTime ?endTime
    ?cPropLabel 
WHERE {

    ?culturalProperty a-loc:hasTimeIndexedTypedLocation <${titl}> .
    <${titl}> a-loc:hasLocationType ?locationType .
    ?locationType rdfs:label ?locationTypeLabel .
    FILTER langMatches(lang(?locationTypeLabel), "it")
    OPTIONAL { <${titl}> a-loc:atSite ?site .
               ?site cis:siteAddress ?siteAddress .
               ?siteAddress rdfs:label ?addressLabel2B . 
              }
    OPTIONAL { <${titl}> tiapit:atTime ?timeInterval . 
                ?timeInterval arco:startTime ?startTime2B .
                ?timeInterval arco:endTime ?endTime2B . 
              }
    OPTIONAL { <${titl}> a-loc:atSite ?site .
               ?site clvapit:hasGeometry ?geometry .
               ?geometry clvapit:lat ?lat2B .
               ?geometry clvapit:long ?long2B . 
              }
    OPTIONAL { ?culturalProperty rdfs:label ?cPropLabel2B . 
                FILTER langMatches(lang(?cPropLabel2B), "it")
              }
    OPTIONAL { <${titl}> rdfs:label ?tITLLabel2B . 
                FILTER langMatches(lang(?tITLLabel2B), "it")  
              }
    OPTIONAL { ?culturalProperty foaf:depiction ?depiction2B . 
              } .                
    BIND ( IF (BOUND (?depiction2B), ?depiction2B, '')  as ?depiction) . 
    BIND ( IF (BOUND (?tITLLabel2B), ?tITLLabel2B, '')  as ?tITLLabel) . 
    BIND ( IF (BOUND (?cPropLabel2B), ?cPropLabel2B, '')  as ?cPropLabel) .
    BIND ( IF (BOUND (?lat2B),  ?lat2B,  '')  as ?lat) . 
    BIND ( IF (BOUND (?long2B), ?long2B, '')  as ?long) . 
    BIND ( IF (BOUND (?addressLabel2B),?addressLabel2B,'')  as ?addressLabel ) .  
    BIND ( IF (BOUND (?startTime2B),?startTime2B,'')  as ?startTime) .         
    BIND ( IF (BOUND (?endTime2B),  ?endTime2B,'')  as ?endTime) .
}
LIMIT 1
                `
            }).then((v) => {
                // console.log(index, "Complete")
            })
        })

        //https://www.npmjs.com/package/es6-promise-pool
        
        console.log(getTitlsRequests.length)
        const results = Promise.all(getTitlsRequests).then((values) => {
            console.log("Promise results", values.length)
            res.send({ iteration: 1})
            console.timeEnd("instance-data")
        }).catch(err => {
            console.log("Concurrent requests error")
        })


        // console.log(await sparqlDataMapper.parseBindings(batchInstancesBindings))
        return
        console.log(offset)
    }


    // get all instances of a given pattern

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
    ETLRouter
}