import { UnknownObjectType } from '@app/interfaces';
import { INGO } from './ngo.interface';

export interface ICGProject extends INGO {
  projects: UnknownObjectType[];
}
