export class ProjectInfoModel {
  id!: number;
  project_id!: string;
  project_desc!: string;
  created_by!: string;
  company_id!: string;
  create_date!: Date;
  last_modified_date!: Date;
  last_Modified_by!: string;
  project_status!: string;
  current_spend!: string;
  should_cost_spend!: string;
  opportunity_identified!: string;
  opportunity_implemented!: string;
  is_archived!: boolean;
}

export class CreateProjectInfo {
  projectNumber!: string;
  projectDescription!: string;
  projectStatus!: string;
  bomData: BomUploadDataModel[] = [];
}

export class BomUploadDataModel {
  level!: number;
  partNumber!: string;
  partDescription!: string;
  partQty!: string;
  unitOfMeasure!: string;
  projectId!: string;
}
