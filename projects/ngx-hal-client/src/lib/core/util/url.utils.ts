import url from 'url';
import { HttpParams } from '@angular/common/http';
import { HalOptions, HalParam, LinkParams } from '../model/common';
import { isResource } from '../model/defenition';
import { ObjectUtils } from './object.utils';

export class UrlUtils {

    private static readonly URL_TEMPLATE_VAR_REGEXP = /{[^}]*}/g;
    private static readonly EMPTY_STRING = '';

    public static optionParams(params: HttpParams, options?: HalOptions): HttpParams {
        if (options) {

            params = this.params(params, options.params);

            if (options.size) {
                params = params.append('size', options.size.toString());
            }

            if (options.sort) {
                for (const s of options.sort) {
                    let sortString = '';
                    sortString = s.path ? sortString.concat(s.path) : sortString;
                    sortString = s.order ? sortString.concat(',').concat(s.order) : sortString;
                    params = params.append('sort', sortString);
                }
            }

        }
        return params;
    }

    public static params(httpParams: HttpParams, params?: HalParam[]) {
        if (params) {
            for (const param of params) {
                const paramValue = isResource(param.value)
                    ? param.value.getSelfLinkHref()
                    : param.value.toString();
                httpParams = httpParams.append(param.key, paramValue);
            }
        }

        return httpParams;
    }

    public static linkParamsToHttpParams(params?: LinkParams) {
        let httpParams = new HttpParams();
        if (params) {
            for (const param in params) {
                if (params.hasOwnProperty(param)) {
                    httpParams = httpParams.append(param, params[param]);
                }
            }
        }

        return httpParams;
    }

    public static removeUrlTemplateVars(srcUrl: string) {
        return srcUrl.replace(UrlUtils.URL_TEMPLATE_VAR_REGEXP, UrlUtils.EMPTY_STRING);
    }

    public static addSlash(uri: string): string {
        const uriParsed = url.parse(uri);
        if (ObjectUtils.isNullOrUndefined(uriParsed.search) && uri && uri[uri.length - 1] !== '/') {
            return uri + '/';
        }
        return uri;
    }

}
