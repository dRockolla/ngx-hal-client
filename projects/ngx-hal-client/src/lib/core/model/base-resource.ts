import { HttpParams } from '@angular/common/http';
import { of as observableOf, throwError as observableThrowError } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { catchError, map } from 'rxjs/operators';
import uriTemplates from 'uri-templates';
import { CacheHelper } from '../cache/cache.helper';
import { CustomEncoder } from '../util/custom-encoder';
import { ResourceUtils } from '../util/resource.utils';
import { HalOptions, LinkOptions } from './common';
import { SubTypeBuilder } from './interface/subtype-builder';
import { Resource } from './resource';
import { ResourceArray } from './resource-array';
import { HttpConfigService } from '../service/http-config.service';
import { DependencyInjector } from '../util/dependency-injector';
import { UrlUtils } from '../util/url.utils';
import { ObjectUtils } from '../util/object.utils';
import { ResourceClientService } from '../service/resource-client.service';

export interface Link {
    href: string;
    templated?: boolean;
}

export interface Links {
    [key: string]: Link;
}

export abstract class BaseResource {

    public _links: Links;

    protected resourceClientService: ResourceClientService;

    private httpConfig: HttpConfigService;

    constructor() {
        this.httpConfig = DependencyInjector.get(HttpConfigService);
        this.resourceClientService = DependencyInjector.get(ResourceClientService);
    }

// Get related resource
    public getRelation<T extends Resource>(type: new() => T,
                                           relation: string,
                                           builder?: SubTypeBuilder,
                                           expireMs: number = CacheHelper.defaultExpire,
                                           isCacheActive: boolean = true): Observable<Resource> {
        let result: T = new type();
        if (this.existRelationLink(relation)) {
            if (CacheHelper.ifPresent(this.getRelationLinkHref(relation), null, null, isCacheActive)) {
                return observableOf(CacheHelper.get(this.getRelationLinkHref(relation)));
            }

            const observable =
                this.resourceClientService.getResource(this.getRelationLinkHref(relation));
            return observable.pipe(map((data: any) => {
                if (builder) {
                    for (const embeddedClassName of Object.keys(data._links)) {
                        if (embeddedClassName === 'self') {
                            const href: string = data._links[embeddedClassName].href;
                            const idx: number = href.lastIndexOf('/');
                            const realClassName = href.replace(this.httpConfig.rootUri, '').substring(0, idx);
                            result = ResourceUtils.searchSubtypes(builder, realClassName, result);
                            break;
                        }
                    }
                }
                const resource: T = ResourceUtils.instantiateResource(result, data);
                CacheHelper.put(this.getRelationLinkHref(relation), resource, expireMs);
                return resource;
            }));
        } else {
            return observableOf(null);
        }
    }

    public getProjection<T extends Resource>(type: new() => T,
                                             resource: string,
                                             id: string,
                                             projectionName: string,
                                             expireMs: number = CacheHelper.defaultExpire,
                                             isCacheActive: boolean = true): Observable<Resource> {
        const uri = this.resourceClientService.generateResourceUrl(resource).concat('/', id).concat('?projection=' + projectionName);
        const result: T = new type();

        if (CacheHelper.ifPresent(uri, null, null, isCacheActive)) {
            return observableOf(CacheHelper.get(uri));
        }

        return this.resourceClientService.getResource(uri)
            .pipe(
                map(data => {
                    const filledResource: T = ResourceUtils.instantiateResource(result, data);
                    CacheHelper.put(uri, filledResource, expireMs);
                    return filledResource;
                }),
                catchError(error => observableThrowError(error))
            );
    }

    // Get collection of related resources
    public getRelationArray<T extends Resource>(type: new() => T,
                                                relation: string,
                                                options?: HalOptions,
                                                embedded?: string,
                                                builder?: SubTypeBuilder,
                                                expireMs: number = CacheHelper.defaultExpire,
                                                isCacheActive: boolean = true): Observable<T[]> {

        const httpParams = UrlUtils.optionParams(new HttpParams({encoder: new CustomEncoder()}), options);
        const result: ResourceArray<T> = new ResourceArray<T>(ObjectUtils.isNullOrUndefined(embedded) ? '_embedded' : embedded);
        if (this.existRelationLink(relation)) {
            if (CacheHelper.ifPresent(this.getRelationLinkHref(relation), null, options, isCacheActive)) {
                return observableOf(CacheHelper.getArray(this.getRelationLinkHref(relation)));
            }

            // Use this obj to clear relation url from any http params template because we will pass params in request
            const urlAsObj = new URL(this.getRelationLinkHref(relation));
            return this.resourceClientService.getResource(`${ urlAsObj.origin }${ urlAsObj.pathname }`,
                {
                    params: httpParams
                })
                .pipe(
                    map(response => ResourceUtils.instantiateResourceCollection<T>(type, response, result, builder)),
                    catchError(error => observableThrowError(error))
                )
                .pipe(map((array: ResourceArray<T>) => {
                    CacheHelper.putArray(this.getRelationLinkHref(relation), array.result, expireMs);
                    return array.result;
                }));
        } else {
            return observableOf([]);
        }
    }

