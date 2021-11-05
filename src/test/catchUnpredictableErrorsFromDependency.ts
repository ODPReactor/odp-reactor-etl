/**
 * Execute func and if it throw
 * errors
 * return false 
 * 
 * @param {()=>{}} func 
 */
export async function catchUnpredictableErrorsFromDependency(func : any, verbose=false) {
    try {
        await func()
    } catch(error) {
        if (verbose) {
            console.log(error)
        }
        return false
    }
    return true
}