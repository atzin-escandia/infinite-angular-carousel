import {
  Component,
  Injector,
  Input,
  OnChanges,
  OnInit,
} from '@angular/core';
import { BaseComponent } from '@components/base';
import { RouterService } from '@app/services';
import { HomeService } from '@services/home/home.service';

@Component({
  selector: 'counters',
  templateUrl: './counters.component.html',
  styleUrls: ['./counters.component.scss'],
})
export class CountersComponent extends BaseComponent implements OnInit, OnChanges {
  @Input() isMobile: boolean;
  @Input() loadCounters = false;
  @Input() showIlustration = true;
  @Input() loaded = false;
  @Input() counters = [];
  @Input() title = 'page.our-growing-revolution.title';
  public cards = [];

  constructor(
    public injector: Injector,
    public routerSrv: RouterService,
    public homeSrv: HomeService
  ) {
    super(injector);
  }

  public totalAdoptedTrees = 0;
  public totalBoxes = 0;
  public totalFarmers = 0;
  public totalProjectsToEco = 0;
  public staticContent: {title: string; img: string; counter: any; text: string }[] = [
    {
      title: 'totalAdoptedTrees',
      img: this.env.domain + '/assets/icon/home/counter-icons/trees.svg',
      counter: 0,
      text: 'page.total-adopted-trees.body',
    },
    {
      title: 'totalBoxes',
      img: this.env.domain + '/assets/icon/home/counter-icons/boxes.svg',
      counter: 0,
      text: 'page.total-boxes.body',
    },
    {
      title: 'totalFarmers',
      img: this.env.domain + '/assets/icon/home/counter-icons/farmers.svg',
      counter: 0,
      text: 'page.total-farmers.body',
    },
    {
      title: 'totalProjectsToEco',
      img: this.env.domain + '/assets/icon/home/counter-icons/reco.svg',
      counter: 0,
      text: 'page.projects-transition.body',
    },
  ];

  public ngOnInit(): void {
    this.counters && (this.cards = this.counters);
  }

  async ngOnChanges(): Promise<void> {
    if (this.loadCounters && !this.loaded) {
      await this.loadCountersHome();
      this.loaded = true;
    }
  }

  public async loadCountersHome(): Promise<void> {
    this.cards = this.staticContent;
    const totalCounter = await this.homeSrv.getCounters();

    this.cards.map((card, i) => {
      this.cards[i].counter = this.animateNumber(
        this.cards[i].title,
        totalCounter[card.title]
      );
    });
  }

  public animateNumber(currentVar: string, total: number): void {
    // Create internal vars to count
    this[currentVar + 'Stop'] = setInterval(() => {
      // Increasing by porcentage, for instance 20
      const nextValue = Math.round( this[currentVar] + total / 20);

      this[currentVar] = nextValue < total ? nextValue : total;
      if (this[currentVar] >= total) {
        clearInterval( this[currentVar + 'Stop']);
      }
    }, 200);
  }
}
