import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'ec-button',
  templateUrl: './ec-button.component.html',
  styleUrls: [],
})
export class EcButtonComponent {
  /**
   * Input Label
   */
  @Input() label: string;

  /**
   * Button type.
   * Values:
   * - semantic-secondary-lightest,
   * - semantic-secondary-light,
   * - semantic-secondary-medium,
   * - semantic-secondary-dark,
   * - semantic-secondary-darkest
   * Default: semantic-secondary-medium
   */
  @Input() type = 'semantic-secondary-medium';

  /**
   * Additional Classes
   */
  @Input() className = '';

  /**
   * Additional Inline Styles
   */
  @Input() inlineStyles: string;

  /**
   * Init class icon
   * class of eva icons
   */
  @Input() initClassIcon: string;

  /**
   * Init svg url icon
   */
  @Input() initSvgIcon: string;

  /**
   * Disable button
   */
  @Input() disabled = false;

  /**
   * Button html type
   */
  @Input() buttonType = 'button';

  /**
   * Output Events
   */
  @Output() clickEv = new EventEmitter<Event>();

  onClick($event: any): void {
    if (!this.disabled) {
      this.clickEv.emit($event);
    }
  }
}
