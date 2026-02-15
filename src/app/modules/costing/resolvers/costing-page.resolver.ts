import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
// import { finalize } from 'rxjs/operators';
import { ProjectInfoDto } from 'src/app/shared/models';
import { ProjectInfoService } from 'src/app/shared/services';

export const CostingPageResolver: ResolveFn<ProjectInfoDto[]> = () => {
  const projectInfoService = inject(ProjectInfoService);
  // const blockUiService = inject(BlockUiService);

  // blockUiService.pushBlockUI('projectInfoList');
  return projectInfoService.getAllProjectInfo(1, 1, true); //.pipe(finalize(() => blockUiService.popBlockUI('projectInfoList')));
};
