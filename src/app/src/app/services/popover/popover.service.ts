import { Injectable, Injector, ComponentFactoryResolver, ApplicationRef, EmbeddedViewRef } from '@angular/core';
import { BaseService } from '../base';
import * as components from '../../popover';
import { DomService } from '../dom';
import { StorageService } from '../storage';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PopoverService extends BaseService {
  public popoverOpenRef: any;
  public blockedPopover: boolean;
  private childComponentRef: any;
  private showSubscribePopover = new Subject<boolean>();
  private showSubscribeNewsletterTimeout;
  private openedPopoversRef: any = {};

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    public injector: Injector,
    private domSrv: DomService,
    private storageSrv: StorageService
  ) {
    super(injector);
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
   * Open popover
   */

  public open(componentName: string, componentID: string, configChild: any, disableScroll = false, isGeneralNoScroll = false): void {
    this.popoverOpenRef = components[componentName];
    // Create a component reference from the component
    const childComponentRef = this.componentFactoryResolver.resolveComponentFactory(components[componentName]).create(this.injector);

    // Parent component reference
    let parentRef = document.getElementById(componentID);

    if (!parentRef) {
      componentID = 'app-block';
      parentRef = document.getElementById(componentID);
    }

    // Attach the config to the child (inputs and outputs)
    if (configChild && configChild.inputs && configChild.outputs) {
      this.attachConfig(configChild, childComponentRef, parentRef);
    }

    this.childComponentRef = childComponentRef;

    // Stores componentsRefs to remove them specifically
    this.openedPopoversRef[componentName] = childComponentRef.hostView;

    // Attach component to the appRef so that it's inside the ng component tree
    this.appRef.attachView(childComponentRef.hostView);

    // Get DOM element from component
    const childDomElem = (childComponentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;

    // Append DOM element to the body
    document.getElementById(componentID).appendChild(childDomElem);
    if (disableScroll) {
      this.domSrv.addClasses(isGeneralNoScroll ? 'html' : 'body', ['no-scroll']);
    }
  }

  /**
   * Close popover
   */
  public close(popoverRef?: string): void {
    this.domSrv.removeClasses('html', ['no-scroll']);
    this.domSrv.removeClasses('body', ['no-scroll']);

    if (popoverRef) {
      this.appRef.detachView(this.openedPopoversRef[popoverRef]);
    } else {
      // if no popoverRef as parameter closes all popovers
      for (const popover in this.openedPopoversRef) {
        if (this.openedPopoversRef[popover]) {
          this.appRef.detachView(this.openedPopoversRef[popover]);
          delete this.openedPopoversRef[popover];
        }
      }
    }

    const pooverBackground = this.domSrv.getElement('.popover-background');

    if (pooverBackground) {
      pooverBackground.parentElement.removeChild(pooverBackground);
    }
  }

  /**
   * Return if show subscribe-newsletter as Observable
   */
  public getIfShowSubscribeNewsletter(): Observable<boolean> {
    return this.showSubscribePopover.asObservable();
  }

  /**
   * Stop show subscribe newsletter timeout
   */
  public clearShowNewsletterTimeout(): void {
    if (this.showSubscribeNewsletterTimeout) {
      clearTimeout(this.showSubscribeNewsletterTimeout);
    }
  }

  /**
   * set if show subscribe-newsletter as Observable
   */
  public setIfShowSubscribeNewsletter(blockPopover?: boolean): void {
    const storage = {
      logged: this.storageSrv.isLogged(),
      userData: this.storageSrv.getCurrentUser(),
      visitsCounter: this.storageSrv.get('visitsCounter'),
      softRegistered: this.storageSrv.get('softRegistered'),
    };

    if (blockPopover) {
      this.blockedPopover = blockPopover;
    }
    if (!this.blockedPopover) {
      if (!storage.logged && !storage.userData && storage.visitsCounter < 3 && !storage.softRegistered) {
        this.showSubscribeNewsletterTimeout = setTimeout(() => {
          if (!storage.logged && !storage.userData && storage.visitsCounter < 3 && !storage.softRegistered) {
            this.showSubscribePopover.next(true);
          }
        }, 10000);
      }
    }
  }
}
