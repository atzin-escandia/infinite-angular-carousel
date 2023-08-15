import {IInitialAdoptionStatus} from '@modules/user-account/interfaces/adoption.interface';

export const INITIAL_ADOPTION_STATUS: IInitialAdoptionStatus = {
  renewNotOpen: false,
  renewOpen: false,
  cancelOpen: false,
  renovationClosed: false,
  onSeason: false,
  outOfSeason: false,
  remainingUps: false,
  adoptionsPurchaseClosed: false,
  adoptionLiberated: false,
  noRemainingBoxes: false
};
