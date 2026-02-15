import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
// import { Router } from '@angular/router';
// import {
//   CountryDataService,
//   SidenavToggleService,
// } from 'src/app/shared/services';
// import { UserInfoService } from 'src/app/shared/services/user-info-service';

@Component({
  selector: 'app-home-shell-page',
  templateUrl: './home-shell-page.component.html',
  styleUrls: ['./home-shell-page.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
})
export class HomeShellPageComponent {
  // public isMenuOpen: boolean;
  // collapse = 70;
  // expand = 160;
  // contentMargin = this.expand;
  // public navLinks: any[];
  // private activeLinkIndex = -1;

  constructor() {
    // private userService: UserInfoService // private _countrySvc: CountryDataService, // private readonly sidenavToggleService: SidenavToggleService, // private readonly router: Router,
    // this.navLinks = [
    //   {
    //     link: '/home/overview',
    //     label: 'Overview',
    //     icon: 'overview_icon',
    //     index: 0,
    //   },
    //   {
    //     link: '/home/projects',
    //     label: 'Projects',
    //     icon: 'folder_opened_icon',
    //     index: 1,
    //   },
    //   {
    //     link: '/home/project/create',
    //     label: 'Create',
    //     icon: 'create_icon',
    //     index: 2,
    //   },
    // ];
  }

  // ngOnInit(): void {
  // this.userService.getLocationInfo();
  // this.router.events.subscribe((res) => {
  //   this.activeLinkIndex = this.navLinks.indexOf(
  //     this.navLinks.find((tab) => tab.link === this.router.url)
  //   );
  // });
  // this.sidenavToggleService.isMenuOpenSub$.subscribe((toggle: boolean) => {
  //   this.isMenuOpen = toggle;
  //   this.contentMargin = !this.isMenuOpen ? this.collapse : this.expand;
  // });
  // // Load country data
  // this._countrySvc.loadCountryData();
  // }
}
