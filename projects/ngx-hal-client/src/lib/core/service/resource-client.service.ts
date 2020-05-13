import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { HttpConfigService } from './http-config.service';
import { Observable } from 'rxjs';

@Injectable()
export class ResourceClientService {

    constructor(private httpClient: HttpClient,
                private httpConfig: HttpConfigService) {
    }

    public getResource(url: string, options?: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe?: 'body' | 'response';
        params?: HttpParams | {
            [param: string]: string | string[];
        }
    }): Observable<any> {
        if (options?.observe === 'response') {
            return this.httpClient.get(this.httpConfig.getProxy(url), {...options, observe: 'response'});
        } else {
            return this.httpClient.get(this.httpConfig.getProxy(url), {...options, observe: 'body'});
        }
    }

    public postResource(url: string, body: any | null, options?: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe?: 'body' | 'response';
        params?: HttpParams | {
            [param: string]: string | string[];
        }
    }): Observable<any> {
        if (options?.observe === 'response') {
            return this.httpClient.post(this.httpConfig.getProxy(url), body, {...options, observe: 'response'});
        } else {
            return this.httpClient.post(this.httpConfig.getProxy(url), body, {...options, observe: 'body'});
        }
    }

    public putResource(url: string, body: any | null, options?: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe?: 'body' | 'response';
        params?: HttpParams | {
            [param: string]: string | string[];
        }
    }): Observable<any> {
        if (options?.observe === 'response') {
            return this.httpClient.put(this.httpConfig.getProxy(url), body, {...options, observe: 'response'});
        } else {
            return this.httpClient.put(this.httpConfig.getProxy(url), body, {...options, observe: 'body'});
        }
    }

    public patchResource(url: string, body: any | null, options?: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe?: 'body' | 'response';
        params?: HttpParams | {
            [param: string]: string | string[];
        }
    }): Observable<any> {
        if (options?.observe === 'response') {
            return this.httpClient.patch(this.httpConfig.getProxy(url), body, {...options, observe: 'response'});
        } else {
            return this.httpClient.patch(this.httpConfig.getProxy(url), body, {...options, observe: 'body'});
        }
    }

    public deleteResource(url: string, options?: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe?: 'body' | 'response';
        params?: HttpParams | {
            [param: string]: string | string[];
        }
    }): Observable<any> {
        if (options?.observe === 'response') {
            return this.httpClient.delete(this.httpConfig.getProxy(url), {...options, observe: 'response'});
        } else {
            return this.httpClient.delete(this.httpConfig.getProxy(url), {...options, observe: 'body'});
        }
    }

    // public getResourcesPage<T extends Resource>(): Observable<ResourcePage<T>> {
    //     if (uri) {
    //         return this.httpClient.get(this.httpConfig.getProxy(uri),
    //             {headers: ResourceHelper.headers})
    //             .pipe(
    //                 map((response: PageResult<T>) => this.init(response)),
    //                 catchError(error => observableThrowError(error)));
    //     }
    //     return observableThrowError(`no ${uri} link defined`);
    // }

    public generateResourceUrl(resource?: string): string {
        let url = this.httpConfig.getURL();
        if (!url.endsWith('/')) {
            url = url.concat('/');
        }
        if (resource) {
            return url.concat(resource);
        }

        url = url.replace('{?projection}', '');
        return url;
    }

}
