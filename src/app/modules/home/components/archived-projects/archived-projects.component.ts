import { Component, OnDestroy, OnInit } from '@angular/core';
import { BlockUiService, ProjectInfoService } from 'src/app/shared/services';
import { ProjectService } from '../../services/projects.service';
import { ProjectStatus } from 'src/app/shared/enums/project-status.enum';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ConfirmationDialogConfig, MessagingService } from 'src/app/messaging/messaging.service';
import { UserService } from 'src/app/modules/settings/Services/user.service';
import { UserInfoService } from 'src/app/shared/services/user-info-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-archived-projects',
  templateUrl: './archived-projects.component.html',
  styleUrls: ['./archived-projects.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIconModule],
})
export class ArchivedProjectsComponent implements OnInit, OnDestroy {
  public projects: any[];
  private unSubscribeAll$: Subject<undefined> = new Subject<undefined>();
  private users: any[] = [];

  constructor(
    private projectService: ProjectService,
    private projectInfoService: ProjectInfoService,
    private blockUiService: BlockUiService,
    private messaging: MessagingService,
    private userService: UserService,
    private userInfoService: UserInfoService
  ) {}

  ngOnInit(): void {
    this.blockUiService.pushBlockUI('getActiveProjectDetails');
    this.userInfoService.getUserValue().subscribe((user) => {
      const clientId = user?.clientId;
      if (clientId) {
        this.getClientUsers(clientId);
      }
      this.getArchiveProjects();
    });
  }

  getArchiveProjects() {
    this.projectService
      .getArchiveProjectDetails()
      .pipe(takeUntil(this.unSubscribeAll$))
      .subscribe({
        next: (result) => {
          this.blockUiService.popBlockUI('getActiveProjectDetails');
          this.projects = result;
        },
        error: (error) => {
          console.error(error);
        },
      });
  }

  public onRestoreEdit(projectInfoId: number) {
    if (projectInfoId) {
      this.projectInfoService.restoreProject(projectInfoId).subscribe(() => {
        this.projects = this.projects.filter((x) => x.projectInfoId != projectInfoId);
      });
    }
  }

  onDeleteClick(projectInfoId: number) {
    const dialogRef = this.messaging.openConfirmationDialog(<ConfirmationDialogConfig>{
      data: {
        title: 'Delete Confirmation',
        message: 'Do you want to delete project ?',
        action: 'CONFIRM',
        cancelText: 'CANCEL',
      },
    });
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.projectInfoService.deleteProject(projectInfoId).subscribe((x) => {
          if (x) {
            this.messaging.openSnackBar(`Project deleted successfully.`, '', {
              duration: 5000,
            });
            this.getArchiveProjects();
          }
        });
      }
    });
  }

  private getClientUsers(clientId: any) {
    this.userService.getUsersByClientId(clientId).subscribe((response) => {
      this.users = response;
    });
  }

  getUserName(userId: any) {
    const user: any = this.users.filter((x) => x.userId == userId);
    const name = user != undefined && user[0] != undefined ? user[0].firstName + ' ' + user[0].lastName : '';
    return name;
  }

  // public RedirectToCosting(_evt: any) {}

  projectStatusEnum(projectStatusId: number) {
    return ProjectStatus[Number(projectStatusId)];
  }

  public ngOnDestroy() {
    this.unSubscribeAll$.next(undefined);
    this.unSubscribeAll$.complete();
  }
}
