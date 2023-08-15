import {Component, Injector, Input, OnChanges, HostListener} from '@angular/core';
import {BaseComponent} from '../base';

import dayjs from 'dayjs';
@Component({
  selector: 'calendar-delivery-info',
  templateUrl: './calendar-delivery-info.component.html',
  styleUrls: ['./calendar-delivery-info.component.scss']
})
export class CalendarDeliveryInfoComponent extends BaseComponent implements OnChanges {
  @Input() up: any;
  @Input() availableDates: any = {};

  // Static
  public week = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  public dayjs: any = dayjs;

  // Data
  public today: any;
  public currentDate: any;
  public firstDay: any;
  public lastDay: any;
  public selectedDate: any;
  public selectedNumber: any;
  public month: any;
  public years: any;
  public needsScroll = false;
  public yearsContainerTranslate = 0;
  public yearsContainerMaxScroll = 0;

  constructor(public injector: Injector) {
    super(injector);
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.needsScroll = false;
    this.yearsContainerTranslate = 0;
    this.yearsContainerMaxScroll = 0;
    this.calculateScrolling();
  }

  ngOnChanges(): void {
    this.startCalendar();
    setTimeout(() => {
      this.calculateScrolling();
    });
  }

  /**
   * Creates calendar from first available date
   */
  public startCalendar(): void {
    this.today = dayjs(Date.now(), {});
    this.currentDate = this.dayjs.utc(this.availableDates[0]);
    this.firstDay = this.dayjs.utc(this.availableDates[0]);
    this.lastDay = this.dayjs.utc(this.availableDates[this.availableDates.length - 1]);
    this.month = this.daysCalculation(this.currentDate);
    this.years = this.calculateYears(this.firstDay, this.lastDay);
  }

  /**
   * Creates calendar from first available date
   */

  private calculateYears(firstDate, lastDate): { name: string; y: any; months: { name: string; m: any }[] }[] {
    const years = [];
    let currentYear = {
      name: firstDate.format('YYYY'),
      y: firstDate.$y,
      months: []
    };

    const diffDateA = new Date(firstDate).getMonth();
    const diffDateB = new Date(lastDate).getMonth();

    for (let i = 0; i <= Math.abs(diffDateB - diffDateA); i++) {
      const date = this.firstDay.add(i, 'month');

      if (date.$y !== currentYear.y) {
        years.push(currentYear);

        currentYear = {
          name: date.format('YYYY'),
          y: date.$y,
          months: []
        };
      }

      currentYear.months.push({
        name: date.format('MMMM'),
        m: date.$M
      });
    }
    years.push(currentYear);

    return years;
  }

  /**
   * Change month
   *
   * @param year
   * @param month
   */
  public changeMonth(year: {y: number}, month: {m: number}): void {
    // dayjs month diff doesn't work well with DST,
    // so we manually diff
    const step = (year.y - this.currentDate.$y) * 12 + month.m - this.currentDate.$M;

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
    const firtDayDate = date.startOf('month');
    const firstDay = firtDayDate.day() === 0 ? 7 : firtDayDate.day();
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
        date: dayNumber,
        pastDate:
          dayjs
            .utc(firtDayDate)
            .add(dayNumber - 1, 'day')
            .diff(this.today, 'day') < 0
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

  isActiveMonth(year: {y: number}, month: {m: number}): boolean {
    return this.currentDate.$y === year.y && this.currentDate.$M === month.m;
  }

  calculateScrolling(): void {
    if (this.domSrv.isPlatformBrowser()) {
      const titleBlock = document.getElementsByClassName('calendar-delivery-info-title')[0] as HTMLElement;
      const yearBlocks = document.getElementsByClassName('calendar-delivery-info-years-container-year');
      let yearsTotalWidth = 0;

      for (let yearBlock of Array.from(yearBlocks)) {
        yearBlock = yearBlock as HTMLElement;
        yearsTotalWidth += yearBlock.scrollWidth;
      }
      if (yearsTotalWidth > titleBlock.offsetWidth) {
        this.needsScroll = true;
        this.yearsContainerMaxScroll = yearsTotalWidth - titleBlock.offsetWidth;
      } else {
        const totalMonths = this.years.reduce((accumulator: number, year: {months: any[]}) => accumulator + year.months.length, 0);

        for (const year of this.years) {
          year.width = ((year.months.length * 100) / totalMonths).toString() + '%';
        }
      }
    }
  }

  scrollCalendar(): void {
    this.yearsContainerTranslate = this.yearsContainerTranslate ? 0 : -this.yearsContainerMaxScroll;
  }
}
