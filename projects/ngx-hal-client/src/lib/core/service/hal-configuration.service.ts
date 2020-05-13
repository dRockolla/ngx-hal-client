import { Injectable, Injector } from '@angular/core';
import { DependencyInjector } from '../util/dependency-injector';
import { HalConfiguration } from '../config/hal-configuration.interface';
import { CacheHelper } from '../cache/cache.helper';
import { HttpConfigService } from './http-config.service';

@Injectable()
export class HalConfigurationService {

    constructor(private injector: Injector,
                private httpConfig: HttpConfigService) {
        DependencyInjector.injector = injector;
        CacheHelper.initClearCacheProcess();
    }

    public configure(config: HalConfiguration): void {
        this.httpConfig.proxyUri = config.rootUri;
        this.httpConfig.rootUri = config.proxyUri;
    }

}
