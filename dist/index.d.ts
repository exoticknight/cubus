export declare type Index = {
    [key: string]: string[];
};
export declare type Bucket<T> = {
    [key: string]: T;
};
export declare type DataCubeJSON<T> = {
    dimensions: string[];
    index: Index;
    data: Bucket<T>;
    splitter: string;
};
export declare type Query = {
    [key: string]: string[];
};
export declare type Result<T> = {
    value: T;
    property: {
        name: string;
        value: string;
    }[];
};
export default class DataCube<T> {
    private $$dimensions;
    private $$index;
    private $$bucket;
    private $$splitter;
    constructor(dimensions: string[], splitter?: string);
    query(query: Query): Result<T>[];
    query(query: Query, raw: boolean): T[];
    addDimensionValue(d: string, v: string): number;
    add(raw: T, property: {
        [key: string]: string;
    }, force?: boolean): this;
    remove(property: {
        [key: string]: string[];
    }): this;
    clear(): this;
    toJSON(splitter?: string): DataCubeJSON<T>;
    fromJSON<T>(json: DataCubeJSON<T>): this;
}
