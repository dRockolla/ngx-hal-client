import { HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError as observableThrowError } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';

import { catchError, map } from 'rxjs/operators';
import { CacheHelper } from '../cache/cache.helper';
import { HalOptions, HalParam, Include, ResourceOptions } from '../model/common';
import { Sort } from '../model/interface/sort';
import { SubTypeBuilder } from '../model/interface/subtype-builder';
import { Resource } from '../model/resource';
import { ResourceArray } from '../model/resource-array';
import { CustomEncoder } from '../util/custom-encoder';
import { ResourceHelper } from '../util/resource-helper';
import { HttpConfigService } from './http-config.service';
import { UrlUtils } from '../util/url.utils';
import { ResourceClientService } from './resource-client.service';

@Injectable()
export class ResourceService {

    constructor(private httpConfig: HttpConfigService,
                private resourceClientService: ResourceClientService) {
    }

    public getAll<T extends Resource>(type: new() => T,
                                      resource: string,
                                      embedded: string,
                                      options?: HalOptions,
                                      subType?: SubTypeBuilder): Observable<ResourceArray<T>> {
        const uri = this.resourceClientService.generateResourceUrl(resource);
        const httpParams = UrlUtils.optionParams(new HttpParams({encoder: new CustomEncoder()}), options);
        const result: ResourceArray<T> = new ResourceArray<T>(embedded);

        result.sortInfo = options ? options.sort : undefined;
        const observable = this.resourceClientService.getResource(uri, {
            headers: ResourceHelper.headers,
            params: httpParams
        });
        return observable.pipe(
            map(response => ResourceHelper.instantiateResourceCollection(type, response, result, subType)),
            catchError(error => observableThrowError(error)));
    }

    public get<T extends Resource>(type: new() => T, resource: string, id: any, params?: HalParam[]): Observable<T> {
        const uri = this.resourceClientService.generateResourceUrl(resource).concat('/', id);
        const result: T = new type();
        const httpParams = UrlUtils.params(new HttpParams(), params);

        const observable = this.resourceClientService.getResource(uri, {
            headers: ResourceHelper.headers,
            params: httpParams
        });
        return observable.pipe(map(data => ResourceHelper.instantiateResource(result, data)),
            catchError(error => observableThrowError(error)));
    }

    public getBySelfLink<T extends Resource>(type: new() => T, resourceLink: string): Observable<T> {
        const result: T = new type();

        const observable = this.resourceClientService.getResource(resourceLink,
            {headers: ResourceHelper.headers});
        return observable.pipe(map(data => ResourceHelper.instantiateResource(result, data)),
            catchError(error => observableThrowError(error)));
    }

    public search<T extends Resource>(type: new() => T, query: string, resource: string, embedded: string, options?: HalOptions,
                                      subType?: SubTypeBuilder): Observable<ResourceArray<T>> {
        const uri = this.resourceClientService.generateResourceUrl(resource).concat('/search/', query);
        const httpParams = UrlUtils.optionParams(new HttpParams({encoder: new CustomEncoder()}), options);
        const result: ResourceArray<T> = new ResourceArray<T>(embedded);

        const observable = this.resourceClientService.getResource(uri, {
            headers: ResourceHelper.headers,
            params: httpParams
        });
        return observable.pipe(map(response => ResourceHelper.instantiateResourceCollection(type, response, result, subType)),
            catchError(error => observableThrowError(error)));
    }

    public searchSingle<T extends Resource>(type: new() => T, query: string, resource: string, options?: HalOptions): Observable<T> {
        const uri = this.resourceClientService.generateResourceUrl(resource).concat('/search/', query);
        const httpParams = UrlUtils.optionParams(new HttpParams({encoder: new CustomEncoder()}), options);
        const result: T = new type();

        const observable = this.resourceClientService.getResource(uri, {
            headers: ResourceHelper.headers,
            params: httpParams
        });
        return observable.pipe(map(response => ResourceHelper.instantiateResource(result, response)),
            catchError(error => observableThrowError(error)));
    }

