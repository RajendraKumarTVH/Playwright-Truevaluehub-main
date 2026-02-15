import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-home-projects',
  templateUrl: './home-projects.component.html',
  styleUrls: ['./home-projects.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIconModule, MatTabsModule, MatButtonModule, RouterModule],
})
export class HomeProjectsComponent implements OnInit {
  public navLinks: any[];
  private activeLinkIndex = -1;

  constructor(private router: Router) {
    this.navLinks = [
      {
        link: '/home/projects/active',
        label: 'Active',
        index: 0,
      },
      {
        link: '/home/projects/archive',
        label: 'Archive',
        index: 1,
      },
    ];
  }

  ngOnInit(): void {
    this.router.events.subscribe(() => {
      this.activeLinkIndex = this.navLinks.indexOf(this.navLinks.find((tab) => tab.link === this.router.url));
    });
  }

  public onCreateNewProject(): void {
    this.router.navigate(['/home/project/create']);
  }
}
