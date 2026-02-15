import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { Router, RouterModule } from '@angular/router';
import { SidenavToggleService } from 'src/app/shared/services';

@Component({
  selector: 'app-reports-page',
  templateUrl: './reports-page.component.html',
  styleUrls: ['./reports-page.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatSidenavModule, MatListModule, MatIconModule, RouterModule],
})
export class ReportsPageComponent implements OnInit {
  public isMenuOpen: boolean;
  collapse = 70;
  expand = 160;
  contentMargin = this.expand;
  public navLinks: any[];
  private activeLinkIndex = -1;

  constructor(
    private readonly router: Router,
    private readonly sidenavToggleService: SidenavToggleService
  ) {
    this.navLinks = [
      {
        link: '/reports/materialreport',
        label: 'Project Summary Report',
        icon: 'overview_icon',
        index: 0,
      },
      {
        link: '/reports/costingreport',
        label: 'Cost Summary Report',
        icon: 'overview_icon',
        index: 1,
      },
      {
        link: '/reports/costBreakdownreport',
        label: 'Cost Breakdown Report',
        icon: 'overview_icon',
        index: 2,
      },
      {
        link: '/reports/costcomparisonreport',
        label: 'Cost Comparison Report',
        icon: 'overview_icon',
        index: 2,
      },
      {
        link: '/reports/graphicalreport',
        label: 'Graphical Report',
        icon: 'overview_icon',
        index: 3,
      },
      {
        link: '/reports/detailedpartcostreport',
        label: 'Detailed Part Cost Report',
        icon: 'overview_icon',
        index: 4,
      },
      {
        link: '/reports/inputoutputanalysisreport',
        label: 'Input Output Analysis',
        icon: 'overview_icon',
        index: 5,
      },
      {
        link: '/reports/pcbareport',
        label: 'PCBA Report',
        icon: 'overview_icon',
        index: 6,
      },
      {
        link: '/reports/pcbreport',
        label: 'PCB Report',
        icon: 'overview_icon',
        index: 7,
      },
      {
        link: '/reports/gerber',
        label: 'Gerber Reader',
        icon: 'overview_icon',
        index: 8,
      },
      {
        link: '/reports/wireHarness',
        label: 'Wire Harness',
        icon: 'overview_icon',
        index: 9,
      },
      {
        link: '/reports/factpack',
        label: 'Fact Pack',
        icon: 'overview_icon',
        index: 10,
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
