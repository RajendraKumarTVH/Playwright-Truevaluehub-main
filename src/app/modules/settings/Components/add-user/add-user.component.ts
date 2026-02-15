import { Component, ElementRef, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { AbstractControl, FormBuilder, FormsModule, ReactiveFormsModule, ValidationErrors, Validators, ValidatorFn } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MessagingService } from 'src/app/messaging/messaging.service';
import { UserInfoService } from 'src/app/shared/services/user-info-service';
import { UserModel, UpdateUserRequest, ClientGroupModel } from '../../models';
import { UserService } from '../../Services/user.service';
import { BlockUiService } from './../../../../shared/services/block-ui.service';
import { ImageCompressionService } from '../../../../services/image-compression-service/image-compression-service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { PermissionService } from 'src/app/shared/services/permission.service';
import { SecurityPermissionType } from 'src/app/shared/enums/security-permission-type.enum';
import { UserManagementComponent } from '../user-management/user-management.component';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatCardModule, MatIconModule, UserManagementComponent],
})
export class AddUserComponent implements OnInit, OnDestroy {
  selectedFile: File;
  userForm = this._fb.nonNullable.group({
    id: [0],
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    middleName: ['', Validators.maxLength(100)],
    lastName: ['', [Validators.required, Validators.maxLength(100)]],
    userName: ['', [Validators.required, Validators.maxLength(50)]],
    email: ['', [Validators.required, Validators.email, Validators.pattern('^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,4}$'), Validators.maxLength(100)]],
    phone: ['', Validators.maxLength(20)],
    title: [''],
    role: ['', [Validators.required]],
    clientGroup: [''],
    status: [1],
    clientid: [0],
    imageContent: [''],
    userType: [1],
    clientName: '',
    isInternalUser: [false],
  });
  public model: UserModel;
  @ViewChild('fileInput') fileInput: ElementRef<any>;
  userNames: string[] = [];
  existingFullNames: string[] = [];
  existingEmails: string[] = [];
  userId: number = 0;
  url: any;
  clientId: number;
  currentUser: any;
  isAddUser: boolean;
  isMyAccount: boolean = true;
  isInvalid: boolean;
  private unsubscribeAll$: Subject<undefined> = new Subject<undefined>();
  imageContent?: string;
  newImageFileName?: string;
  sub: Subscription | undefined;
  canAddUser: boolean = false;
  clientGroups: ClientGroupModel[] = [];

  roles: { title: string; value: string }[] = [];
  titles = [
    { title: 'Mr.', value: 'Mr.' },
    { title: 'Ms.', value: 'Ms.' },
    { title: 'Miss', value: 'Miss.' },
  ];
  get f() {
    return this.userForm.controls;
  }

  constructor(
    private _fb: FormBuilder,
    private messaging: MessagingService,
    private userService: UserService,
    private userInfoService: UserInfoService,
    private blockUiService: BlockUiService,
    private imageCompressionService: ImageCompressionService,
    private permissionService: PermissionService
  ) {}

