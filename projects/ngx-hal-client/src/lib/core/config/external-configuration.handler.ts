import { HttpClient } from '@angular/common/http';
import { Injector } from '@angular/core';
import { ExternalConfiguration } from './external-configuration';

export interface ExternalConfigurationHandlerInterface {
    deserialize();
    serialize();

    getProxyUri(): string;
    getRootUri(): string;
    getHttp(): HttpClient;

    getInjector(): Injector;

    getExternalConfiguration(): ExternalConfiguration;
    setExternalConfiguration(externalConfiguration: ExternalConfiguration);
}
