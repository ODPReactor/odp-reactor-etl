/**
 * Execute func and if it throw
 * errors
 * return false 
 * 
 * @param {()=>{}} func 
 */
export async function catchUnpredictableErrorsFromDependency(func : any) {
    try {
        await func()
    } catch(error) {
        return false
    }
    return true
}