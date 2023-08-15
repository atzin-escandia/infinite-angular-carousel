import {
  Component, OnInit, Injector, ViewEncapsulation, HostListener, HostBinding
} from '@angular/core';
import {PopoverBaseComponent} from '../base/base.component';

import {
  TextService, StorageService, ProjectsService
} from '../../services';

@Component({
  selector: 'accordion-popover',
  templateUrl: './accordion-popover.html',
  styleUrls: ['./accordion-popover.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AccordionPopoverComponent extends PopoverBaseComponent implements OnInit {
  @HostBinding('class.popover-is-open') isOpen;
  public onClose: any;
  public sections = [];
  public selected: string;
  public scrollableHeight = 0;

  @HostListener('window:scroll', ['$event'])
  onScroll(_e: Event): void {
    this.changeSelected();
  }

  constructor(
    public injector: Injector,
    public textSrv: TextService,
    public projectsSrv: ProjectsService,
    public storageSrv: StorageService
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.start({
      active: true,
      style: 'background-color: rgba(0,0,0,0); z-index: 99;',
      close: () => this.closeWithAnimation()
    });

    setTimeout(() => {
      this.isOpen = true;
    }, 100);
  }

  public closeWithAnimation(): void {
    this.isOpen = false;

    setTimeout(() => {
      this.close();
      this.onClose();
    }, 300);
  }

  public changeSection(i: number): void {
    this.onClose({
      selectedSection: this.sections[i]
    });
  }

  changeSelected(): void {
    for (const section of this.sections) {
      if (this.domSrv.scrollUnderOverElement('#' + this.utilsSrv.fromCamelCaseToDased(section), 70, false, true, true)) {
        this.selected = section;
      }
    }
  }
}
