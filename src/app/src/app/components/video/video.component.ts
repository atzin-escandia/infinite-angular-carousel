import {
  Component,
  OnInit,
  Input,
  ViewEncapsulation,
  Output,
  EventEmitter,
  Injector,
  OnChanges,
  SimpleChanges,
} from '@angular/core';

import { VideoService } from '@app/services';
import { BaseComponent } from '../base';

@Component({
  selector: 'video-player',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class VideoComponent extends BaseComponent implements OnInit, OnChanges {
  @Input() id: string;
  @Input() class: string;
  @Input() autoplay = false;
  @Input() platform = 'youtube';
  @Output() public videoLoaded = new EventEmitter();

  @Input() public lazySpace = 400;
  @Input() public noLazyStart = false;

  public debounceTimeout: any;
  public loaded = false;

  constructor(public injector: Injector, private videoSrv: VideoService) {
    super(injector);
  }

  ngOnInit(): void {
    this.initializePlayer();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const {id} = changes;

    id.previousValue && id.currentValue !== id.previousValue && this.initializePlayer();
  }

  private scrollEvn(): void {
    // TODO: Universal fix needed
    if (this.domSrv.isPlatformBrowser() && !this.debounceTimeout && !this.loaded) {
      const elm: HTMLElement = document.querySelector('#video-' + this.id);

      if (!elm) {
        return;
      }
      const pos: any = elm.getBoundingClientRect();

      if (pos.y < window.innerHeight + this.lazySpace) {
        this.loadVideo();
        this.loaded = true;
        window.removeEventListener('scroll', () => this.scrollEvn());
      }

      this.debounceTimeout = setTimeout(() => {
        this.debounceTimeout = null;
      }, 200);
    }
  }

  private initializePlayer(): void {
    this.loaded = false;

    if (this.domSrv.isPlatformBrowser()) {
      if (this.noLazyStart) {
        this.loadVideo();
        this.loaded = true;
      } else {
        window.addEventListener('scroll', () => this.scrollEvn());
      }
    }
  }

  public loadVideo(): void {
    void this.videoSrv.insert(this.id, this.platform, '#video-' + this.id, this.autoplay).then(() => {
      this.videoLoaded.emit('');
    });
  }
}