  validateUserNames(userNames: string[]) {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!this.isAddUser || !control.value || userNames.length === 0) {
        return null;
      }
      const existingUser = userNames.find((x) => x.toLowerCase() === control.value.toLowerCase());
      return existingUser ? { validateUserNames: existingUser } : null;
    };
  }

  validateEmails(emails: string[]) {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!this.isAddUser || !control.value || emails.length === 0) {
        return null;
      }
      const existing = emails.find((x) => x.toLowerCase() === control.value.toLowerCase());
      return existing ? { validateEmails: existing } : null;
    };
  }

  validateFullName(fullNames: string[]): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      if (!this.isAddUser || fullNames.length === 0) {
        return null;
      }
      const first = group.get('firstName')?.value;
      const last = group.get('lastName')?.value;
      if (!first || !last) {
        return null;
      }
      const combined = (first + ' ' + last).toLowerCase();
      const existing = fullNames.find((x) => x.toLowerCase() === combined);
      return existing ? { validateFullName: existing } : null;
    };
  }

  ngOnInit(): void {
    // this.isMyAccount = true;
    this.userInfoService.getUserValue().subscribe((user) => {
      if (user) {
        this.clientId = user?.client?.clientId;
        this.currentUser = user;
        this.setForm(user);
        this.imageContent = user?.imageContent;
        this.getRoles();
        if (this.clientId) {
          this.userService.getUsersByClientId(this.clientId).subscribe((users) => {
            this.existingFullNames = users.map((u: any) => `${u.firstName || ''} ${u.lastName || ''}`.trim());
            this.existingEmails = users.map((u: any) => (u.email || '').toLowerCase());
            this.f?.email?.addValidators([this.validateEmails(this.existingEmails)]);
            this.f?.email?.updateValueAndValidity();
            this.userForm.addValidators(this.validateFullName(this.existingFullNames));
            this.userForm.updateValueAndValidity();
          });
        }
      }
    });
    this.userService.getAllUserNames().subscribe((users) => {
      this.userNames = users;
      this.userForm?.statusChanges?.pipe(takeUntil(this.unsubscribeAll$)).subscribe((status) => {
        this.isInvalid = status == 'INVALID';
      });
    });
    this.userForm
      .get('firstName')
      ?.valueChanges?.pipe(takeUntil(this.unsubscribeAll$))
      .subscribe(() => {
        this.userForm.updateValueAndValidity({ onlySelf: false, emitEvent: false });
      });
    this.userForm
      .get('lastName')
      ?.valueChanges?.pipe(takeUntil(this.unsubscribeAll$))
      .subscribe(() => {
        this.userForm.updateValueAndValidity({ onlySelf: false, emitEvent: false });
      });
    this.userInfoService.getClientGroupsValue().subscribe((clientGroups) => {
      this.clientGroups = clientGroups;
      this.userForm?.statusChanges?.pipe(takeUntil(this.unsubscribeAll$)).subscribe((status) => {
        this.isInvalid = status == 'INVALID';
      });
    });
    this.setUserClaims();
  }

  setUserClaims() {
    const canAddUserPermissions = [SecurityPermissionType.UserWrite, SecurityPermissionType.All];
    this.canAddUser = this.permissionService.hasPermission(canAddUserPermissions);
  }

  ngOnDestroy(): void {
    this.unsubscribeAll$.next(undefined);
    this.unsubscribeAll$.complete();
    if (this.sub) {
      this.sub!.unsubscribe();
    }
  }

  onFormSubmit() {
    if (this.userForm.valid) {
      const model = new UserModel();
      model.id = this.f?.id?.value || 0;
      model.firstName = this.f?.firstName?.value || '';
      model.middleName = this.f?.middleName?.value || '';
      model.lastName = this.f?.lastName?.value || '';
      model.email = this.f?.email?.value || '';
      model.phoneNumber = this.f?.phone?.value?.toString() || '';
      model.title = this.f?.title?.value || '';
      model.roleId = +this.f?.role?.value || 1;
      model.userType = this.f?.userType?.value || 1;
      model.status = this.f?.status?.value == 1 ? true : false;
      model.userName = this.f?.userName?.value || '';
      model.clientId = this.clientId;
      model.clientGroupId = Number(this.f?.clientGroup?.value) || null;
      model.imageContent = this.imageContent;
      model.isInternalUser = this.f.isInternalUser.value === true;

      this.blockUiService.pushBlockUI('saveuser');

      if (model.id > 0) {
        const modelUpdate = new UpdateUserRequest();
        modelUpdate.userId = model.id;
        modelUpdate.roleId = model.roleId;
        modelUpdate.middleName = model.middleName;
        modelUpdate.phoneNumber = model.phoneNumber;
        modelUpdate.title = model.title;
        modelUpdate.imageContent = this.imageContent;
        modelUpdate.clientGroupId = model.clientGroupId;

        this.userService.updateUser(modelUpdate).subscribe((result) => {
          this.blockUiService.popBlockUI('saveuser');
          if (result) {
            //this.userForm.reset();
            this.userInfoService.userInfoUpdatedSubject.next(result);
            this.messaging.openSnackBar(`User update Successfully.`, '', {
              duration: 5000,
            });
            this.userForm.reset();
            this.userForm.enable();
          }
        });
      } else {
        this.userService.saveUser(model).subscribe((result) => {
          if (result) {
            this.userInfoService.userInfoUpdatedSubject.next(result);
            this.blockUiService.popBlockUI('saveuser');
            this.userForm.reset();
            this.messaging.openSnackBar(`User Created Successfully.`, '', {
              duration: 5000,
            });
          }
        });
      }
    }
  }

  addUser() {
    this.isAddUser = true;
    this.isMyAccount = false;
    this.userForm.reset();
    this.userForm.controls['email'].enable();
    this.userForm.controls['userName'].enable();
    this.userForm.controls['role'].enable();
    this.userForm.controls['firstName'].enable();
    this.userForm.controls['lastName'].enable();
    this.f?.userName?.addValidators([this.validateUserNames(this.userNames)]);
    this.f?.userName?.updateValueAndValidity();
    const attachValidators = () => {
      this.f?.email?.addValidators([this.validateEmails(this.existingEmails)]);
      this.f?.email?.updateValueAndValidity();
      this.userForm.addValidators(this.validateFullName(this.existingFullNames));
      this.userForm.updateValueAndValidity();
    };

    if (!this.existingFullNames.length && this.clientId) {
      this.userService.getUsersByClientId(this.clientId).subscribe((users) => {
        this.existingFullNames = users.map((u: any) => `${u.firstName || ''} ${u.lastName || ''}`.trim());
        this.existingEmails = users.map((u: any) => (u.email || '').toLowerCase());
        attachValidators();
      });
    } else {
      attachValidators();
    }
  }

  // myAccount() {
  //   this.isAddUser = false;
  //   this.isMyAccount = true;
  //   this.setForm(this.currentUser);
  // }

  // onUpload(event: any) {
  //   const reader = new FileReader();
  //   reader.readAsDataURL(event.target.files[0]);

  //   reader.onload = (_event) => {
  //     this.url = reader.result;
  //   };

  //   // this.uploadForm(files);
  // }

  userEditClick(event: UserModel) {
    this.setForm(event);
  }

  onRevert() {
    this.setForm(this.currentUser);
  }

  private setForm(objuser: UserModel) {
    if (objuser) {
      this.userForm?.patchValue({
        firstName: objuser.firstName,
        middleName: objuser.middleName,
        lastName: objuser.lastName,
        email: objuser.email,
        phone: objuser.phoneNumber,
        title: objuser.title,
        role: objuser.roleId.toString(),
        userType: objuser.userType,
        status: objuser.status ? 1 : 0,
        userName: objuser.userName,
        id: objuser.userId,
        clientid: objuser.clientId,
        clientName: objuser.client?.clientName,
        imageContent: objuser.imageContent,
        isInternalUser: objuser.isInternalUser,
      });
      this.userForm?.controls['email'].disable();
      this.userForm?.controls['userName'].disable();
      // this.userForm?.controls['role'].disable();
      this.userForm?.controls['firstName'].disable();
      this.userForm?.controls['lastName'].disable();
    }
  }
  private uploadForm(files: FileList) {
    if (files?.length > 0) {
      const formData = new FormData();

      for (let i = 0; i < files.length; i++) {
        const file = files[i] as File;
        formData.append('formFile', file, file.name);
      }
    }
  }

  private getRoles(): void {
    this.userService
      .getRoles()
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe(
        (roles) => {
          this.roles = roles.map((role) => ({
            title: role.roleName,
            value: role.roleId.toString(),
          }));
        },
        (error) => {
          console.error('Error fetching roles:', error);
        }
      );
  }

  onUpload(event: any) {
    this.selectedFile = event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(event.target.files[0]);
    reader.onload = async (_event: any) => {
      this.imageContent = await this.imageCompressionService.compressImageFile(_event.target?.result);
      this.newImageFileName = this.selectedFile.name;
    };
  }
  onUserDeleted(userId: number) {
    if (this.userForm.value.id === userId) {
      this.clearFormFields();
    }
  }

  private clearFormFields() {
    this.userForm.reset({
      id: 0,
      firstName: '',
      middleName: '',
      lastName: '',
      userName: '',
      email: '',
      phone: '',
      title: '',
      role: '',
      clientGroup: '',
      status: 1,
      clientid: this.clientId || 0,
      imageContent: '',
      userType: 1,
      clientName: '',
      isInternalUser: false,
    });
    this.userForm.enable();
    this.imageContent = '';
    this.selectedFile = undefined;
    this.newImageFileName = '';
  }
}