    public customQuery<T extends Resource>(type: new() => T,
                                           query: string,
                                           resource: string,
                                           embedded: string,
                                           options?: HalOptions,
                                           subType?: SubTypeBuilder): Observable<ResourceArray<T>> {
        const uri = this.resourceClientService.generateResourceUrl(resource + query);
        const httpParams = UrlUtils.optionParams(new HttpParams({encoder: new CustomEncoder()}), options);
        const result: ResourceArray<T> = new ResourceArray<T>(embedded);

        const observable = this.resourceClientService.getResource(uri, {
            headers: ResourceHelper.headers,
            params: httpParams
        });
        return observable.pipe(map(response => ResourceHelper.instantiateResourceCollection(type, response, result, subType)),
            catchError(error => observableThrowError(error)));
    }

    public customQueryPost<T extends Resource>(type: new() => T, query: string, resource: string,
                                               embedded: string, options?: HalOptions, body?: any,
                                               subType?: SubTypeBuilder): Observable<ResourceArray<T>> {
        const uri = this.resourceClientService.generateResourceUrl(resource + query);
        const httpParams = UrlUtils.optionParams(new HttpParams(), options);
        const result: ResourceArray<T> = new ResourceArray<T>(embedded);

        const observable = this.resourceClientService.postResource(uri, body, {
            headers: ResourceHelper.headers,
            params: httpParams
        });
        return observable.pipe(map(response => ResourceHelper.instantiateResourceCollection(type, response, result, subType)),
            catchError(error => observableThrowError(error)));
    }

    public getByRelation<T extends Resource>(type: new() => T, resourceLink: string): Observable<T> {
        const result: T = new type();

        const observable = this.resourceClientService.getResource(resourceLink, {headers: ResourceHelper.headers});
        return observable.pipe(map(data => ResourceHelper.instantiateResource(result, data)),
            catchError(error => observableThrowError(error)));
    }

    public getByRelationArray<T extends Resource>(type: new() => T,
                                                  resourceLink: string,
                                                  embedded: string,
                                                  builder?: SubTypeBuilder): Observable<ResourceArray<T>> {
        const result: ResourceArray<T> = new ResourceArray<T>(embedded);

        const observable = this.resourceClientService.getResource(resourceLink, {headers: ResourceHelper.headers});
        return observable.pipe(
            map(response => ResourceHelper.instantiateResourceCollection(type, response, result, builder)),
            catchError(error => observableThrowError(error))
        );
    }

    public getProjection<T extends Resource>(type: new() => T,
                                             resource: string,
                                             id: string,
                                             projectionName: string): Observable<T> {
        const uri = this.resourceClientService.generateResourceUrl(resource).concat('/', id).concat('?projection=' + projectionName);
        const result: T = new type();

        const observable = this.resourceClientService.getResource(uri, {headers: ResourceHelper.headers});
        return observable.pipe(
            map(data => ResourceHelper.instantiateResource(result, data)),
            catchError(error => observableThrowError(error))
        );
    }

    public getProjectionArray<T extends Resource>(type: new() => T,
                                                  resource: string,
                                                  projectionName: string): Observable<T[]> {
        const uri = this.resourceClientService.generateResourceUrl(resource).concat('?projection=' + projectionName);
        const result: ResourceArray<T> = new ResourceArray<T>('_embedded');

        const observable = this.resourceClientService.getResource(uri, {headers: ResourceHelper.headers});
        return observable
            .pipe(
                map(response => ResourceHelper.instantiateResourceCollection<T>(type, response, result)),
                catchError(error => observableThrowError(error))
            ).pipe(map((resourceArray: ResourceArray<T>) => {
                return resourceArray.result;
            }));
    }

    public count(resource: string, query?: string, options?: HalOptions): Observable<number> {
        const uri = this.resourceClientService.generateResourceUrl(resource)
            .concat('/search/' + (query === undefined ? 'countAll' : query));
        const httpParams = UrlUtils.optionParams(new HttpParams(), options);

        return this.resourceClientService.getResource(uri, {
            headers: ResourceHelper.headers,
            observe: 'response',
            params: httpParams
        }).pipe(
            map((response: HttpResponse<number>) => Number(response.body)),
            catchError(error => observableThrowError(error)));
    }

