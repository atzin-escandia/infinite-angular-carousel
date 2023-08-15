import {Component, OnInit, Injector, HostListener, ViewEncapsulation, OnDestroy} from '@angular/core';
import {BasePage} from '../base';
import {
  ContactService,
  AuthService,
  CheckDataService,
  CrossSellingService,
} from '../../services';
import {BlogResource} from '../../resources/blog';
import {DeviceDetectorService} from 'ngx-device-detector';
import {CROSS_SELLING_LOCATIONS} from '../../constants/cross-selling.constants';
import {CONTACT_SUBJECT} from './contact.constants';

@Component({
  selector: 'contact-page',
  templateUrl: './contact.page.html',
  styleUrls: ['./contact.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ContactPageComponent extends BasePage implements OnInit, OnDestroy {
  constructor(
    public injector: Injector,
    public authSrv: AuthService,
    public contactSrv: ContactService,
    public deviceService: DeviceDetectorService,
    public checkSrv: CheckDataService,
    private blogRsc: BlogResource,
    private crossSellingSrv: CrossSellingService
  ) {
    super(injector);
  }

  public cards: any;
  public contactInfo: any;
  public subjects = Object.values(CONTACT_SUBJECT);
  public translatedSubjects = [];
  public subjectsIsOpen = false;
  public pickedSubject: CONTACT_SUBJECT;
  public readonly goToPrivateZoneOptions = [
    CONTACT_SUBJECT.PAYMENT,
    CONTACT_SUBJECT.ORDER_INCIDENT,
    CONTACT_SUBJECT.ORDER_DELIVERY_STATUS,
    CONTACT_SUBJECT.ORDER_MODIFICATION
  ];
  public isLoading = false;
  public countries: any;
  public privacy = false;
  public privacyError = false;
  public sentMessage = false;
  public errorIn: any;
  public fileError: any;
  public langSubs: any;
  public imagesTypes: any = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif'];
  public filesIndex = [0, 1, 2];

  public blogPosts = [];

  public currLang: string;
  public country: string;
  public csParams: any = {};
  public csSpecifications: any = {};
  public isCsActive = false;

  public sendCopy = false;

  /**
   * keeps user in the same page when clicking back after sending contact info
   */
  @HostListener('window:popstate', ['$event'])
  onPopState(): void {
    if (this.sentMessage) {
      this.routerSrv.navigateToSpecificUrl('contact');
    }
  }

  async ngOnInit(): Promise<void> {
    this.setAppLayout();

    const deviceInfo = this.deviceService.getDeviceInfo();

    this.country = this.countrySrv.getCountry();
    this.currLang = this.langSrv.getCurrentLang();

    this.contactInfo = {
      name: '',
      surname: '',
      email: '',
      subject: '',
      message: '',
      imageUrls: [],
      sendCopy: false
    };

    if (deviceInfo) {
      this.contactInfo.techInfo = {
        browser: (deviceInfo.browser || '') + ' ' + (deviceInfo.browser_version || ''),
        os: (deviceInfo.os || '') + ' ' + (deviceInfo.os_version || ''),
        device: deviceInfo.device || null,
        prevPage: document.referrer || null,
      };
    }

    this.errorIn = {
      name: false,
      surname: false,
      email: false,
      subject: false,
      message: false
    };
    this.fileError = {};
    if (this.authSrv.isLogged()) {
      this.user = await this.userService.get();
      this.contactInfo.name = this.user.name;
      this.contactInfo.surname = this.user.surnames;
      this.contactInfo.email = this.user.email;
    }

    this.cards = [
      {
        icon: 'eva eva-phone-outline',
        question: 'first contact card question',
        answer: 'first contact card answer',
        showText: false,
        showApp: true
      },
      {
        icon: 'eva eva-shopping-bag-outline',
        question: 'second contact card question',
        answer: 'second contact card answer',
        showText: false,
        showApp: !this.app
      },
      {
        icon: 'eva eva-email-outline',
        question: 'third contact card question',
        answer: 'third contact card answer',
        showText: false,
        showApp: true
      }
    ];

    for (const subj of this.subjects) {
      this.translatedSubjects.push(this.textSrv.getText(subj));
    }

    this.langSubs = this.langSrv.getCurrent().subscribe(() => {
      this.translatedSubjects = [];
      for (const subj of this.subjects) {
        this.translatedSubjects.push(this.textSrv.getText(subj));
      }
    });

    this.countries = await this.countrySrv.getAll();
    this.setLoading(false);
    this.setInnerLoader(false, false);
  }

  private setAppLayout(): void {
    if (this.app) {
      this.domSrv.showHeader(false);
      this.domSrv.showFooter(false);
    }
  }

  ngOnDestroy(): void {
    if (this.langSubs) {
      this.langSubs.unsubscribe();
    }
  }

  /**
   * manages subject changes
   */
  public changeSubject(): void {
    if (this.pickedSubject === CONTACT_SUBJECT.VISIT_A_FARMER) {
      this.contactInfo.phone = {prefix: '', number: ''};
      this.contactInfo.visitors = '';
      this.errorIn.phone = {prefix: false, number: false};
      this.errorIn.visitors = false;
    } else {
      if (this.contactInfo?.phone?.prefix === '' && this.contactInfo?.phone?.number === '') {
        delete this.contactInfo.phone;
      }
      if (this.contactInfo.visitors || this.contactInfo.visitors === '') {
        delete this.contactInfo.visitors;
      }
      if (this.errorIn?.phone?.prefix === '' && this.errorIn?.phone?.number === '') {
        delete this.contactInfo.phone;
      }
    }
    this.contactInfo.subject = this.pickedSubject;
    this.errorIn.subject = false;
  }

  /**
   * manages sending contact info to capi
   */
  public async saveContact(): Promise<void> {
    this.isLoading = true;
    this.minLengthIsValid('name');
    this.minLengthIsValid('surname');
    this.emailIsValid();
    this.minLengthIsValid('subject');
    this.minLengthIsValid('message');
    this.privacyIsValid();

    if (this.pickedSubject === CONTACT_SUBJECT.VISIT_A_FARMER) {
      this.phoneMinLengthIsValid();
      this.errorIn.visitors = this.contactInfo.visitors.length < 1;
      this.errorIn.prefix = this.contactInfo.phone.prefix.length < 1;
    }

    if (!this.privacyError) {
      for (const error in this.errorIn) {
        if (this.errorIn[error] === true) {
          this.isLoading = false;

          return;
        }
      }

      this.contactInfo.lang = this.langSrv.getCurrentLang();
      this.contactInfo.sendCopy = this.sendCopy;

      if (this.user) {
        this.contactInfo._crowdfarmer = this.user._id;
      }
      const saved = await this.contactSrv.saveContact(this.contactInfo);

      if (saved) {
        this.sentMessage = true;
        this.isLoading = false;

        try {
          const blogBody = await this.blogRsc.getPosts(this.currLang);

          if (blogBody) {
            // blogBody.map((post: any) => {
            //   post.link = '/' + this.currLang + '/' + post.link.split('news.')[1];
            // });

            this.blogPosts = blogBody;
          }
        } catch (error) {
          // Just catch
        }

        this.showCrossSelling();
        this.domSrv.scrollToTop();
      }
    }
    this.isLoading = false;
  }

  /**
   * Opend FAQs cards in mobile
   */
  public showCardText(id: number): void {
    this.cards[id].showText = !this.cards[id].showText;
  }

  public pickCountry(prefix: string): void {
    this.contactInfo.phone.prefix = prefix;
  }

  /**
   * validates form values minumum lenght
   */
  public minLengthIsValid(name: string): void {
    if (name === 'name' || name === 'surname') {
      this.errorIn[name] = this.contactInfo[name].length < 1;
    } else {
      this.errorIn[name] = this.contactInfo[name].length < 4;
    }
  }

  /**
   * validates phone form values minumum lenght
   */
  public phoneMinLengthIsValid(): void {
    this.errorIn.phone.prefix = this.contactInfo.phone.prefix.length <= 1;
    this.errorIn.phone.number = this.contactInfo.phone.number.length <= 1;
  }

  /**
   * validates email
   */
  public emailIsValid(): void {
    const input = this.contactInfo.email;

    this.errorIn.email = !this.checkSrv.emailIsValid(input) || this.checkSrv.inputValidLength(input, 0, 64);
  }

  /**
   * toggles value of privaci variable
   */
  public privacyIsValid(): void {
    this.privacyError = !this.privacy;
  }

  /**
   * Opens helpdocs page
   */
  public openHelpdocs(): void {
    window.open(this.textSrv.getText('Helpdocs_support_CrowdFarming'));
  }

  public manageFile(e: any, id: number): void {
    // Pick files
    let fileToUpload: any;

    if (e.dataTransfer && e.dataTransfer.files) {
      fileToUpload = e.dataTransfer.files[0];
    } else {
      fileToUpload = e.target.files[0];
    }
    this.fileError = {};
    // Checks file
    // Size > 10Mb
    if (fileToUpload.size > 10000000) {
      this.fileError = {id, error: 'size'};

      return;
    }

    // File type
    if (!this.imagesTypes.includes(fileToUpload.type.toLowerCase())) {
      this.fileError = {id, error: 'format'};

      return;
    }
    this.contactInfo.imageUrls[id] = fileToUpload;
  }

  public removeFile(id: number): void {
    if (this.contactInfo.imageUrls[id]) {
      this.contactInfo.imageUrls.splice(id, 1);
    }
  }

  private showCrossSelling(): void {
    this.crossSellingSrv.isCsActive(CROSS_SELLING_LOCATIONS.CONTACT_PAGE)
      .subscribe(() => {
        this.isCsActive = true;
    });

    if (this.country) {
      this.csParams.country = this.country;
    }

    if (this.user) {
      this.csParams.user = this.user._id;
    }

    this.csParams.limit = 4;

    this.csSpecifications = {
      crossSellingSB: {
        header: 'boxes to be planned',
        trackingListName: 'csContact SB',
        trackingGA4ListName: 'CS_Contact/Single_Boxes',
      },
      ohProjects: {
        header: 'http://page.youmight-also-like.body',
        trackingListName: 'csContact OH',
        trackingGA4ListName: 'CS_Contact/Overharvest',
      },
      adoptionProjects: {
        header: 'global.available-adoption.title',
        trackingListName: 'csContact Adoptions',
        trackingGA4ListName: 'CS_Contact/Adoptions',
      },
      trackingActionName: 'csContact'
    };
  }

  /**
   * from child component emit -> redirects to shopping cart after adding cs product
   */
  public addedCrossSelling(): void {
    this.routerSrv.navigateToOrderSection('cart');
  }

  /**
   * Redirects the user to orders list if logged
   * Otherwise redirect him to login
   */
  public orderIncidentAction(): void {
    this.routerSrv.navigateToOrderList(!!this.user);
  }

  public get isAttachFilesSubject(): boolean {
    return [
      CONTACT_SUBJECT.TECHNICAL_ISSUE,
      CONTACT_SUBJECT.FEEDBACK_SUGGESTION,
      CONTACT_SUBJECT.OTHERS
    ].includes(this.pickedSubject);
  }

  public get isPhoneNumberSubject(): boolean {
    return this.pickedSubject ===  CONTACT_SUBJECT.VISIT_A_FARMER;
  }
}
