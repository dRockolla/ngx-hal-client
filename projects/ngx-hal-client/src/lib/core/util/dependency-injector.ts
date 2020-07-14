import { Injector, Type } from '@angular/core';

export class DependencyInjector {

    private static _injector: Injector;

    static get<T>(type: Type<T>): T {
        return this._injector?.get(type);
    }

    static set injector(value: Injector) {
        this._injector = value;
    }
}
