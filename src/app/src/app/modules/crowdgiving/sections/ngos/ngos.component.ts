import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CrowdgivingNgoCardComponent } from '../../components/ngo-card/ngo-card.component';
import { CrowdgivingCardComponent } from '../../components/card/card.component';
import { INGO } from '../../interfaces/ngo.interface';
import { TranslocoModule } from '@ngneat/transloco';

@Component({
  standalone: true,
  selector: 'app-crowdgiving-ngos',
  templateUrl: './ngos.component.html',
  styleUrls: ['./ngos.component.scss'],
  imports: [CommonModule, TranslocoModule, CrowdgivingCardComponent, CrowdgivingNgoCardComponent]
})
export class CrowdgivingNgosComponent {
  @Input() selectedId: string;
  @Input() ngosList: INGO[] = [];

  @Output() selectedIdChange = new EventEmitter<string>();

  onOptionSelect(id: string): void {
    const emitData = this.selectedId === id ? null : id;

    this.selectedIdChange.emit(emitData);
  }
}