    public create<T extends Resource>(selfResource: string, entity: T) {
        const uri = this.httpConfig.getURL() + selfResource;
        const payload = ResourceHelper.resolveRelations(entity);

        const observable = this.resourceClientService.postResource(uri, payload, {
            headers: ResourceHelper.headers,
            observe: 'response'
        });
        return observable.pipe(map((response: HttpResponse<string>) => {
            if (response.status >= 200 && response.status <= 207) {
                return ResourceHelper.instantiateResource(entity, response.body);
            } else if (response.status === 500) {
                const body: any = response.body;
                return observableThrowError(body.error);
            }
        }), catchError(error => observableThrowError(error)));
    }

    public update<T extends Resource>(entity: T) {
        CacheHelper.evictEntityLinks(entity);
        const uri = entity._links.self.href;
        const payload = ResourceHelper.resolveRelations(entity);
        const observable = this.resourceClientService.putResource(uri, payload, {
            headers: ResourceHelper.headers,
            observe: 'response'
        });
        return observable.pipe(map((response: HttpResponse<string>) => {
            if (response.status >= 200 && response.status <= 207) {
                return ResourceHelper.instantiateResource(entity, response.body);
            } else if (response.status === 500) {
                const body: any = response.body;
                return observableThrowError(body.error);
            }
        }), catchError(error => observableThrowError(error)));
    }

    public patch<T extends Resource>(entity: T, options?: Array<ResourceOptions> | Include) {
        CacheHelper.evictEntityLinks(entity);
        const uri = entity._links.self.href;
        const payload = ResourceHelper.resolveRelations(entity, options);
        const observable = this.resourceClientService.patchResource(uri, payload, {
            headers: ResourceHelper.headers,
            observe: 'response'
        });
        return observable.pipe(map((response: HttpResponse<string>) => {
            if (response.status >= 200 && response.status <= 207) {
                return ResourceHelper.instantiateResource(entity, response.body);
            } else if (response.status === 500) {
                const body: any = response.body;
                return observableThrowError(body.error);
            }
        }), catchError(error => observableThrowError(error)));
    }

    public delete<T extends Resource>(entity: T): Observable<object> {
        CacheHelper.evictEntityLinks(entity);
        const uri = entity._links.self.href;
        return this.resourceClientService.deleteResource(uri, {headers: ResourceHelper.headers})
            .pipe(catchError(error => observableThrowError(error)));
    }

    public hasNext<T extends Resource>(resourceArray: ResourceArray<T>): boolean {
        return resourceArray.nextUri !== undefined;
    }

    public hasPrev<T extends Resource>(resourceArray: ResourceArray<T>): boolean {
        return resourceArray.prevUri !== undefined;
    }

    public hasFirst<T extends Resource>(resourceArray: ResourceArray<T>): boolean {
        return resourceArray.firstUri !== undefined;
    }

    public hasLast<T extends Resource>(resourceArray: ResourceArray<T>): boolean {
        return resourceArray.lastUri !== undefined;
    }

    public next<T extends Resource>(resourceArray: ResourceArray<T>, type: new() => T): Observable<ResourceArray<T>> {
        return resourceArray.next(type);
    }

    public prev<T extends Resource>(resourceArray: ResourceArray<T>, type: new() => T): Observable<ResourceArray<T>> {
        return resourceArray.prev(type);
    }

    public first<T extends Resource>(resourceArray: ResourceArray<T>, type: new() => T): Observable<ResourceArray<T>> {
        return resourceArray.first(type);
    }

    public last<T extends Resource>(resourceArray: ResourceArray<T>, type: new() => T): Observable<ResourceArray<T>> {
        return resourceArray.last(type);
    }

    public page<T extends Resource>(resourceArray: ResourceArray<T>, type: new() => T, id: number): Observable<ResourceArray<T>> {
        return resourceArray.page(type, id);
    }

    public sortElements<T extends Resource>(resourceArray: ResourceArray<T>,
                                            type: new() => T,
                                            ...sort: Sort[]): Observable<ResourceArray<T>> {
        return resourceArray.sortElements(type, ...sort);
    }

    public size<T extends Resource>(resourceArray: ResourceArray<T>, type: new() => T, size: number): Observable<ResourceArray<T>> {
        return resourceArray.size(type, size);
    }

}
