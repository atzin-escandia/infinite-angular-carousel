import { Injectable, ComponentFactoryResolver, ApplicationRef, Injector, EmbeddedViewRef } from '@angular/core';

import { BaseComponent } from '../../popups/base';
import { PopupsInterface } from '../../popups/popups.interface';
import { PopupsInjector } from '../../popups/popups.injector';
import { PopupsRef } from '../../popups/popups.ref';
import { BaseService } from '../base';
import { DomService } from '../dom';

import { Observable, Subject } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class PopupService extends BaseService {
  public dialogComponentRef = {
    length: (): number => {
      let num = 0;

      for (const key in this.dialogComponentRef) {
        if (this.dialogComponentRef[key] && key !== 'length') {
          num++;
        }
      }

      return num;
    },
  };

  public quitX: string[] = ['BannedPayComponent'];
  public noClose: string[] = ['BannedPayComponent'];
  public disableClose: string[] = ['PaymentPopupComponent', 'GOInvitationPopupComponent'];
  public nextPopup = new Subject<string>();

  public wrapperClasses: any = [
    {
      popup: 'StatusPopupComponent',
      class: 'popup-status-wrapper',
    },
  ];

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    public injector: Injector,
    private domSrv: DomService
  ) {
    super(injector);
  }

  // Open Popup
  public open(componentType: any, config?: PopupsInterface, disableScroll = false): any {
    const nameComponent = componentType.className || componentType.name;

    // not open popups in universal
    if (!this.domSrv.isPlatformBrowser()) {
      const popupsRefEmpty = this.getPopupsRef({ data: {} }, nameComponent);

      return popupsRefEmpty.popupsRef;
    }

    if (this.dialogComponentRef && this.dialogComponentRef[nameComponent]) {
      this.removeDialogComponentFromBody(nameComponent);
    }

    const popupsRef = this.appendDialogComponentToBody(config || { data: {} }, nameComponent);

    this.dialogComponentRef[nameComponent].instance.childComponentType = componentType;

    this.domSrv.addClasses('app', ['blurred', 'no-scroll']);
    if (disableScroll) {
      this.domSrv.addClasses('body', ['no-scroll']);
    }

    return popupsRef;
  }

  // Add popup to body dynamic
  private appendDialogComponentToBody(config: PopupsInterface, nameComponent: string): any {
    // add the PopupsRef to dependency injection
    const { map, popupsRef } = this.getPopupsRef(config, nameComponent);

    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(BaseComponent);

    // Use custom injector for data passed
    const componentRef = componentFactory.create(new PopupsInjector(this.injector, map));

    this.appRef.attachView(componentRef.hostView);

    if (this.quitX.indexOf(nameComponent) !== -1) {
      componentRef.instance.showX = false;
    }

    if (this.noClose.indexOf(nameComponent) !== -1) {
      componentRef.instance.noClose = false;
    }

    componentRef.instance.disableClose = this.disableClose.includes(nameComponent);

    if (config.data.isFullHeight) {
      componentRef.instance.isFullHeight = config.data.isFullHeight;
    }

    if (!config.data.close) {
      componentRef.instance.showX = false;
    } else {
      componentRef.instance.showX = true;
    }

    this.wrapperClasses.map((wrapper: any) => {
      if (wrapper.popup === nameComponent) {
        componentRef.instance.wrapperClass = wrapper.class;
      }
    });

    const domElem = (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;

    document.body.appendChild(domElem);

    this.dialogComponentRef[nameComponent] = componentRef;

    return popupsRef;
  }

  // Remove popup form html
  private removeDialogComponentFromBody(nameComponent: string): void {
    this.appRef.detachView(this.dialogComponentRef[nameComponent].hostView);

    this.dialogComponentRef[nameComponent].destroy();
    delete this.dialogComponentRef[nameComponent];

    if (this.dialogComponentRef.length() === 0) {
      this.domSrv.removeClasses('app', ['blurred', 'no-scroll']);
      this.domSrv.removeClasses('body', ['no-scroll']);
    }
  }

  public closeAndOpen(value: string): void {
    this.nextPopup.next(value);
  }

  public getNextPopupName(): Observable<string> {
    return this.nextPopup.asObservable();
  }

  public getPopupsRef(config: PopupsInterface, nameComponent: string): any {
    // create a map with the config
    const map = new WeakMap();

    map.set(PopupsInterface, config);

    // add the PopupsRef to dependency injection
    const popupsRef = new PopupsRef();

    map.set(PopupsRef, popupsRef);

    // we want to know when somebody called the close mehtod
    const sub = popupsRef.onClose.subscribe(
      () => {
        // close the dialog
        this.removeDialogComponentFromBody(nameComponent);
        // TODO: this is necessary?
        sub.unsubscribe();
      },
      (_error) => {}
    );

    return { map, popupsRef };
  }
}
