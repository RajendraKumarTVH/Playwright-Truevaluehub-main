import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { Router, RouterModule } from '@angular/router';
import { SidenavToggleService } from 'src/app/shared/services';

@Component({
  selector: 'app-setting-container',
  templateUrl: './setting-container.component.html',
  styleUrls: ['./setting-container.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatSidenavModule, MatListModule, RouterModule, MatIconModule],
})
export class SettingContainerComponent implements OnInit {
  isMenuOpen: boolean;
  collapse = 70;
  expand = 160;
  contentMargin = this.expand;
  navLinks: any[];
  activeLinkIndex = -1;

  constructor(
    private readonly router: Router,
    private readonly sidenavToggleService: SidenavToggleService
  ) {
    this.navLinks = [
      {
        link: '/settings/customer',
        label: 'Customer',
        icon: 'overview_icon',
        index: 0,
      },
      // {
      //   link: '/settings/profile',
      //   label: 'Profile',
      //   icon: 'overview_icon',
      //   index: 1,
      // },
      {
        link: '/settings/add-user',
        label: 'User',
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
}
