import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { ResourceService } from './core/service/resource.service';
import { HalConfigurationService } from './core/service/hal-configuration.service';
import { HttpConfigService } from './core/service/http-config.service';
import { ResourceClientService } from './core/service/resource-client.service';

export { CacheHelper } from './core/cache/cache.helper';
export { RestService } from './core/service/rest.service';
export { Resource } from './core/model/resource';
export { EmbeddedResource } from './core/model/embedded-resource';
export { ResourceArray } from './core/model/resource-array';
export { ResourcePage } from './core/model/resource-page';
export { Sort, SortOrder } from './core/model/interface/sort';
export { ResourceHelper } from './core/util/resource-helper';
export { HalConfiguration } from './core/config/hal-configuration.interface';
export { HalOptions, HalParam, Include } from './core/model/common';
export { SubTypeBuilder } from './core/model/interface/subtype-builder';
export { HalConfigurationService } from './core/service/hal-configuration.service';

@NgModule({
    imports: [HttpClientModule],
    declarations: [],
    exports: [HttpClientModule],
    providers: [
        HttpClient,
        HttpConfigService,
        ResourceClientService,
        {
            provide: ResourceService,
            useClass: ResourceService,
        }
    ]
})
export class NgxHalClientModule {
    static forRoot(): ModuleWithProviders<NgxHalClientModule> {
        return {
            ngModule: NgxHalClientModule,
            providers: [
                // ExternalService,
                HttpClient,
                {
                    provide: ResourceService,
                    useClass: ResourceService
                },
                HalConfigurationService
            ]
        };
    }
}
