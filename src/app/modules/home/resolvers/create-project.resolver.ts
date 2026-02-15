import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { ProjectInfoDto } from 'src/app/shared/models';
import { ProjectInfoService } from 'src/app/shared/services';

export const CreateProjectResolver: ResolveFn<ProjectInfoDto> = (route) => {
  const projectInfoService = inject(ProjectInfoService);
  const projectId: number = +(route.paramMap.get('projectId') || 0);

  return projectInfoService.getProjectDetailsById(projectId);
};
