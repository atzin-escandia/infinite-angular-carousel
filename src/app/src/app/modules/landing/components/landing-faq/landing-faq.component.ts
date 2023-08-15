import {Component, Input, OnInit, ViewEncapsulation} from '@angular/core';
import {TranslocoService} from '@ngneat/transloco';
import {Faq} from './landing-faq.interface';

@Component({
  selector: 'landing-faq',
  templateUrl: './landing-faq.component.html',
  styleUrls: ['./landing-faq.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LandingFaqComponent implements OnInit {
  @Input() faqs: Faq[] = [];
  @Input() image: string;
  @Input() title?: string;
  @Input() asyncLoading = true;

  constructor(public translocoSrv: TranslocoService) {}

  public ngOnInit(): void {
    this.cleanEmptyFaqs();
  }

  private cleanEmptyFaqs(): void {
    this.faqs = this.faqs?.filter(faq => faq.answer !== '' || faq.question !== '' );
    !this.asyncLoading && this.setTranslatedFaqs();
  }

  public setTranslatedFaqs(): void {
    this.faqs = this.faqs?.map(faq => ({
      answer: this.translocoSrv.translate(faq?.answer),
      question: this.translocoSrv.translate(faq?.question)
    }));
  }
}
