import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { combineLatest, Subscription } from 'rxjs';
import { BlockUiService, CountryDataService, SidenavToggleService } from 'src/app/shared/services';
import { VendorService } from '../../Service/vendor.service';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-data-container',
  templateUrl: './data-container.component.html',
  styleUrls: ['./data-container.component.scss'],
  standalone: true,
  imports: [MatSidenavModule, MatListModule, MatIconModule, RouterModule, CommonModule],
})
export class DataContainerComponent implements OnInit {
  isMenuOpen: boolean;
  collapse = 70;
  expand = 160;
  contentMargin = this.expand;
  navLinks: {
    link: string;
    label: string;
    icon: string;
    index: number;
  }[];
  activeLinkIndex = -1;
  vendorData$: Subscription;

  constructor(
    private readonly router: Router,
    private readonly sidenavToggleService: SidenavToggleService,
    private vendorSvc: VendorService,
    private _countrySvc: CountryDataService,
    private blockUiService: BlockUiService
  ) {
    this.loadConfigData();
    this.navLinks = [
      {
        link: '/data/supplier',
        label: 'Supplier',
        icon: 'overview_icon',
        index: 0,
      },
      {
        link: '/data/business-unit',
        label: 'Business Unit',
        icon: 'overview_icon',
        index: 1,
      },
    ];
  }

  ngOnInit(): void {
    this.router.events.subscribe(() => {
      this.activeLinkIndex = this.navLinks.indexOf(this.navLinks.find((tab) => tab.link === this.router.url));
    });
    this.sidenavToggleService.isMenuOpenSub$.subscribe((toggle: boolean) => {
      this.isMenuOpen = toggle;
      this.contentMargin = !this.isMenuOpen ? this.collapse : this.expand;
    });
  }

  private loadConfigData() {
    const vendor$ = this.vendorSvc.getVendorList();
    const country$ = this._countrySvc.getCountryData();
    this.blockUiService.pushBlockUI('loadConfigData');
    combineLatest([vendor$, country$]).subscribe(
      (data) => {
        this.blockUiService.popBlockUI('loadConfigData');
        if (data && data[1]?.length) {
          this.vendorSvc.vendorDtoSubject$.next(data[0]);
          this._countrySvc.countryList$.next(data[1]);
        }
      },
      () => {
        this.blockUiService.popBlockUI('loadConfigData');
      }
    );
  }
}
