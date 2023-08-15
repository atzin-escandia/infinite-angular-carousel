import { ApplicationRef, ComponentFactoryResolver, EmbeddedViewRef, Inject, Injectable, Injector } from '@angular/core';
import { Device } from '../../enums/device.enum';
import { DeviceWidth, DeviceWidthV2 } from '../../enums/device-width.enum';
import { DOCUMENT } from '@angular/common';
import { BehaviorSubject, delay, Observable, Subject, tap, withLatestFrom } from 'rxjs';

declare let window: any;

@Injectable({
  providedIn: 'root',
})
export class DomService {
  private childComponentRef: any;
  private listeners = {};
  private isMobile = false;
  private header = true;
  private footer = true;
  public scrollPosition$ = new BehaviorSubject<number>(null);
  public currentScroll$: Observable<number> = this.scrollPosition$.asObservable();
  public scrollSubject$ = new Subject<void>();
  spaceBetweenPaginatorAndTop = 500;

  scroll$ = this.scrollSubject$.pipe(
    withLatestFrom(this.currentScroll$),
    delay(1000),
    tap(([_, scroll]) => {
      if (scroll && scroll !== 0) {
        window.scrollTo(0, scroll - this.spaceBetweenPaginatorAndTop);
      }
    }),
    tap(() => this.setScrollPosition(0))
  );

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    public injector: Injector,
    @Inject(DOCUMENT) public document: Document
  ) {
    this.scroll$.subscribe();
  }

  public get appRef(): ApplicationRef {
    return this.injector.get(ApplicationRef);
  }

  public setScrollPosition(scrollPosition: number): void {
    this.scrollPosition$.next(scrollPosition);
  }

  /**
   * Scroll to element
   */
  public scrollTo(selector: string, helper = 0, negative = false): void {
    if (!this.isPlatformBrowser()) {
      return;
    }
    helper = negative ? helper * -1 : helper;
    const elm: HTMLElement = document.querySelector(selector);
    const yPos: number = elm?.getBoundingClientRect()?.top || 0;
    const navElm: HTMLElement = document.querySelector('.header') || document.querySelector('.navbar-container');

    if (this.supportsSmoothScroll()) {
      window.scroll({
        top: Number(window.scrollY) + yPos - navElm.offsetHeight + helper,
        left: window.innerHeight / 2,
        behavior: 'smooth',
      });
    } else {
      if (elm) {
        elm.scrollIntoView(true);
      }
      window.scrollBy(0, -navElm.offsetHeight + helper);
    }
  }

  /**
   * Check if browser supports smooth scroll
   */
  private supportsSmoothScroll(): boolean {
    let isSmoothScrollSupported = false;

    try {
      const div = document.createElement('div');

      div.scrollTo({
        top: 0,
        get behavior(): ScrollBehavior {
          isSmoothScrollSupported = true;

          return 'smooth';
        },
      });
    } catch (err) {
      //
    }

    return isSmoothScrollSupported;
  }

  /**
   * Scrolls to element counting header height
   */
  public scrollToElmWithHeader(selector: string, space: number = 0): void {
    if (!this.isPlatformBrowser()) {
      return;
    }

    const elm: HTMLElement = document.querySelector(selector);

    if (!elm) {
      return;
    }
    try {
      const yPos: number = elm?.getBoundingClientRect()?.top || 0;
      const navElm: DOMRect = document.getElementById('navbar-container')?.getBoundingClientRect();

      if (navElm) {
        if (this.supportsSmoothScroll()) {
          window.scrollTo({
            top: Number(window.scrollY) + yPos - navElm.height - space,
            left: window.innerHeight / 2,
            behavior: 'smooth',
          });
        } else {
          elm.scrollIntoView(true);
          window.scrollBy(0, -70);
        }
      }
    } catch (err) {
      // Just catch
    }
  }

  /**
   * Scroll to top
   */
  public scrollToTop(instant?: boolean): void {
    if (this.isPlatformBrowser()) {
      if (instant || !this.supportsSmoothScroll()) {
        window.scroll({ top: 0, left: 0, behavior: 'auto' });
      } else {
        window.scroll({ top: 0, left: 0, behavior: 'smooth' });
      }
    }
  }

  /**
   * Add classes to element
   */
  addClasses(selector: string, classes: string[]): void {
    if (!this.isPlatformBrowser()) {
      return;
    }
    const el = document.querySelector(selector);

    if (el) {
      el.classList.add(...classes);
    }
  }

  addClassesAllDevices(selector: string, classes: string[]): void {
    const el = document.querySelector(selector);

    if (el) {
      el.classList.add(...classes);
    }
  }

  /**
   * Add attribute to element
   */
  public addAttributeToElement(selector: string, name: string, value: string): void {
    this.getElement(selector).setAttribute(name, value);
  }

  /**
   * Remove attribute to element
   */
  public removeAttributeToElement(selector: string, name: string): void {
    this.getElement(selector).removeAttribute(name);
  }

  /**
   *
   * Remove clases to element
   *
   * If classes is not passed clear all
   */
  public removeClasses(selector: string, classes?: string[]): void {
    if (!this.isPlatformBrowser()) {
      return;
    }

    const params = classes && classes.length > 0 ? classes : Array.from(document.querySelector(selector).classList);

    document.querySelector(selector).classList.remove(...params);
  }

  /**
   * Return if a class is in an element
   */
  public containsClass(selector: string, className: string): boolean {
    if (!this.isPlatformBrowser()) {
      return;
    }

    return document.querySelector(selector).classList.contains(className) || false;
  }

  /**
   * get element classes
   */
  public getClases(selector: string): string[] {
    if (!this.isPlatformBrowser()) {
      return;
    }

    return Array.from(document.querySelector(selector).classList) || [];
  }

  /**
   * Copy element to clipboard
   */
  public copyToClipboard(value: string): void {
    // if (this.isPlatformBrowser && document.queryCommandSupported('copy') && document.queryCommandEnabled('copy')) {
    if (this.isPlatformBrowser) {
      const elm: HTMLInputElement = document.createElement('input');

      elm.setAttribute('value', value);
      document.body.appendChild(elm);
      elm.select();
      document.execCommand('copy');
      document.body.removeChild(elm);
    }
  }

  /**
   * Return if is "mobile"
   */
  public getIsDeviceSize(device: string = Device.MOBILE): boolean {
    if (this.isPlatformBrowser()) {
      switch (device) {
        case Device.MOBILE:
          return window.innerWidth < DeviceWidth.MD;
        case Device.TABLET:
          return window.innerWidth < DeviceWidth.LG;
        case Device.LAPTOP:
          return window.innerWidth < DeviceWidth.XL;
        case Device.DESKTOP:
          return window.innerWidth >= DeviceWidth.LG;
      }
    } else {
      return false;
    }
  }

  /**
   * Return if is "mobile"
   */
  public getIsDeviceSizeV2(device: string = Device.MOBILE): boolean {
    let isDevice: boolean;

    if (this.isPlatformBrowser()) {
      const deviceSize: Record<Device, boolean> = {
        [Device.MOBILE]: window.innerWidth < DeviceWidthV2.S,
        [Device.TABLET]: window.innerWidth < DeviceWidthV2.M,
        [Device.LAPTOP]: window.innerWidth < DeviceWidthV2.L,
        [Device.DESKTOP]: window.innerWidth >= DeviceWidthV2.L,
      };

      isDevice = deviceSize[device];
    }

    return isDevice || false;
  }

  /**
   * Return element
   */
  public getElement(selector: string): HTMLElement {
    return document.querySelector(selector);
  }

  /**
   * Return element
   */
  public getAllElements(selector: string): NodeListOf<HTMLElement> {
    return document.querySelectorAll(selector);
  }

  /**
   * Check if element is on viewport
   *
   * Works in an inverse way. If not visible, returns true.
   */
  public isElementVisible(selector: string, helper: number = 0, upAndDown: boolean = false): boolean {
    if (this.isPlatformBrowser()) {
      const el = this.getElement(selector);

      if (!el) {
        return;
      }

      const scroll: number = window.scrollY || window.pageYOffset;
      const boundsTop = (el?.getBoundingClientRect()?.top || 0) + scroll;

      const viewport = {
        top: scroll + helper,
        bottom: scroll + Number(window.innerHeight) || document.documentElement.clientHeight,
      };

      const bounds = {
        top: boundsTop,
        bottom: boundsTop + el.clientHeight,
      };

      if (upAndDown) {
        return (
          (bounds.top >= viewport.top && bounds.top <= viewport.bottom) ||
          (bounds.bottom >= viewport.top && bounds.bottom <= viewport.bottom) ||
          (bounds.top <= viewport.top && bounds.bottom >= viewport.bottom)
        );
      } else {
        return viewport.top >= bounds.bottom;
      }
    }

    return false;
  }

  /**
   * @param selector element to be compared with screen
   * @param helper pixels to add to viewport.top
   * @param upperThan choose if you want to return true when over or under the reference
   * @param viewPortTop choose if you want the viewportTop or viewportBottom as viewport reference
   * @param elementTop choose if you want the elementTop or elementBottom as element reference
   */
  public scrollUnderOverElement(
    selector: string,
    helper: number = 0,
    upperThan: boolean = true,
    viewPortTop: boolean = true,
    elementTop: boolean = true
  ): boolean {
    if (this.isPlatformBrowser()) {
      const el = this.getElement(selector);

      if (!el) {
        return false;
      }

      const scroll: number = window.scrollY || window.pageYOffset;
      const boundsTop = (el?.getBoundingClientRect()?.top || 0) + scroll;

      const viewport = {
        top: scroll + helper,
        bottom: scroll + Number(window.innerHeight) || document.documentElement.clientHeight,
      };

      const bounds = {
        top: boundsTop,
        bottom: boundsTop + el.clientHeight,
      };

      if (upperThan) {
        if (viewPortTop) {
          if (elementTop) {
            // viewPortTop over elementTop
            return viewport.top <= bounds.top;
          } else {
            // viewPortTop over elementBottom
            return viewport.top <= bounds.bottom;
          }
        } else {
          if (elementTop) {
            // viewPortBottom over elementTop
            return viewport.bottom <= bounds.top;
          } else {
            // viewPortBottom over elementTop
            return viewport.bottom <= bounds.bottom;
          }
        }
      } else {
        if (viewPortTop) {
          if (elementTop) {
            // viewPortTop under elementTop
            return viewport.top >= bounds.top;
          } else {
            // viewPortTop under elementBottom
            return viewport.top >= bounds.bottom;
          }
        } else {
          if (elementTop) {
            // viewPortBottom under elementTop
            return viewport.bottom >= bounds.top;
          } else {
            // viewPortBottom under elementTop
            return viewport.bottom >= bounds.bottom;
          }
        }
      }
    }

    return false;
  }

  /**
   * Add listener to element
   */
  public addListener(selector: string, event: string, func: EventListener, capturing?: boolean): void {
    if (!this.isPlatformBrowser()) {
      return;
    }
    const el = selector === 'window' ? window : document.querySelector(selector);

    this.listeners[selector + '_' + event] = el;

    capturing ? el.addEventListener(event, func, true) : el.addEventListener(event, func);
  }

  /**
   * Remove listener to element
   */
  public removeListener(selector: string, event: string, func: EventListener, capturing?: boolean): void {
    if (!this.isPlatformBrowser()) {
      return;
    }
    const el = selector === 'window' ? window : this.listeners[selector + '_' + event];

    capturing ? el.removeEventListener(event, func, true) : el.removeEventListener(event, func);
  }

  /**
   * Sets isMobile
   */
  public setIsMobile(val: number): void {
    this.isMobile = val <= 768 || false;
  }

  /**
   * Allows to directly manage component's style properties
   */
  public changeStyle(selector: string, properties: any): void {
    for (const property in properties) {
      if (properties[property]) {
        this.getElement(selector).style[property] = properties[property];
      }
    }
  }

  /**
   * Add component to other
   */
  public appendComponentTo(parentId: string, child: any, childConfig?: ChildConfig): any {
    // Create a component reference from the component
    const childComponentRef = this.componentFactoryResolver.resolveComponentFactory(child).create(this.injector);

    // Parent component reference
    const parentRef = document.getElementById(parentId);

    // Attach the config to the child (inputs and outputs)
    if (childConfig && childConfig.inputs && childConfig.outputs) {
      this.attachConfig(childConfig, childComponentRef, parentRef);
    }

    this.childComponentRef = childComponentRef;
    // Attach component to the appRef so that it's inside the ng component tree
    this.appRef.attachView(childComponentRef.hostView);

    // Get DOM element from component
    const childDomElem = (childComponentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;

    // Append DOM element to the body
    document.getElementById(parentId).appendChild(childDomElem);

    return childComponentRef;
  }

  /**
   * Remove component from view
   */
  public removeComponent(): void {
    this.appRef.detachView(this.childComponentRef.hostView);
    this.childComponentRef.destroy();
  }

  /**
   * removeView
   */
  public removeViewComponent(): void {
    this.appRef.detachView(this.childComponentRef.hostView);
  }

  /**
   * Add config to component
   */
  private attachConfig(config: any, componentRef: any, parentRef?: any): void {
    const inputs = config.inputs;
    const outputs = config.outputs;

    for (const input in inputs) {
      if (inputs[input]) {
        componentRef.instance[input] = inputs[input];
      }
    }

    for (const output in outputs) {
      if (outputs[output]) {
        componentRef.instance[output] = outputs[output];
      }
    }

    if (parentRef) {
      componentRef.instance.parentRef = parentRef;
    }
  }

  /**
   * Check if is a browser
   */
  public isPlatformBrowser(): boolean {
    return typeof window === 'object';
  }

  public isPlatformServer(): boolean {
    return !this.isPlatformBrowser();
  }

  /**
   * set if header should be shown
   */
  public showHeader(show = true): void {
    this.header = show;
  }

  /**
   * checks if header should be shown
   */
  public isNavbarActive(): boolean {
    return this.header;
  }

  /**
   * set if footer should be shown
   */
  public showFooter(show = true): void {
    this.footer = show;
  }

  /**
   * checks if footer should be shown
   */
  public isFooterActive(): boolean {
    return this.footer;
  }

  /**
   * gets html elemnts height
   */
  public getElementHeight(selector: string): number {
    if (this.isPlatformBrowser()) {
      const element: any = document.querySelector(selector);

      if (element) {
        return element.offsetHeight;
      } else {
        return;
      }
    }
  }
}

// Child interface
interface ChildConfig {
  inputs?: any;
  outputs?: any;
}
