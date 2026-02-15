import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { ProjectStatus } from 'src/app/shared/enums';
import { ProjectInfoDto } from 'src/app/shared/models';
import { BlockUiService } from 'src/app/shared/services';
import { SearchDataModel, SearchTextLinkModel, SearchTextViewModel } from '../../models';
import { SearchTextService } from '../../services';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SearchTextComponent } from '../../components';

@Component({
  selector: 'app-search-shell-page',
  templateUrl: './search-shell-page.component.html',
  styleUrls: ['./search-shell-page.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SearchTextComponent],
})
export class SearchShellPageComponent implements OnInit, OnDestroy {
  public searchText: string;
  public searchViewList: SearchTextViewModel[] = [];
  private unSubscribeAll$: Subject<undefined> = new Subject<undefined>();
  constructor(
    private searchTextService: SearchTextService,
    private route: ActivatedRoute,
    private router: Router,
    private blockUiService: BlockUiService
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.pipe(takeUntil(this.unSubscribeAll$)).subscribe((x) => {
      this.searchText = x.get('text') || '';
      this.searchText = this.searchText.trim();
      if (this.searchText) {
        this.getSearchDataByText();
      }
    });
  }

  private getSearchDataByText() {
    this.blockUiService.pushBlockUI('getSearchDataByText');
    this.searchTextService
      .getSearchDataByText(this.searchText)
      .pipe(
        takeUntil(this.unSubscribeAll$),
        tap((data: SearchDataModel) => {
          this.blockUiService.popBlockUI('getSearchDataByText');
          this.searchViewList = [];
          if (data) {
            if (data.projectInfoList && data.projectInfoList.length > 0) {
              const obj = new SearchTextViewModel();
              obj.category = 'Projects';
              obj.matchesCount = data.projectInfoList.length;
              obj.searchText = this.searchText.trim();

              obj.textLink = data.projectInfoList.map((x) => {
                const model = new SearchTextLinkModel();
                model.name = x.projectName || '';
                model.url = this.getProjectUrl(x);
                return model;
              });
              this.searchViewList.push(obj);
            }

            if (data.partInfoList && data.partInfoList.length > 0) {
              const obj = new SearchTextViewModel();
              obj.category = 'Parts';
              obj.matchesCount = data.partInfoList.length;
              obj.searchText = this.searchText.trim();

              obj.textLink = data.partInfoList.map((x) => {
                const model = new SearchTextLinkModel();
                model.name = x.intPartNumber || '';
                model.url = `costing/${x.projectInfoId}`;
                model.state = {
                  partInfoId: x.partInfoId,
                  partQty: x.billOfMaterialPartInfos?.find((y) => y.partInfoId == x.partInfoId)?.partQty || 0,
                };

                return model;
              });
              this.searchViewList.push(obj);
            }
          }
        })
      )
      .subscribe();
  }

  private getProjectUrl(projectInfo: ProjectInfoDto) {
    let result = '';
    switch (projectInfo.projectStatusId) {
      case ProjectStatus.Draft:
        result = `home/project/edit/${projectInfo.projectInfoId}`;
        break;
      case ProjectStatus.Costing:
        result = `costing/${projectInfo.projectInfoId}`;
        break;
      default:
        result = `costing/${projectInfo.projectInfoId}`;
        break;
    }
    if (projectInfo.isArchived) {
      result = 'home/projects/archive';
    }

    return result;
  }

  public onSelecLink(obj: SearchTextLinkModel) {
    if (obj.state) {
      const extras: NavigationExtras = {
        state: obj.state,
      };

      this.router.navigate([obj.url], extras);
    } else {
      this.router.navigate([obj.url]);
    }
  }

  ngOnDestroy() {
    this.unSubscribeAll$.next(undefined);
    this.unSubscribeAll$.complete();
  }
}
