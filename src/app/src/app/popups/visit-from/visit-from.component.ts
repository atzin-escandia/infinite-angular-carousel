import {TextService, LangService, UtilsService, StorageService, AuthService} from '../../services';
import {UntypedFormGroup, UntypedFormBuilder, UntypedFormControl, ValidationErrors} from '@angular/forms';
import {InputCFComponent} from '@crowdfarming/cf-design/lib/input/inputCF.component';
import {CustomValidators} from '../../validators/custom-validators.validator';
import {ISoftReqBody} from '../../interfaces/soft-request-interface';
import {Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {PopupsInterface} from '../popups.interface';
import {PopupsRef} from '../popups.ref';
import {VisitFromStorageKey} from '../../enums/storage-key-visit-from.enum';
import {MediatorsService} from '../../../app/mediators/mediators.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'visit-from',
  templateUrl: './visit-from.component.html',
  styleUrls: ['./visit-from.component.scss']
})
export class VisitFromComponent implements OnInit, OnDestroy {
  private currCountryIso: string;
  public onClose: any;
  public allCountries: any[];
  private countriesWeSend: any[];
  public country: string;
  public basicForm: UntypedFormGroup;
  public countryname: string;
  public isNoCountryDetected = false;
  public showListCountries = false;
  public autocompleteHasMatches = false;
  public autocompleteHasMatchesSubscription: Subscription;
  public isAvailableCountry = false;

  @HostListener('click', ['$event'])
  onClick(): void {
    this.showCountryList(false);
  }

  constructor(private config: PopupsInterface, public textSrv: TextService,
    private utilsSrv: UtilsService, private storageSrv: StorageService,
    private formBuilder: UntypedFormBuilder, private langSrv: LangService,
    private authSrv: AuthService, public popup: PopupsRef,
    private mediatorsSrv: MediatorsService) { }

  ngOnInit(): void {
    this.retrieveData();
    this.setForm();
    this.orderAllCountries();
    this.subscribeToSubjects();
  }

  private subscribeToSubjects(): void {
    this.autocompleteHasMatchesSubscription = this.mediatorsSrv.subscribeCountryAutocompleteMatch().subscribe((hasMatches: boolean) => {
      this.autocompleteHasMatches = hasMatches;
    });
  }

  private retrieveData(): void {
    ({
      currCountryIso: this.currCountryIso,
      currCountryName: this.countryname,
      allCountries: this.allCountries,
      countriesWeSend: this.countriesWeSend,
      isNoCountryDetected: this.isNoCountryDetected,
      isAvailableCountry: this.isAvailableCountry
    } = this.config.data);
  }

  private setForm(): void {
    this.basicForm = this.formBuilder.group({
      country: new UntypedFormControl('', [CustomValidators.minMax30(), CustomValidators.countries(this.allCountries)]),
      name: new UntypedFormControl('', [CustomValidators.minMax30()]),
      surnames: new UntypedFormControl('', [CustomValidators.minMax30()]),
      email: new UntypedFormControl('', [CustomValidators.minMax30(), CustomValidators.email()])
    });
  }

  private orderAllCountries(): void {
    this.allCountries.sort((a, b) => {
      const x = a.name || a._m_name.en;
      const y = b.name || b._m_name.en;

      return x < y ? -1 : x > y ? 1 : 0;
    });
  }

  public send(): void {
    this.basicForm.valid ? this.submit() : this.showErrors();
  }

  private submit(): void {
    this.closeModal({msg: this.textSrv.getText('User registered')});
    void this.softRegister();
  }

  private async softRegister(): Promise<void> {
    const resp = await this.authSrv.soft(this.buildSoftBody());

    if (resp) {
      this.storageSrv.set(VisitFromStorageKey.softRegistered, true);
    }
  }

  private buildSoftBody(): ISoftReqBody {
    return {
      country: this.basicForm.controls.country.value,
      countryDetected: this.currCountryIso,
      name: this.basicForm.controls.name.value,
      surnames: this.basicForm.controls.surnames.value,
      email: this.basicForm.controls.email.value.toLowerCase(),
      notificationLanguage: this.langSrv.getCurrentLang(),
      registrationInfo: {
        url: this.utilsSrv.getFullUrl()
      }
    };
  }

  private showErrors(): void {
    for (const control in this.basicForm.controls) {
      if (this.basicForm.controls.hasOwnProperty(control)) {
        const error: ValidationErrors = this.basicForm.controls[control].errors;

        if (error) {
          this.basicForm.controls[control].markAsTouched();
        }
      }
    }
  }

  public keyUpTyping(elemRef: InputCFComponent): void {
    const countryHasValue = this.basicForm.controls.country.value;
    const isTypingInInputCountry = elemRef.inputElm.classList[0] === 'country';
    const isShownCountryList = countryHasValue && isTypingInInputCountry;

    if (isShownCountryList) {
      this.showAlertWeDelivereThere();
    }
    this.showCountryList(isShownCountryList);
  }

  public gotIt(): void {
    this.closeModal();
  }

  public closeModal(message?: {msg: string}): void {
    this.onClose(message);
  }

  public chooseCountry(country: any): void {
    this.showCountryList(false);
    this.basicForm.controls.country.setValue(country.name);
    this.showAlertWeDelivereThere();
  }

  private showAlertWeDelivereThere(): void {
    const countrySelected = this.basicForm.controls.country.value.toLowerCase();
    const matchCountryWeSend = this.countriesWeSend.filter((country: any) => country.name.toLowerCase() === countrySelected);

    this.country = matchCountryWeSend[0]?.name;
  }

  private showCountryList(isShownCountryList: boolean): void {
    this.showListCountries = isShownCountryList;
  }

  public ngOnDestroy(): void {
    if (this.autocompleteHasMatchesSubscription) {
      this.autocompleteHasMatchesSubscription.unsubscribe();
    }
  }
}
