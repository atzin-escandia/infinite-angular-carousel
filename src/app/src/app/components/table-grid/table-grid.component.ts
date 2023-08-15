import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';

@Component({
  selector: 'table-grid-component',
  template: `
    <ng-container #ContainerFactory></ng-container>
  `,
})
export class TableGridComponent implements AfterViewInit, OnChanges {
  @ViewChild('ContainerFactory', { read: ViewContainerRef }) containerRef;
  @Input() component: any;
  @Input() data: any[];
  @Input() modifyItem: any;
  @Input() events: any[];
  @Input() styles: string[];
  @Output() eventDataEmitter: EventEmitter<any> = new EventEmitter<any>();

  componentRef: any;
  componentRefs: any[] = [];

  ngAfterViewInit(): void {
    if (this.containerRef) {
      this.data.forEach((item, i) => this.createComponent(item, i));
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes) {
      this.componentRefs.forEach((compRef, i) => this.reassignModifiedData(compRef, i));
    }
  }

  // This object reassign is for Angular @inputs to detect that the object has changed
  reassignModifiedData(componentRef: any, index: number): void {
    Object.assign(componentRef.instance, this.data[index]);
  }

  createComponent(data: any, index: number): void {
    const componentRef = this.containerRef.createComponent(this.component);

    this.componentRefs.push(componentRef);
    this.styles.forEach((style) => componentRef.location.nativeElement.classList.add(style));
    Object.assign(componentRef.instance, data);

    Object.keys(componentRef.instance).forEach((key: any) => {
      if (componentRef.instance[key] instanceof EventEmitter) {
        componentRef.instance[key].subscribe((eventData: any) => {
          this.eventDataEmitter.emit({ eventData, key, index });
          this.reassignModifiedData(componentRef, index);
        });
      }
    });
  }
}