    public getProjectionArray<T extends Resource>(type: new() => T,
                                                  resource: string,
                                                  projectionName: string,
                                                  expireMs: number = CacheHelper.defaultExpire,
                                                  isCacheActive: boolean = true): Observable<T[]> {
        const uri = this.resourceClientService.generateResourceUrl(resource).concat('?projection=' + projectionName);
        const result: ResourceArray<T> = new ResourceArray<T>('_embedded');

        if (CacheHelper.ifPresent(uri, null, null, isCacheActive)) {
            return observableOf(CacheHelper.getArray(uri));
        }
        return this.resourceClientService.getResource(uri)
            .pipe(
                map(response => ResourceUtils.instantiateResourceCollection<T>(type, response, result)),
                map((array: ResourceArray<T>) => {
                    CacheHelper.putArray(uri, array.result, expireMs);
                    return array.result;
                })
            );
    }

    // Perform post request for relation with body and url params
    public postRelation(relation: string, body: any, options?: LinkOptions): Observable<any> {
        if (!this.existRelationLink(relation)) {
            return observableThrowError('no relation found');
        }
        if (!ObjectUtils.isNullOrUndefined(options) && !ObjectUtils.isNullOrUndefined(options.params)) {
            if (this._links[relation].templated
                && !ObjectUtils.isNullOrUndefined(options.strictParams) && options.strictParams) {
                CacheHelper.evictEntityLink(this.getRelationLinkHref(relation));

                const uriTemplate = uriTemplates(this._links[relation].href);
                const url = uriTemplate.fillFromObject(options.params);

                return this.resourceClientService.postResource(url, body)
                    .pipe(
                        map(data => ResourceUtils.instantiateResource(ObjectUtils.clone(this), data))
                    );
            }

            const httpParams = UrlUtils.linkParamsToHttpParams(options.params);
            CacheHelper.evictEntityLink(this.getRelationLinkHref(relation));

            return this.resourceClientService.postResource(this.getRelationLinkHref(relation), body,
                {
                    params: httpParams
                })
                .pipe(
                    map(data => ResourceUtils.instantiateResource(ObjectUtils.clone(this), data))
                );
        }
        CacheHelper.evictEntityLink(this.getRelationLinkHref(relation));

        return this.resourceClientService.postResource(this.getRelationLinkHref(relation), body)
            .pipe(
                map(data => ResourceUtils.instantiateResource(ObjectUtils.clone(this), data))
            );
    }

    // Perform patch request for relation with body and url params
    public patchRelation(relation: string, body: any, options?: LinkOptions): Observable<any> {
        if (!this.existRelationLink(relation)) {
            return observableThrowError('no relation found');
        }
        if (!ObjectUtils.isNullOrUndefined(options) && !ObjectUtils.isNullOrUndefined(options.params)) {
            if (this._links[relation].templated
                && !ObjectUtils.isNullOrUndefined(options.strictParams) && options.strictParams) {
                CacheHelper.evictEntityLink(this.getRelationLinkHref(relation));

                const uriTemplate = uriTemplates(this._links[relation].href);
                const url = uriTemplate.fillFromObject(options.params);

                return this.resourceClientService.patchResource(url, body)
                    .pipe(
                        map(data => ResourceUtils.instantiateResource(ObjectUtils.clone(this), data))
                    );
            }

            const httpParams = UrlUtils.linkParamsToHttpParams(options.params);
            CacheHelper.evictEntityLink(this.getRelationLinkHref(relation));

            return this.resourceClientService.patchResource(this.getRelationLinkHref(relation), body,
                {
                    params: httpParams
                })
                .pipe(
                    map(data => ResourceUtils.instantiateResource(ObjectUtils.clone(this), data))
                );
        }

        return this.resourceClientService.patchResource(this.getRelationLinkHref(relation), body)
            .pipe(
                map(data => ResourceUtils.instantiateResource(ObjectUtils.clone(this), data))
            );
    }

    protected existRelationLink(relation: string): boolean {
        return !ObjectUtils.isNullOrUndefined(this._links) && !ObjectUtils.isNullOrUndefined(this._links[relation]);
    }

    protected getRelationLinkHref(relation: string) {
        if (this._links[relation].templated) {
            return UrlUtils.removeUrlTemplateVars(this._links[relation].href);
        }
        return this._links[relation].href;
    }

}
