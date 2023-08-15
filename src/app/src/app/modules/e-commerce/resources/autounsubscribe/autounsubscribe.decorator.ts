// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
export function AutoUnsubscribe(constructor: any): any {
  const original = constructor.prototype.ngOnDestroy;

  constructor.prototype.ngOnDestroy = function() {
    Object.keys(this).forEach((prop: string) => {
      const property = this[prop];

      if (property && typeof property.unsubscribe === 'function') {
        property.unsubscribe();
      }
    });
    // eslint-disable-next-line prefer-rest-params
    original && typeof original === 'function' && original.apply(this, arguments);
  };
}
