import { Resource } from '../model/resource';
import { ResourceHelper } from './resource-helper';

class SimpleLanguageResource extends Resource {
    public name: string;
    public key: string;
}

/**
 * Create object from https://github.com/lagoshny/ngx-hal-client/issues/26
 */
class SampleProductResource extends Resource {
    name = 'MySampleProduct';
    availableLanguages = [
        // Doing it to enrich object with Resource methods to simulate the real Resource object
        Object.assign(new SimpleLanguageResource(), {
            name: 'en-US',
            key: 'en-US',
            _links: {
                self: {
                    href: 'http://localhost:4200/rke/api/languages/7'
                },
                language: {
                    href: 'http://localhost:4200/rke/api/languages/7'
                },
                i18n: {
                    href: 'http://localhost:4200/rke/api/workspaces/1/i18n?language=en-US'
                },
                workspace: {
                    href: 'http://localhost:4200/rke/api/languages/7/workspace'
                }
            }
        }),

        // Doing it to enrich object with Resource methods to simulate the real Resource object
        Object.assign(new SimpleLanguageResource(), {
            name: 'en',
            key: 'en',
            _links: {
                self: {
                    href: 'http://localhost:4200/rke/api/languages/8'
                },
                language: {
                    href: 'http://localhost:4200/rke/api/languages/8'
                },
                i18n: {
                    href: 'http://localhost:4200/rke/api/workspaces/1/i18n?language=en'
                },
                workspace: {
                    href: 'http://localhost:4200/rke/api/languages/8/workspace'
                }
            }
        })
    ];

    // Doing it to enrich object with Resource methods to simulate the real Resource object
    defaultLanguage: SimpleLanguageResource = Object.assign(new SimpleLanguageResource(), {
        name: 'en-US',
        key: 'en-US',
        _links: {
            self: {
                'href': 'http://localhost:4200/rke/api/languages/7'
            },
            language: {
                'href': 'http://localhost:4200/rke/api/languages/7'
            },
            i18n: {
                'href': 'http://localhost:4200/rke/api/workspaces/1/i18n?language=en-US'
            },
            workspace: {
                'href': 'http://localhost:4200/rke/api/languages/7/workspace'
            }
        }
    });
    _links = {
        self: {
            href: 'http://localhost:4200/rke/api/sampleProducts/5911'
        },
        sampleProduct: {
            href: 'http://localhost:4200/rke/api/sampleProducts/5911'
        },
        validate: {
            href: 'http://localhost:4200/rke/api/sampleProducts/validate?id=5911'
        },
        save: {
            href: 'http://localhost:4200/rke/api/sampleProducts/5911'
        },
        delete: {
            href: 'http://localhost:4200/rke/api/sampleProducts/5911'
        },
        defaultLanguage: {
            href: 'http://localhost:4200/rke/api/sampleProducts/5911/defaultLanguage'
        },
        availableLanguages: {
            href: 'http://localhost:4200/rke/api/sampleProducts/5911/availableLanguages'
        }
    };
}

describe('ResourceHelper', () => {

    it('should resolve relations correctly', () => {
        let result = ResourceHelper.resolveRelations(new SampleProductResource());

        expect(result['availableLanguages']).toBeDefined();
        expect(result['availableLanguages'].length).toBe(2);
        expect(result['availableLanguages'][0]).toBe('http://localhost:4200/rke/api/languages/7');
        expect(result['availableLanguages'][1]).toBe('http://localhost:4200/rke/api/languages/8');

        expect(result['defaultLanguage']).toBeDefined();
        expect(result['defaultLanguage']).toBe('http://localhost:4200/rke/api/languages/7');
    });

});