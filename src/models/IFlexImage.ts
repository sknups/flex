import {IFlexCoordinates} from "./IFlexCoordinates";

export interface IFlexImage<T> {
    image: PromiseSettledResult<T>;
    coords: IFlexCoordinates;
}
