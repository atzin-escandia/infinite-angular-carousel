import {Component, OnInit, Injector, ChangeDetectorRef, ViewEncapsulation, AfterContentChecked} from '@angular/core';
import {BasePage} from '../../../../pages';
import {OrdersService, UpService, ProductService} from '../../../../services';
import {TicketsService} from '../../services';
import {GenericPopupComponent} from '../../../../popups/generic-popup';
import {TranslocoService} from '@ngneat/transloco';
import {MasterBox} from '@interfaces/master-box.interface';
import {Product} from '@interfaces/product.interface';
@Component({
  selector: 'open-issue',
  templateUrl: './open-issue.page.html',
  styleUrls: ['./open-issue.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class OpenIssuePageComponent extends BasePage implements OnInit, AfterContentChecked {
  public currentStep = 0;
  public starterRadioChecked: number;

  public order: any;

  public pathSelected: string[];
  public paths = [
    ['productSelectorMissing', 'quantityMissing', 'twoImages', 'optionalComment', 'issueConfirmed'],
    ['productSelector', 'quantityAffected', 'twoImages', 'optionalComment', 'issueConfirmed'],
    ['describeReason', 'twoImages', 'issueConfirmed'],
    ['describeReason', 'optionalTwoImages', 'issueConfirmed']
  ];

  public imagesTypes = ['image/jpeg', 'image/png', 'image/gif'];
  public quantityCanBeMissing = [
    {text: '10% - A small part of the product missing', quantity: '10% - A small part of the product', quantityNumber: 10},
    {text: '25% - A part of the product missing', quantity: '25% - A part of the product', quantityNumber: 25},
    {text: '50% - Half of the product missing', quantity: '50% - Half of the product', quantityNumber: 50},
    {text: '75% - A big part of the product missing', quantity: '75% - A big part of the product', quantityNumber: 75},
  ];
  public quantityCanBeAffected = [
    {text: '10% - A small part of the product', quantity: '10% - A small part of the product', quantityNumber: 10},
    {text: '25% - A part of the product', quantity: '25% - A part of the product', quantityNumber: 25},
    {text: '50% - Half of the product', quantity: '50% - Half of the product', quantityNumber: 50},
    {text: '75% - A big part of the product', quantity: '75% - A big part of the product', quantityNumber: 75},
    {text: '100% - Everything', quantity: '100% - Everything', quantityNumber: 100},
    {text: 'Only the box', quantity: 'Only the box', quantityNumber: 0}
  ];
  public refundPreferenceSelectable = false;
  public refundPreferences = [
    'A new box',
    'Refund of the money'
  ];
  public problemSelector = [
    {text: 'Incomplete products', code: 'PROBLEM_MISSING_PRODUCT'},
    {text: 'Bad state products', code: 'PROBLEM_DAMAGE'},
    {text: 'Wrong products', code: 'PROBLEM_WRONG_PRODUCTS'},
    // {text: 'Others', code: 'PROBLEM_GENERAL'}
  ];

  public userInput = [this.startStateTemp()];
  public ticketData = this.ticketDataTemp();

  public loaded = false;
  public masterBox: MasterBox;
  public products: Product[] = [];

  constructor(
    public injector: Injector,
    public ordersSrv: OrdersService,
    public ticketSrv: TicketsService,
    private cdr: ChangeDetectorRef,
    public translocoSrv: TranslocoService,
    private productSrv: ProductService,
    private upSrv: UpService
  ) {
    super(injector);
  }

  async ngOnInit(): Promise<void> {
    const orderId = this.getParam('orderId');

    this.order = await this.ordersSrv.get(orderId, true);

    // Can't open ticket
    if (!this.order.canOpenIssue) {
      this.routerSrv.navigate('private-zone/my-order/info/' + this.order._id);
    }

    this.setLoading(false);
    this.setInnerLoader(false, false);
    this.loaded = true;

    this.masterBox = await this.upSrv.getMasterBox(this.order.shipment.boxes[0]._masterBox);
    await this.loadProducts();
  }

  private async loadProducts(): Promise<void> {
    const productsPromises = [];

    for (const mbProduct of this.masterBox.products) {
      productsPromises.push(this.productSrv.getById(mbProduct._productId));
    }

    this.products = await Promise.all(productsPromises);
  }

  public changeSection(step: number): void {
    if (!this.pathSelected || this.pathSelected.length < 1) {
      return;
    }

    if (this.currentStep + step <= 0) {
      // Prevents negatives
      this.currentStep = 0;

      return;
    } else if (this.userInput && this.currentStep + step >= this.userInput.length) {
      // Prevents longer than exits
      void this.createTicket();
    } else if (step === -1) {
      // Go back
      this.currentStep += step;
    } else {
      // Check and adds step
      if (this.checkDataValid()) {
        this.currentStep += step;
      }
    }

    this.domSrv.scrollToTop();
  }

  public checkDataValid(): boolean {
    if (this.currentStep === 0) {
      return true;
    }

    const currentComp = this.pathSelected[this.currentStep - 1];

    switch (currentComp) {
      case 'productSelector':
      case 'productSelectorMissing':
        return this.ticketData[currentComp].length > 0;
      case 'describeReason':
        return this.ticketData.describeReason.trim().length > 0;
      case 'twoImages':
        return this.ticketData[currentComp].firstImage && this.ticketData[currentComp].secondImage;
      case 'quantityAffected':
      case 'quantityMissing':
        return this.ticketData[currentComp] !== null && this.ticketData[currentComp] !== undefined;
      case 'optionalComment':
        return (this.refundPreferenceSelectable ?
          (this.ticketData.refundPreference !== null && this.ticketData.refundPreference !== undefined) : true) &&
          this.ticketData.describeReason.trim().length > 0;
      case 'optionalTwoImages':
        return true;
      case 'issueConfirmed':
        return this.ticketData.confirmData;
    }
  }

  public async createTicket(): Promise<void> {
    // Must accept share data
    if (!this.ticketData.confirmData) {
      return;
    }

    this.setInnerLoader(true, true);

    // Comment with info
    let products = '';

    if (this.pathSelected.includes('productSelector')) {
      products = this.ticketData.productSelector.join(' ');
    }
    if (this.pathSelected.includes('productSelectorMissing')) {
      products = this.ticketData.productSelectorMissing.join(' ');
    }
    let reason = '';

    if (this.pathSelected.includes('describeReason') || this.pathSelected.includes('optionalComment')) {
      reason = this.ticketData.describeReason ? this.ticketData.describeReason : '';
    }
    let quantity = '';

    if (this.pathSelected.includes('quantityAffected')) {
      quantity = this.ticketData.quantityAffected;
    }
    if (this.pathSelected.includes('quantityMissing')) {
      quantity = this.ticketData.quantityMissing;
    }
    let refundPreference: string;

    if (this.pathSelected.includes('optionalComment')) {
      refundPreference = this.ticketData.refundPreference;
    }

    const ticketComment = [this.ticketData.problem.text, products, quantity, reason, refundPreference].join('\n');
    const ticketExtended = {
      problemText: this.ticketData.problem.text,
      products: [],
      reason,
      refundPreference
    };
    const productsAux = this.ticketData.productSelector.concat(this.ticketData.productSelectorMissing);

    for (const productAux of productsAux) {
      const productSelected = this.products.filter((product) => product._m_name[this.langSrv.getCurrentLang()] === productAux);

      if (productSelected?.length) {
        ticketExtended.products.push({
          _productId: productSelected[0]._id,
          name: productAux,
          refundPercentage: this.ticketData.quantityNumber,
        });
      }
    }

    try {
      // Add imgs
      let imagesToUpload: any = [];

      if (this.pathSelected.includes('twoImages')) {
        imagesToUpload = [this.ticketData.twoImages.firstImage, this.ticketData.twoImages.secondImage];
      } else if (this.pathSelected.includes('optionalTwoImages')) {
        for (const image of Object.values(this.ticketData.optionalTwoImages)) {
          imagesToUpload.push(image);
        }
      }
      const imageUrls = await this.ticketSrv.addPhotos(imagesToUpload);

      // Creates ticket
      const ticketObj = {
        orderId: this.order._id,
        reasonCode: this.ticketData.problem.code,
        ticketComment,
        ticketExtended,
        channel: 'WEB',
        imageUrls
      };

      await this.ticketSrv.openTicket(ticketObj);
      this.routerSrv.navigate('private-zone/my-order/info/' + this.order._id);
    } catch (e) {
      console.error(e);
      this.popupSrv.open(GenericPopupComponent, {data: {msg: this.textSrv.getText(e.msg), id: 'image-upload-error'}});
    }

    this.setInnerLoader(false, true);
  }

  /// ////////////
  // Radios Events
  /// ////////////
  public setPath(index: number, __text: string): void {
    this.userInput = [this.startStateTemp()];
    this.ticketData = this.ticketDataTemp();
    this.starterRadioChecked = index;

    // Adds components
    this.pathSelected = this.paths[index];

    // If only one product, no product selector
    const products = this.order.shipment.boxes[0].products;

    if (products.length === 1 && (index === 0 || index === 1 || index === 2)) {
      if (this.pathSelected.includes('productSelector')) {
        this.selectProducts(products[0]._m_name[this.langSrv.getCurrentLang()] || products[0]._m_name.en, true);
        this.pathSelected.splice(this.pathSelected.indexOf('productSelector'), 1);
      } else if (this.pathSelected.includes('productSelectorMissing')) {
        this.selectProducts(products[0]._m_name[this.langSrv.getCurrentLang()] || products[0]._m_name.en, true);
        this.pathSelected.splice(this.pathSelected.indexOf('productSelectorMissing'), 1);
      }
    }

    this.pathSelected.map((component: string) => {
      if (this[component + 'Temp']) {
        this.userInput.push(this[component + 'Temp']());
      }
    });

    this.ticketData.problem = this.problemSelector[index];
  }

  public setQuantity(index: number): void {
    // Prevents transition bug
    document.querySelector('.open-issue-effect').classList.add('no-effect');

    // Set radio selected
    if (this.pathSelected.includes('quantityAffected')) {
      this.ticketData.quantityAffected = this.quantityCanBeAffected[index].quantity;
      this.ticketData.quantityNumber = this.quantityCanBeAffected[index].quantityNumber;
    } else if (this.pathSelected.includes('quantityMissing')) {
      this.ticketData.quantityMissing = this.quantityCanBeMissing[index].quantity;
      this.ticketData.quantityNumber = this.quantityCanBeMissing[index].quantityNumber;
    }

    this.refundPreferenceSelectable = this.order.up.enableNewShipmentFarmer &&
      (this.order.shipment.boxes[0].products.length > 1 || index === 3 || index === 4);

    // Prevents transition bug
    setTimeout(() => {
      document.querySelector('.open-issue-effect').classList.remove('no-effect');
    }, 0);
  }

  public setRefundPreference(index: number): void {
    // Prevents transition bug
    document.querySelector('.open-issue-effect').classList.add('no-effect');

    // Set radio selected
    this.ticketData.refundPreference = this.refundPreferences[index];

    // Prevents transition bug
    setTimeout(() => {
      document.querySelector('.open-issue-effect').classList.remove('no-effect');
    }, 0);
  }

  /// ////////////
  // Upload event
  /// ////////////
  public uploadPhoto(e: any, id: number, index: number, clickEvent: boolean = false): void {
    this.userInput[this.currentStep].inputs[index].error = null;

    // Pick files
    let fileToUpload: any;

    if (e.dataTransfer && e.dataTransfer.files) {
      fileToUpload = e.dataTransfer.files[0];
    } else {
      fileToUpload = e.target.files[0];
    }

    const currentComp = this.pathSelected[this.currentStep - 1];

    // Don't upload two photos with the same name
    let isAlreadyUploaded = false;
    let photosUploaded = 0;

    for (const key in this.ticketData[currentComp]) {
      if (this.ticketData[currentComp].hasOwnProperty(key)) {
        photosUploaded++;

        if (!clickEvent && this.ticketData[currentComp][key].name === fileToUpload.name) {
          isAlreadyUploaded = true;
          break;
        }
      }
    }

    // Don't allow same file name
    if (isAlreadyUploaded) {
      this.userInput[this.currentStep].inputs[index].error = 'Photo already uploaded';

      return;
    }

    // Upload photos in order
    if (photosUploaded < index && !(currentComp === 'optionalTwoImages')) {
      if (clickEvent) {
        e.preventDefault();
        e.stopPropagation();
      }

      return;
    } else if (clickEvent) {
      return;
    }

    // Checks file
    if (fileToUpload.size > 4000000) {
      // Size > 4M
      this.userInput[this.currentStep].inputs[index].error = this.translocoSrv.translate('global.maximum-photo-size.form');

      return;
    }

    if (!this.imagesTypes.includes(fileToUpload.type)) {
      // File type
      this.userInput[this.currentStep].inputs[index].error = this.translocoSrv.translate('notifications.file-format.form');

      return;
    }

    // Adds photo
    if (!this.userInput[this.currentStep].inputs[index].name) {
      this.userInput[this.currentStep].currentAdding++;
    }
    this.userInput[this.currentStep].inputs[index].name = fileToUpload.name;

    this.ticketData[currentComp][id] = fileToUpload;
  }

  /// ////////////
  // Select events
  /// ////////////
  public selectProducts(productName: string, auto: boolean): void {
    let currentComp;

    if (auto) {
      currentComp = this.pathSelected[this.currentStep];
    } else {
      currentComp = this.pathSelected[this.currentStep - 1];
    }

    const producIndex = this.ticketData[currentComp].indexOf(productName);

    // Adds / Slices depending on if its already added
    if (producIndex === -1) {
      this.ticketData[currentComp].push(productName);
    } else {
      // Don't change in case of one product
      if (this.order.shipment.boxes[0].products.length === 1) {
        return;
      }

      this.ticketData[currentComp].splice(producIndex, producIndex + 1);
    }
  }

  public setConfrimed(__dummy: any): void {
    this.ticketData.confirmData = !this.ticketData.confirmData;
  }

  /// ////////////
  // Text events
  /// ////////////
  public setReasonText(value: string): void {
    this.ticketData.describeReason = value;
  }

  /// ////////////
  // Componentes templates
  /// ////////////
  public startStateTemp(): any {
    return {
      type: 'radio',
      title: 'What happend?',
      click: 'setPath',
      radioVariable: 'starterRadioChecked',
      radios: [
        {
          text: this.problemSelector[0].text
        },
        {
          text: this.problemSelector[1].text
        },
        {
          text: this.problemSelector[2].text
        },
        // {
        //   text: this.problemSelector[3].text
        // }
      ]
    };
  }

  public productSelectorTemp(): any {
    const products = this.order.shipment.boxes[0].products;

    return {
      type: 'check',
      title: 'Select affected products',
      click: 'selectProducts',
      checks: products.map(product => ({
        text: product.amount * this.order.shipment.boxes.length + 'x ' +
        (product._m_name[this.langSrv.getCurrentLang()] || product._m_name.en),
        arg: (product._m_name[this.langSrv.getCurrentLang()] || product._m_name.en)
      }))
    };
  }

  public productSelectorMissingTemp(): any {
    const productSelector = this.productSelectorTemp();

    productSelector.title = 'Select missing products';

    return productSelector;
  }

  public describeReasonTemp(): any {
    return {
      type: 'comment',
      title: 'Describe what happend',
      commentVariable: 'describeReason',
      change: 'setReasonText',
      placeholder: 'What happend with the order?'
    };
  }

  public optionalCommentTemp(): any {
    const comment = this.describeReasonTemp();

    comment.selectRefundPreference = true;
    comment.extraSubtitle = 'Select refund option';
    comment.click = 'setRefundPreference';
    comment.radios = [
      {
        text: this.refundPreferences[0]
      },
      {
        text: this.refundPreferences[1]
      }
    ];

    return comment;
  }

  public twoImagesTemp(): any {
    return {
      type: 'photo',
      title: 'We need photos',
      subtitle: 'Lets upload photos',
      click: 'uploadPhoto',
      currentAdding: 0,
      inputs: [
        {
          title: 'Photo of the box',
          subtitle: 'The label must be included',
          placeholder: 'Upload photo',
          id: 'firstImage'
        },
        {
          title: 'Photo of the inside',
          subtitle: 'With the products',
          placeholder: 'Upload photo',
          id: 'secondImage'
        }
      ]
    };
  }

  public optionalTwoImagesTemp(): any {
    const twoImages = this.twoImagesTemp();

    twoImages.title = 'Optional 2 photos';
    twoImages.subtitle = '';
    twoImages.inputs[0].title = 'Picture 1';
    twoImages.inputs[0].subtitle = '';
    twoImages.inputs[0].optional = true;
    twoImages.inputs[1].title = 'Picture 2';
    twoImages.inputs[1].subtitle = '';
    twoImages.inputs[1].optional = true;

    return twoImages;
  }

  public quantityMissingTemp(): any {
    return {
      type: 'radio',
      title: 'Quantity missing',
      click: 'setQuantity',
      radios: [
        {
          text: this.quantityCanBeMissing[0].text
        },
        {
          text: this.quantityCanBeMissing[1].text
        },
        {
          text: this.quantityCanBeMissing[2].text
        },
        {
          text: this.quantityCanBeMissing[3].text
        }
      ]
    };
  }
  public quantityAffectedTemp(): any {
    return {
      type: 'radio',
      title: 'Quantity affected',
      click: 'setQuantity',
      radios: [
        {
          text: this.quantityCanBeAffected[0].text
        },
        {
          text: this.quantityCanBeAffected[1].text
        },
        {
          text: this.quantityCanBeAffected[2].text
        },
        {
          text: this.quantityCanBeAffected[3].text
        },
        {
          text: this.quantityCanBeAffected[4].text
        },
        {
          text: this.quantityCanBeAffected[5].text
        }
      ]
    };
  }

  public issueConfirmedTemp(): any {
    return {
      type: 'check',
      title: 'Thanks for your colaboration',
      subtitle: 'We will confirm your issue and contact with you',
      click: 'setConfrimed',
      checks: [
        {
          text: 'The data provided is faithful to the reality',
          arg: true
        }
      ]
    };
  }

  /// ////////////
  // Data collected template
  /// ////////////
  public ticketDataTemp(): any {
    return {
      problem: null, // radio
      productSelector: [], // Checks
      productSelectorMissing: [], // Checks
      twoImages: {}, // Images Inputs
      optionalTwoImages: {}, // Images Inputs
      quantityAffected: null, // Radio
      quantityNumber: 0, // Number percentage
      confirmData: false, // Check
      describeReason: '' // TextArea
    };
  }

  // Need to prevent error
  ngAfterContentChecked(): void {
    this.cdr.detectChanges();
  }
}
