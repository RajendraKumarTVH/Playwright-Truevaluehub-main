import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSidenavModule } from '@angular/material/sidenav';
import { Router, RouterModule } from '@angular/router';
import { SidenavToggleService } from 'src/app/shared/services';

@Component({
  selector: 'app-ai-search-page',
  templateUrl: './ai-search-page.component.html',
  styleUrls: ['./ai-search-page.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatSidenavModule, RouterModule],
})
export class AiSearchPageComponent implements OnInit {
  public isMenuOpen: boolean;
  public navLinks: any[];
  collapse = 70;
  expand = 160;
  contentMargin = this.expand;
  private activeLinkIndex = -1;
  constructor(
    private readonly router: Router,
    private readonly sidenavToggleService: SidenavToggleService
  ) {
    this.navLinks = [
      {
        link: '/ai-search/search-list',
        label: 'Document List',
        icon: 'overview_icon',
        index: 0,
      },
      {
        link: '/ai-search/search-new',
        label: 'Document List',
        icon: 'overview_icon',
        index: 0,
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
