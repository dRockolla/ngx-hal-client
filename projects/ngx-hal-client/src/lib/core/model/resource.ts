import { BaseResource } from './base-resource';

export abstract class Resource extends BaseResource {

    public getSelfLinkHref(): string {
        return this.getRelationLinkHref('self');
    }

}
