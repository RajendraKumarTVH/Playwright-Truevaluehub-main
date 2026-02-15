import { ProjectStatus } from '../enums/project-status.enum';
import { PartDetailsByProjectDto } from './partdetails_byproject.model';
import { PartInfoDto } from './part-info.model';
import { ProjectUserDto } from 'src/app/modules/settings/models';
export class ProjectInfoDto {
  projectInfoId: number;
  projectName?: string;
  projectDesc?: string;
  tag?: string;
  marketQuarter: string;
  projectStatusId: ProjectStatus;
  currentSpend: number;
  shouldCostSpend: number;
  opportunityIdentified: number;
  opportunityImplemented: number;
  isArchived: boolean;
  createDate: Date;
  createdUserId: number;
  isRefreshRequired: boolean;
  partInfoList: PartInfoDto[];
  failedDocs: string[];
  totalPercentage: number;
  failedExtractionDoc: string;
  showInnerTable: boolean = false;
  marketMonth?: string = null;
  partDetailsByProjectDto: PartDetailsByProjectDto[];
  projectUserDtos: ProjectUserDto[];
  groupName?: string = null;
  lastModifiedDate?: Date;
  lastModifiedUserId?: number;
}

export interface FileSystemEntry {
  isFile: boolean;
  isDirectory: boolean;
  name: string;
  fullPath: string;
  filesystem: any;
}

export interface FileEntry extends FileSystemEntry {
  file: (successCallback: (file: File) => void, errorCallback?: (err: any) => void) => void;
}

export interface FileSystemDirectoryEntry extends FileSystemEntry {
  createReader: () => FileSystemDirectoryReader;
}

export interface FileSystemDirectoryReader {
  readEntries: (successCallback: (entries: FileSystemEntry[]) => void, errorCallback?: (err: any) => void) => void;
}

export function isFileEntry(entry: FileSystemEntry): entry is FileEntry {
  return typeof (entry as any).file === 'function';
}
