import {TestBed} from '@angular/core/testing';

import {CartsService} from './carts.service';

import * as helpers from '../../../test/helper';

// eslint-disable-next-line max-len
const dataSet = {
  data: [
    {
      slug: 'adopt-a-lemon-tree',
      up: '5c795033d9809d1a30a598e2',
      masterBox: '5c795033d9809d1a30a598e5',
      mbLeft: 10248,
      type: 'OVERHARVEST',
      toEvent: {
        itemData: {id: '5c795033d9809d1a30a598e2', name: 'huerta-del-almanzora adopt-a-lemon-tree', category: 'tree', type: 'OVERHARVEST'}
      },
      ums: 12,
      selectedDate: {available: true, date: '2019-04-30T00:00:00.000Z'}
    }
  ],
  time: 1556347884577,
  version: 0
};

fdescribe('CartsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [helpers.imports],
      providers: [helpers.providers]
    });
  });

  it('should be created', () => {
    const service: CartsService = TestBed.inject(CartsService);
    expect(service).toBeTruthy();
  });

  describe('feature', () => {
    let service: CartsService;

    beforeEach(() => {
      service = TestBed.inject(CartsService);
      localStorage.clear();

      // Set cart for tesrting on each it
      localStorage.setItem('cart', JSON.stringify(dataSet));
    });

    it('get valid cart', () => {
      service.store(dataSet.data);

      expect(service.get()).toEqual(dataSet.data);
    });

    it('get null if no cart', () => {
      localStorage.clear();

      expect(service.get()).toBe(null);
    });

    it('get null if clear cart', () => {
      service.clear();

      expect(service.get()).toBe(null);
    });

    it('get cart by array index', () => {
      service.store(dataSet.data);

      expect(service.getByIdx(0)).toEqual(dataSet.data[0]);
    });

    it('set cart', () => {
      service.clear();
      service.store(dataSet.data);

      expect(service.get()).toEqual(dataSet.data);
    });

    it('update cart', () => {
      const newCart = Object.assign({}, dataSet.data);

      newCart[0].ums = 6;
      service.update(newCart);

      expect(service.get()).toEqual(newCart);
    });

    it('update cart by id', () => {
      const newProduct = Object.assign({}, dataSet.data)[0];

      newProduct.ums = 6;
      service.updateByIdx(newProduct, 0);

      expect(service.getByIdx(0)).toEqual(newProduct);
    });

    it('remove cart product', () => {
      const cartWithoutProduct = dataSet.data.slice(0);
      cartWithoutProduct.splice(0, 1);

      service.remove(0);
      expect(service.get()).toEqual(cartWithoutProduct);
    });

    it('add product', () => { });
  });

  afterAll(() => {
    localStorage.clear();
  });
});
