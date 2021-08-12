4/5 hours

Dataset
	IndexingStatus 
		{
			status: "cancel","complete","progress",
			percentage: 20
		}

DatasetRepo
	addPattern	// to know all the patterns of a dataset
			// attention when updating dataset not to deleting this refs

	getIndexingStatus()
	setIndexingStatus()	// we need a cancel indexing
				// such that a client can cancel indexing

				// the indexing job can read the


2 hours
	
Complete the IndexingService and try it



4 hours
1)

// create Pattern API
//	frontend asks patterns for dataset to API (ds should be indexed)
//	


3/4 days

2)

// create PatternInstances API
//	frontend asks patternInstances to API

// transform filters into server side filters? They should be passed to patternInstancesAPI


2 days

3) associate VisualPattern to URI

// on dev side you have frames or can create frames, and add they're label + ID to a file
//	such that the client can resolve them and know which they are (dynamic loading React)
//	then the user can map patternURI to a specific VisualFrame
//	such that he/she can change them dynamically





// understand with colleagues how they suppose to specify relations between 
//	entities/patterns/collections

// next: move the service in a separate service / component
