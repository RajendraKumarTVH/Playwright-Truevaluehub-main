import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserInfoService } from 'src/app/shared/services/user-info-service';
import { UserModel, UserRoleTypeEnum } from '../../models';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class UserComponent implements OnInit {
  user: UserModel = null;

  constructor(private userInfoSvc: UserInfoService) {}

  ngOnInit(): void {
    this.getuser();
  }

  getUserRoleByid(role: number) {
    let str = '';
    switch (role) {
      case 1:
        str = UserRoleTypeEnum.Admin;
        break;
      case 2:
        str = UserRoleTypeEnum.Costing;
        break;
      case 3:
        str = UserRoleTypeEnum.Sourcing;
        break;
      case 4:
        str = UserRoleTypeEnum.Executive;
        break;
      case 5:
        str = UserRoleTypeEnum.Supplier;
        break;
    }
    return str;
  }

  private getuser() {
    this.userInfoSvc.getUserValue().subscribe((user) => {
      this.user = user;
    });
  }
}
