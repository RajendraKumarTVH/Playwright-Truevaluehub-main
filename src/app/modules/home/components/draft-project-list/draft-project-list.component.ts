import { Component, EventEmitter, Output } from '@angular/core';
import { ProjectInfoDto } from 'src/app/shared/models';
import { BlockUiService, ProjectInfoService } from 'src/app/shared/services';
import * as _ from 'lodash';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-draft-project-list',
  templateUrl: './draft-project-list.component.html',
  styleUrls: ['./draft-project-list.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIconModule, RouterModule],
})
export class DraftProjectListComponent {
  @Output() passId = new EventEmitter();
  projects: ProjectInfoDto[] = [];

  constructor(
    private projectInfoService: ProjectInfoService,
    private blockUiService: BlockUiService
  ) {
    this.blockUiService.pushBlockUI('getDraftProjectDetails');
    this.projectInfoService.getDraftProjectDetails().subscribe((result) => {
      this.blockUiService.popBlockUI('getDraftProjectDetails');
      if (result && result.length > 0) {
        this.projects = result;
        this.projects = _.orderBy(result, 'projectInfoId', 'desc');
      }
    });
  }
}
