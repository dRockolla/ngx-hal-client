import { ExternalConfiguration } from './external-configuration';

export interface ExternalConfigurationHandlerInterface {
    deserialize();
    serialize();

    getProxyUri(): string;
    getRootUri(): string;

    getExternalConfiguration(): ExternalConfiguration;
    setExternalConfiguration(externalConfiguration: ExternalConfiguration);
}
