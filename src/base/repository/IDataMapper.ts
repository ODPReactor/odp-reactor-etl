export interface IDataMapper {
    toEntity<D, E>(d: D, ...rest: any): E
    toDto<E, D>(e: E): D
}
