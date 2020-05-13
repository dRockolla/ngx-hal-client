import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { UrlUtils } from '../util/url.utils';

@Injectable()
export class HttpConfigService {

    private _headers: HttpHeaders;
    proxyUri: string;
    rootUri: string;

    public getURL(): string {
        return this.proxyUri && this.proxyUri !== '' ?
            UrlUtils.addSlash(this.proxyUri) :
            UrlUtils.addSlash(this.rootUri);
    }

    public getProxy(scrUrl: string): string {
        if (!this.proxyUri || this.proxyUri === '') {
            return UrlUtils.removeUrlTemplateVars(scrUrl);
        }
        return UrlUtils.addSlash(
            UrlUtils.removeUrlTemplateVars(scrUrl)
                .replace(this.rootUri, this.proxyUri));
    }


}
