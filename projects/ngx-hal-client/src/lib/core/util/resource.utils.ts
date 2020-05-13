import { BaseResource } from '../model/base-resource';
import { Include, ResourceOptions } from '../model/common';
import { isEmbeddedResource } from '../model/defenition';
import { SubTypeBuilder } from '../model/interface/subtype-builder';
import { Resource } from '../model/resource';
import { ResourceArray } from '../model/resource-array';
import { ObjectUtils } from './object.utils';
import { EmbeddedResource } from '../model/embedded-resource';

export class ResourceUtils {

    public static resolveRelations(resource: Resource, options?: Array<ResourceOptions> | Include): object {
        const result: any = {};
        for (const key in resource) {
            if (resource[key] == null && options) {
                if (Array.isArray(options)) {
                    options.forEach(option => {
                        if (Include.NULL_VALUES === option?.include) {
                            if (Array.isArray(option.props)) {
                                if (option.props.includes(key)) {
                                    result[key] = null;
                                }
                            }
                        }
                    });
                } else {
                    result[key] = null;
                }
            } else if (!ObjectUtils.isNullOrUndefined(resource[key])) {
                if (ObjectUtils.className(resource[key])
                    .find((className: string) => className === 'Resource') || resource[key]._links) {
                    if (resource[key]._links) {
                        result[key] = resource[key]._links.self.href;
                    }
                } else if (Array.isArray(resource[key])) {
                    const array: any[] = resource[key];
                    if (array) {
                        result[key] = [];
                        array.forEach((element) => {
                            if (ObjectUtils.isPrimitive(element)) {
                                result[key].push(element);
                            } else if (ObjectUtils.className(element)
                                .find((className: string) => className === 'Resource') || element._links) {
                                result[key].push(element._links.self.href);
                            } else {
                                result[key].push(this.resolveRelations(element));
                            }
                        });
                    }
                } else {
                    result[key] = resource[key];
                }
            }
        }
        return result as object;
    }

    public static instantiateResourceCollection<T extends Resource>(type: new() => T, payload: any,
                                                                    result: ResourceArray<T>,
                                                                    builder?: SubTypeBuilder): ResourceArray<T> {
        if (payload[result._embedded]) {
            for (const embeddedClassName of Object.keys(payload[result._embedded])) {
                const embedded: any = payload[result._embedded];
                const items = embedded[embeddedClassName];
                for (const item of items) {
                    let instance: T = new type();
                    instance = this.searchSubtypes(builder, embeddedClassName, instance);

                    this.instantiateResource(instance, item);
                    result.push(instance);
                }
            }
        }

        result.totalElements = payload.page ? payload.page.totalElements : result.length;
        result.totalPages = payload.page ? payload.page.totalPages : 1;
        result.pageNumber = payload.page ? payload.page.number : 1;
        result.pageSize = payload.page ? payload.page.size : 20;

        result.selfUri = payload._links && payload._links.self ? payload._links.self.href : undefined;
        result.nextUri = payload._links && payload._links.next ? payload._links.next.href : undefined;
        result.prevUri = payload._links && payload._links.prev ? payload._links.prev.href : undefined;
        result.firstUri = payload._links && payload._links.first ? payload._links.first.href : undefined;
        result.lastUri = payload._links && payload._links.last ? payload._links.last.href : undefined;

        return result;
    }

    public static searchSubtypes<T extends Resource>(builder: SubTypeBuilder, embeddedClassName: string, instance: T) {
        if (builder && builder.subtypes) {
            const keys = builder.subtypes.keys();
            Array.from(keys).forEach((subtypeKey: string) => {
                if (embeddedClassName.toLowerCase().startsWith(subtypeKey.toLowerCase())) {
                    const subtype: new() => any = builder.subtypes.get(subtypeKey);
                    instance = new subtype();
                }
            });
        }
        return instance;
    }

    public static instantiateResource<T extends BaseResource>(entity: T, payload: any): T {
        for (const key of Object.keys(payload)) {
            if (payload[key] instanceof Array) {
                for (let i = 0; i < payload[key].length; i++) {
                    if (isEmbeddedResource(payload[key][i])) {
                        // TODO: check that it's work
                        payload[key][i] = ResourceUtils.createResource({} as EmbeddedResource, payload[key][i]);
                    }
                }
            } else if (isEmbeddedResource(payload[key])) {
                // TODO: check that it's work
                payload[key] = ResourceUtils.createResource({} as EmbeddedResource, payload[key]);
            }
        }

        return ResourceUtils.createResource(entity, payload);
    }

    private static createResource<T extends BaseResource>(entity: T, payload: any): T {
        for (const p of payload) {
            entity[p] = payload[p];
        }
        return entity;
    }

}
