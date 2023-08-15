import {Component, Input, Injector} from '@angular/core';
import {BaseComponent} from '../base';
import {ProjectsAgroupment} from './project-agroupments.interface';

@Component({
  selector: 'projects-agroupments',
  templateUrl: './projects-agroupments.component.html',
  styleUrls: ['./projects-agroupments.component.scss'],
})
export class ProjectsAgroupmentsComponent extends BaseComponent {
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() isLoading?: boolean = false;
  @Input() lang?: string;
  @Input() set agroupments(agroupments: ProjectsAgroupment[]) {
    this._agroupments = agroupments;
    this.initializeAgroupmentStepper(agroupments);
  }
  get agroupments(): ProjectsAgroupment[] {
    return this._agroupments;
  }

  private _agroupments: ProjectsAgroupment[] = [];
  public agroupmentsStepper: {
    id: string;
    counter: number;
  }[] = [];

  constructor(public injector: Injector) {
    super(injector);
  }

  public shouldHideArrow(agroupmentsLength: number, counter: number): boolean {
    const projectsPerPage = 3;
    const currentProjects = Math.trunc(agroupmentsLength / projectsPerPage) - 1;

    return counter === currentProjects;
  }

  public handleClickCarouselArrow(agroupId: string, step: number, index: number): void {
    for (const agroupment of this.agroupmentsStepper) {
      if (agroupment.id === agroupId) {
        this.agroupmentsStepper[index].counter = this.agroupmentsStepper[index].counter + step;

        if (this.agroupmentsStepper[index].counter % 3 === 0) {
          this.agroupmentsStepper[index].counter = 0;
        }
      }
    }
  }

  private initializeAgroupmentStepper(agroupments: ProjectsAgroupment[]): void {
    if (agroupments.length) {
      this.agroupmentsStepper = this.agroupments.map(({_id}) => ({
        id: _id,
        counter: 0,
      }));
    }
  }
}
