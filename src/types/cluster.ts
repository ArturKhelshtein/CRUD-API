export interface IWorkerMessage {
    type: 'request';
    method: string;
    pathname: string;
    body: any;
}

export interface IPrimaryMessage {
    type: 'response';
    statusCode: number;
    body: any;
    id?: string;
}
