import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AppConfigurationService, SidenavToggleService } from 'src/app/shared/services';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-analytics-container',
  templateUrl: './analytics-container.component.html',
  styleUrls: ['./analytics-container.component.scss'],
  standalone: true,
  imports: [CommonModule, MatSidenavModule, MatIconModule, MatListModule, RouterModule],
})
export class AnalyticsContainerComponent implements OnInit {
  public isMenuOpen: boolean;
  public navLinks: any[];
  collapse = 70;
  expand = 224;
  contentMargin = this.expand;
  private activeLinkIndex = -1;
  isProduction: boolean = false;
  isCollapsed = false;

  constructor(
    private readonly router: Router,
    private readonly sidenavToggleService: SidenavToggleService,
    protected appConfigurationService: AppConfigurationService
  ) {
    this.isProduction = this.appConfigurationService.configuration.isProduction == 'true' ? true : false;
    this.navLinks = [];
    if (!this.isProduction) {
      this.navLinks = this.navLinks.concat({
        link: '/analytics/playbook',
        label: 'Playbook',
        icon: 'overview_icon',
        index: 0,
      });
    }
    this.navLinks = this.navLinks.concat({
      link: '/analytics/simulation',
      label: 'Best region to source',
      icon: 'overview_icon',
      index: 1,
    });
    this.navLinks = this.navLinks.concat({
      link: '/analytics/bestprocess',
      label: 'Best Process',
      icon: 'overview_icon',
      index: 2,
    });
    // Uncomment below code for Sensitivity Analysis tab
    // this.navLinks = this.navLinks.concat({
    //   link: '/analytics/sensitivityanalysis',
    //   label: 'Sensitivity Analysis',
    //   icon: 'overview_icon',
    //   index: 3,
    // });
    // Uncomment below code for Competitive Analysis tab
    // this.navLinks = this.navLinks.concat({
    //   link: '/analytics/competitiveanalysis',
    //   label: 'Competitive Analysis',
    //   icon: 'overview_icon',
    //   index: 6,
    // });
    if (!this.isProduction) {
      this.navLinks = this.navLinks.concat({
        link: '/analytics/toolingoptimization',
        label: 'Tooling Optimization',
        icon: 'overview_icon',
        index: 4,
      });
      this.navLinks = this.navLinks.concat({
        link: '/analytics/predictiveanalytics',
        label: 'Predictive Analytics',
        icon: 'overview_icon',
        index: 5,
      });
      this.navLinks = this.navLinks.concat({
        link: '/analytics/lotsizeoptimization',
        label: 'Lot size Optimization',
        icon: 'overview_icon',
        index: 6,
      });
    }
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

  toggleTabHeaders(): void {
    this.isCollapsed = !this.isCollapsed;
  }
}
