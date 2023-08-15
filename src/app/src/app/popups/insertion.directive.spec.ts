import {InsertionDirective} from './insertion.directive';
import {ViewContainerRef} from '@angular/core';

describe('InsertionDirective', () => {
  it('should create an instance', () => {
    // eslint-disable-next-line prefer-const
    let viewContainerRef: ViewContainerRef;

    const directive = new InsertionDirective(viewContainerRef);
    expect(directive).toBeTruthy();
  });
});
