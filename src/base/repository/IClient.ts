/**
 * IClient interface implemented by 
 * objects that can communicate with endpoint, 
 * database, file system in an asynchronous manner.
 */
export interface IClient {
    sendRequest(requestInput : any) : Promise<any>
}