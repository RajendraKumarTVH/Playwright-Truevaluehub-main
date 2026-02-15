import { Routes } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';
import { AiSearchDocComponent } from './components/search-document/ai-search-doc/ai-search-doc.component';
import { AiSearchPageComponent } from './containers/ai-search/ai-search-page/ai-search-page.component';
import { GridViewComponent } from './components/search-list/ai-search-list-view/grid-view/grid-view.component';
import { TableViewComponent } from './components/search-list/ai-search-list-view/table-view/table-view.component';
import { AiSearchListViewComponent } from './components/search-list/ai-search-list-view/ai-search-list-view.component';
import { ColumnViewComponent } from './components/search-list/ai-search-list-view/column-view/column-view.component';

export const aiSearchRoutes: Routes = [
  {
    path: '',
    component: AiSearchPageComponent,
    children: [
      {
        path: '',
        redirectTo: 'search-list',
        pathMatch: 'full',
      },
      {
        path: 'search-doc',
        component: AiSearchDocComponent,
        canActivate: [MsalGuard],
      },
      {
        // parent container that includes header + left similarity panel + center outlet
        path: 'search-list',
        component: AiSearchListViewComponent,
        canActivate: [MsalGuard],
        children: [
          { path: '', redirectTo: 'grid', pathMatch: 'full' },
          { path: 'grid', component: GridViewComponent, canActivate: [MsalGuard] },
          { path: 'table', component: TableViewComponent, canActivate: [MsalGuard] },
          { path: 'column', component: ColumnViewComponent, canActivate: [MsalGuard] },
        ],
      },
    ],
  },
];
