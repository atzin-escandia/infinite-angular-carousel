export interface IInitialAdoptionStatus {
  renewNotOpen: boolean;
  renewOpen: boolean;
  cancelOpen: boolean;
  renovationClosed: boolean;
  onSeason: boolean;
  outOfSeason: boolean;
  remainingUps: boolean;
  adoptionsPurchaseClosed: boolean;
  adoptionLiberated: boolean;
  noRemainingBoxes?: boolean;
}
