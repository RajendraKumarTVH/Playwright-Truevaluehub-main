import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { SearchBarModelDto } from 'src/app/shared/models/search-bar-model';
import { AiSearchListTileDto } from '../models/ai-image-similarity-result';

@Injectable({
  providedIn: 'root',
})
export class AiSearchHelperService {
  readonly $filterChanged = new Subject<SearchBarModelDto[]>();
  readonly $similaritySearchApplied = new Subject<AiSearchListTileDto>();
  readonly $similaritySearchClosed = new Subject<void>();
  readonly $imageUploadSearch = new Subject<FileList>();
  readonly $viewModeChanged = new Subject<'grid' | 'column' | 'table' | 'chart'>();
}
