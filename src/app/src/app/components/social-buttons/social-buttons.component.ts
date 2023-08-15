import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import {SocialKey} from '@app/interfaces';
import {GoogleService} from '@app/services';

@Component({
  selector: 'app-social-buttons',
  templateUrl: './social-buttons.component.html',
  styleUrls: ['./social-buttons.component.scss'],
})
export class SocialButtonsComponent implements AfterViewInit {
  @ViewChild('gWrapper') gWrapper: ElementRef;

  @Input() type: 'login' | 'register' | 'login-popup';
  @Input() fb: boolean;
  @Input() google: boolean;

  @Output() buttonSelect = new EventEmitter<SocialKey>();

  constructor(
    private googleSrv: GoogleService
  ) { }

  ngAfterViewInit(): void {
    this.google && this.googleSrv.renderButton(`gbtn_${this.type}`, this.gWrapper?.nativeElement?.offsetWidth);
  }

  onButtonClick(key: SocialKey): void {
    this.buttonSelect.emit(key);
  }
}
