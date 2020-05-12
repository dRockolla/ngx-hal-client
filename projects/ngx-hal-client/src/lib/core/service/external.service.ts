import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { CacheHelper } from '../cache/cache.helper';
import { ExternalConfiguration } from '../config/external-configuration';
import { ExternalConfigurationHandlerInterface } from '../config/external-configuration.handler';
import { DependencyInjector } from '../util/dependency-injector';
import { ResourceHelper } from '../util/resource-helper';

@Injectable()
export class ExternalService {

    constructor(@Inject('ExternalConfigurationService') private externalConfigurationService: ExternalConfigurationHandlerInterface) {
        console.log('ExternalService')
        DependencyInjector.injector = externalConfigurationService.getInjector();
        ResourceHelper.setProxyUri(externalConfigurationService.getProxyUri());
        ResourceHelper.setRootUri(externalConfigurationService.getRootUri());
        ResourceHelper.setHttp(externalConfigurationService.getHttp());
        CacheHelper.initClearCacheProcess();
    }

    public updateExternalConfigurationHandlerInterface(externalConfigurationService: ExternalConfigurationHandlerInterface) {
        this.externalConfigurationService = externalConfigurationService;

        DependencyInjector.injector = externalConfigurationService.getInjector();
        ResourceHelper.setProxyUri(externalConfigurationService.getProxyUri());
        ResourceHelper.setRootUri(externalConfigurationService.getRootUri());
        ResourceHelper.setHttp(externalConfigurationService.getHttp());
    }

    public getExternalConfiguration(): ExternalConfiguration {
        return this.externalConfigurationService.getExternalConfiguration();
    }

    public getProxyUri(): string {
        return this.externalConfigurationService.getProxyUri();
    }

    public getRootUri(): string {
        return this.externalConfigurationService.getRootUri();
    }

    public getURL(): string {
        return ResourceHelper.getURL();
    }

    public getHttp(): HttpClient {
        return ResourceHelper.getHttp();
    }
}
