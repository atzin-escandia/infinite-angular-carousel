import {Component, OnInit, Injector} from '@angular/core';
import {PopoverBaseComponent} from '../base';
import * as dayjs from 'dayjs';
@Component({
  selector: 'calendar-shipment',
  templateUrl: './calendar-shipment.component.html',
  styleUrls: ['./calendar-shipment.component.scss']
})
export class CalendarShipmentComponent extends PopoverBaseComponent implements OnInit {
  // Static
  public week = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  public dayjs = dayjs;

  // Inputs
  public product: any;
  public order: any;
  public save: any;
  public onClose: any;
  public actual: any;
  public availableDates: any[] = [];

  // Data
  public currentDate: any;
  public firstDay: any;
  public lastDay: any;
  public selectedDate: any;
  public selectedNumber: any;
  public month: any;

  public isOpen = false;
  public isDeliveryCopyHidden: boolean;
  public scroll = true;
  public showX = false;
  public customClass: string;
  public customBackground: string;

  constructor(public injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {
    this.startCalendar();

    let style = this.domSrv.getIsDeviceSize() ? 'opacity: 0.24; background-color: #1a1a1a;' : 'background-color: rgba(0, 0, 0, 0)';

    if (this.customBackground) {
      style = this.customBackground;
    }

    this.start({
      active: true,
      style,
      close: () => {
        this.customClose();
      }
    });

    let halfWindow = 25;

    if (this.domSrv.isPlatformBrowser()) {
      halfWindow = window.innerHeight / 2;
    }

    if (!this.domSrv.getIsDeviceSize() && this.scroll) {
      setTimeout(() => {
        this.domSrv.scrollToElmWithHeader('#calendar-shipment-popover', halfWindow);
      }, 0);
    }

    this.isOpen = true;
    this.showX = true;
  }

  /**
   * Triggers function from component
   */
  public saveSelectedDate(): void {
    if (this.save && this.selectedDate) {
      const isoDate: Date = this.selectedDate.toISOString();

      this.save(isoDate);
    }

    this.customClose();
  }

  public customClose(): void {
    this.isOpen = false;

    setTimeout(() => {
      this.onClose();
      this.close();
    }, 300);
  }

  /**
   * Creates calendar from first available date
   */
  public startCalendar(): void {
    if (this.product) {
      this.availableDates = this.product.availableDates;
      this.firstDay = this.dayjs.utc(this.availableDates[0]);
      this.lastDay = this.dayjs.utc(this.availableDates[this.availableDates.length - 1]);
      this.currentDate = this.dayjs.utc(this.availableDates[0]);
      this.month = this.daysCalculation(this.currentDate);
    }

    if (this.order) {
      this.firstDay = this.dayjs.utc(this.availableDates[0]);
      this.lastDay = this.dayjs.utc(this.availableDates[this.availableDates.length - 1]);

      this.currentDate = this.dayjs.utc(this.availableDates[0]);
      this.month = this.daysCalculation(this.firstDay);
    }
  }

  /**
   * Select a date
   */
  public selectDate({available, date}: any): void {
    if (available) {
      this.selectedNumber = date;
      this.selectedDate = this.currentDate.date(date);
      this.saveSelectedDate();
    }

    return;
  }

  /**
   * Change month
   *
   * @param step Forwards or backwards
   */
  public changeMonth(step: number): void {
    if (
      this.currentDate.add(step, 'month').endOf('month').isBefore(this.firstDay.startOf('month'), 'month') ||
      this.currentDate.add(step, 'month').startOf('month').isAfter(this.lastDay.endOf('month'), 'month')
    ) {
      return;
    }

    this.currentDate = this.currentDate.add(step, 'month');
    this.month = this.daysCalculation(this.currentDate);

    this.selectedNumber = null;
  }

  /**
   * Creates a month obj froma a date
   */
  private daysCalculation(date: any): any {
    const firstDay = date.startOf('month').day() === 0 ? 7 : date.startOf('month').day();

    const month = [];
    let week = [];

    // Blank days
    for (let index = 1; index < firstDay; index++) {
      week.push({
        available: false,
        date: 0
      });
    }

    for (let dayNumber = 1; dayNumber <= date.daysInMonth(); dayNumber++) {
      if (week.length === 7) {
        month.push(week);
        week = [];
      }

      const dayObj = {
        available: false,
        date: dayNumber
      };

      this.availableDates.map(day => {
        if (day === this.currentDate.date(dayNumber).toISOString()) {
          dayObj.available = true;
        }
      });

      week.push(dayObj);
    }

    // Blank days
    for (let index = 0; week.length < 7; index++) {
      week.push({
        available: false,
        date: 0
      });
    }
    month.push(week);

    return month;
  }
}
