import {
  Component,
  Type,
  OnDestroy,
  AfterViewInit,
  ComponentFactoryResolver,
  ComponentRef,
  ViewChild,
  ChangeDetectorRef,
  ViewEncapsulation
} from '@angular/core';
import {InsertionDirective} from '../insertion.directive';
import {PopupsRef} from '../popups.ref';
import {Subject} from 'rxjs';
import {DomService} from '../../services';
@Component({
  selector: 'popup-base',
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class BaseComponent implements AfterViewInit, OnDestroy {
  showX = true;
  noClose = false;
  disableClose = false;
  isFullHeight = false;
  wrapperClass: string;

  componentRef: ComponentRef<any>;
  childComponentType: Type<any>;

  @ViewChild(InsertionDirective, {static: false})
  insertionPoint: InsertionDirective;

  isOpen = false;
  public nextPopup = new Subject<string>();

  get marginTop(): number {
    return (document.getElementById('banner')?.offsetHeight || 0) + (document.getElementById('navbar')?.offsetHeight || 70);
  }

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private cd: ChangeDetectorRef,
    private domSrv: DomService,
    public popup: PopupsRef
  ) { }

  ngAfterViewInit(): void {
    this.loadChildComponent(this.childComponentType);
    this.cd.detectChanges();
  }

  ngOnDestroy(): void {
    if (this.componentRef) {
      this.isOpen = false;

      this.componentRef.destroy();
    }
  }

  onDialogClicked(evt: MouseEvent): void {
    evt.stopPropagation();
  }

  loadChildComponent(componentType: Type<any>): void {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(componentType);

    const viewContainerRef = this.insertionPoint.viewContainerRef;

    viewContainerRef.clear();

    this.componentRef = viewContainerRef.createComponent(componentFactory);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    this.componentRef.instance.onClose = this.onClose;

    setTimeout(
      () => {
        this.isOpen = true;
      },
      this.domSrv.getIsDeviceSize() ? 300 : 0
    );
  }

  onClose(value?: any, callback?: any): void {
    if (this.noClose || (this.disableClose && !value)) {
      return;
    }

    this.isOpen = false;

    setTimeout(() => {
      this.popup.dismiss(value);
      if (callback) {
        callback();
      }
    }, 300);
  }
}
