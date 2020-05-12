import { Injectable } from '@angular/core';

@Injectable()
export class SimpleService {


    constructor() {
        console.log('SIMPLE SERVICE INIT')
    }

    public hello(): void {
        console.log('Hello world!')
    }

}
