import { Component, Inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { homeEndpoints } from '../../home.endpoints';
import { tvhAzureBlobUrlToken } from 'src/app/app.token';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-home-create-project',
  templateUrl: './home-create-project.component.html',
  styleUrls: ['./home-create-project.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatTabsModule, MatButtonModule, RouterModule, MatIconModule],
})
export class HomeCreateProjectComponent implements OnInit {
  public navLinks: any[];
  private activeLinkIndex = -1;
  public isFirstTab: boolean = false;
  private readonly tvhAzureBlobUrl: string;
  constructor(
    private router: Router,
    @Inject(tvhAzureBlobUrlToken) tvhAzureBlobUrl: string
  ) {
    this.tvhAzureBlobUrl = tvhAzureBlobUrl;
    this.navLinks = [
      {
        link: '/home/project/create',
        label: 'Create New Project',
        index: 0,
      },
      {
        link: '/home/project/draft-list',
        label: 'Drafts',
        index: 1,
      },
    ];
  }

  ngOnInit(): void {
    this.router.events.subscribe(() => {
      this.activeLinkIndex = this.navLinks.indexOf(this.navLinks.find((tab) => tab.link === this.router.url));
      this.isFirstTab = this.activeLinkIndex === 0;
    });
    // Set the initial state of isFirstTab
    const activeLinkIndex = this.navLinks.findIndex((tab) => tab.link === this.router.url);
    this.isFirstTab = activeLinkIndex === 0;
  }

  downloadMyFile() {
    const link = document.createElement('a');
    link.setAttribute('target', '_blank');

    link.setAttribute('href', homeEndpoints.bomTemplateDownload(this.tvhAzureBlobUrl));
    link.setAttribute('download', `bom_template.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
}
