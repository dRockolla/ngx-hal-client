import { Injectable, Injector } from '@angular/core';
import { DependencyInjector } from '../util/dependency-injector';
import { ExternalConfigurationHandlerInterface } from '../config/external-configuration.handler';
import { ResourceHelper } from '../util/resource-helper';
import { CacheHelper } from '../cache/cache.helper';
import { HttpClient } from '@angular/common/http';
import { HttpConfigService } from './http-config.service';

@Injectable()
export class HalConfigurationService {

    constructor(private httpClient: HttpClient,
                private injector: Injector,
                private httpConfig: HttpConfigService) {
        console.log('HalConfigurationService');
        DependencyInjector.injector = injector;
        ResourceHelper.setHttp(httpClient);
        CacheHelper.initClearCacheProcess();
    }

    public configure(config: ExternalConfigurationHandlerInterface): void {
        console.log('invoke configure');
        this.httpConfig.proxyUri = config.getProxyUri();
        this.httpConfig.rootUri = config.getRootUri();
    }

    // constructor(@Inject('ClientHalConfigurationService') private halConfig: ExternalConfigurationHandlerInterface) {
    //     console.log('HalConfigurationService')
    //     DependencyInjector.injector = halConfig.getInjector();
    //     ResourceHelper.setProxyUri(halConfig.getProxyUri());
    //     ResourceHelper.setRootUri(halConfig.getRootUri());
    //     ResourceHelper.setHttp(halConfig.getHttp());
    //     CacheHelper.initClearCacheProcess();
    // }

}
