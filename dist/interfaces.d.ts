export interface IProcessResultsConfig {
    fields?: Array<string>;
    filter?: {
        [key: string]: any;
    };
    q?: boolean;
    start?: number;
    end?: number;
    limit?: number;
    page?: number;
    order?: Array<string>;
    sort?: 'asc' | 'desc';
}
export interface Dictionary<T> {
    [key: string]: T;
}
