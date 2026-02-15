import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { PermissionService } from '../../services/permission.service';
import { SecurityPermissionType } from '../../enums/security-permission-type.enum';
import { AppConfigurationService } from '../../services/app-configuration.service';

@Component({
  selector: 'app-nav-left-menu',
  templateUrl: './nav-left-menu.component.html',
  styleUrls: ['./nav-left-menu.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIconModule, MatTooltipModule, MatButtonModule, RouterModule],
})
export class NavLeftMenuComponent implements OnInit {
  isSupplierRole: boolean = false;
  isCollapsed = false;
  isProduction: boolean = false;
  private permissionService = inject(PermissionService);
  permissionMap: Map<string, boolean> = new Map([
    ['home', false],
    ['overview', false],
    ['projects', false],
    ['create', false],
    ['costing', false],
    ['ai-search', false],
    ['analytics', false],
    ['reports', false],
    ['collaborate', false],
    ['digitalFactory', false],
    ['database', false],
    ['archive', false],
  ]);

  canLoadCreateProjectModule: boolean = false;
  canLoadOverviewReportsModule: boolean = false;
  canLoadAiModule: boolean = false;
  canLoadDigitalFactoryModule: boolean = false;
  canLoadSettingsModule: boolean = false;
  canLoadAnalyticsModule: boolean = false;
  canLoadSupplierModule: boolean = false;
  canLoadCostingModule: boolean = false;

  @Output() collapseChange = new EventEmitter<boolean>();
  permissionModules: string[] = [];
  constructor(protected appConfigurationService: AppConfigurationService) {
    this.isProduction = this.appConfigurationService.configuration.isProduction == 'true' ? true : false;
  }
  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
    this.collapseChange.emit(this.isCollapsed); // Emit the new state to the parent
  }
  ngOnInit(): void {
    this.permissionService.isPermissionsMapUpdated().subscribe((update) => {
      if (update) {
        const permissionChecks = {
          canLoadCreateProjectModule: SecurityPermissionType.ProjectModule,
          canLoadOverviewReportsModule: SecurityPermissionType.ReportsModule,
          canLoadAiModule: SecurityPermissionType.AIModule,
          canLoadDigitalFactoryModule: SecurityPermissionType.DFModule,
          canLoadAnalyticsModule: SecurityPermissionType.AnalyticsModule,
          canLoadSettingsModule: [SecurityPermissionType.CustomerModule, SecurityPermissionType.UserModule],
          canLoadSupplierModule: SecurityPermissionType.SupplierModule,
          canLoadCostingModule: SecurityPermissionType.CostingModule,
        };

        for (const [key, permission] of Object.entries(permissionChecks)) {
          (this as any)[key] = this.permissionService.hasPermission(permission);
        }
      }
    });
  }
}
