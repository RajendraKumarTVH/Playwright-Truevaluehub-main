import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RoleModel, UserModel } from '../../models';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { UserService } from '../../Services/user.service';
import { UserInfoService } from 'src/app/shared/services/user-info-service';
import { Subject, takeUntil } from 'rxjs';
import { BlockUiService } from 'src/app/shared/services/block-ui.service';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TableModule],
})
export class UserManagementComponent implements OnInit, OnDestroy {
  @Output() userEdit = new EventEmitter<UserModel>();
  users: UserModel[] = [];
  filteredUsers: UserModel[] = [];
  searchTerm: string = '';
  private unsubscribe$: Subject<undefined> = new Subject<undefined>();

  roles: { title: string; value: string }[] = [];

  constructor(
    private readonly userService: UserService,
    private readonly userInfoService: UserInfoService,
    private blockUiService: BlockUiService
  ) {}

  ngOnInit(): void {
    this.handleSubscriptions();
    this.getClientUsers();
    this.getRoles();
  }

  ngOnDestroy() {
    this.unsubscribe$.next(undefined);
    this.unsubscribe$.complete();
  }

  onUserEditClick(user: UserModel): void {
    this.userEdit.emit(user);
  }

  onUserDeleteClick(user: UserModel): void {
    this.blockUiService.pushBlockUI('onUserDeleteClick');
    this.userService
      .deleteUser(user)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        () => {
          const deletedUser = this.users.find((u) => u.userId === user.userId);
          if (deletedUser) {
            deletedUser.status = false;
          }
          this.filteredUsers = [...this.users];
          this.blockUiService.popBlockUI('onUserDeleteClick');
          this.getClientUsers();
          console.log('User marked as inactive');
        },
        (error) => {
          this.blockUiService.popBlockUI('onUserDeleteClick');
          console.error('Error deleting user:', error);
          alert('Failed to delete user');
        }
      );
  }

  private getRoles(): void {
    this.blockUiService.pushBlockUI('getRoles');
    this.userService
      .getRoles()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (roles: RoleModel[]) => {
          this.roles = roles.map((role) => ({
            title: role.roleName,
            value: role.roleId.toString(),
          }));

          this.getClientUsers();
          this.blockUiService.popBlockUI('getRoles');
        },
        (error) => {
          console.error('Error fetching roles:', error);
          this.blockUiService.popBlockUI('getRoles');
        }
      );
  }

  onSearchChange(): void {
    this.filteredUsers = this.users.filter((user) => user.userName.toLowerCase().includes(this.searchTerm.toLowerCase()));
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filteredUsers = [...this.users];
  }
  private getClientUsers() {
    this.blockUiService.pushBlockUI('getClientUsers');
    this.userInfoService
      .getUserValue()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((user) => {
        const userInfo = { ...user };
        if (userInfo?.clientId) {
          this.userService
            .getUsersByClientId(userInfo.clientId)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((response) => {
              this.users = response;
              this.filteredUsers = this.users;
              this.blockUiService.popBlockUI('getClientUsers');
            });
        }
      });
  }
  private handleSubscriptions() {
    this.userInfoService.userInfoUpdatedSubject.pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: (updatedUser: UserModel) => {
        const existingUser = this.users?.find((x) => x.userId === updatedUser.userId);

        if (existingUser) {
          Object.assign(existingUser, updatedUser);
          const newRole = this.roles.find((x) => x.value.toString() === updatedUser.roleId.toString());

          if (newRole) {
            if (!existingUser.role) {
              existingUser.role = {} as RoleModel;
            }
            existingUser.role.roleName = newRole.title;
          }
        } else {
          this.users.push(updatedUser);
        }
        this.filteredUsers = [...this.users];
      },
    });
  }
}
