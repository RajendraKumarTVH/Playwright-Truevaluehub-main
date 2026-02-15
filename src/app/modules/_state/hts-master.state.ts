import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { tap } from 'rxjs/operators';
import { HtsSectionDto, HtsChapterDto, HtsHeadingDto, HtsSubHeadingDto, HtsMasterDto } from 'src/app/shared/models/hts-master.model';
import { GetAllHtsMasterData } from '../_actions/master-data.action';
import { HtsMasterService } from 'src/app/shared/services/hts-master.service';
import { BlockUiService } from 'src/app/shared/services';

export class HtsMasterStateModel {
  HtsMasterData: {
    sections: HtsSectionDto[];
    chapters: HtsChapterDto[];
    headings: HtsHeadingDto[];
    subHeadings: HtsSubHeadingDto[];
  };
}

@State<HtsMasterStateModel>({
  name: 'HtsMaster',
  defaults: {
    HtsMasterData: {
      sections: [],
      chapters: [],
      headings: [],
      subHeadings: [],
    },
  },
})
@Injectable()
export class HtsMasterState {
  constructor(
    private _HtsMasterService: HtsMasterService,
    private _blockUiService: BlockUiService
  ) {}

  @Selector()
  static sections(state: HtsMasterStateModel) {
    return state.HtsMasterData.sections;
  }

  @Selector()
  static chapters(state: HtsMasterStateModel) {
    return state.HtsMasterData.chapters;
  }

  @Selector()
  static headings(state: HtsMasterStateModel) {
    return state.HtsMasterData.headings;
  }

  @Selector()
  static subHeadings(state: HtsMasterStateModel) {
    return state.HtsMasterData.subHeadings;
  }

  @Selector()
  static getAllHtsMasterData(state: HtsMasterStateModel) {
    return state.HtsMasterData;
  }

  @Action(GetAllHtsMasterData)
  getAllHtsMasterData(state: StateContext<HtsMasterStateModel>) {
    // this._blockUiService.pushBlockUI('getAllHtsMasterData');
    return this._HtsMasterService.getAllHtsMasterData().pipe(
      tap((result: HtsMasterDto) => {
        state.setState({
          HtsMasterData: {
            sections: result.sections,
            chapters: result.chapters,
            headings: result.headings,
            subHeadings: result.subHeadings,
          },
        });
        // this._blockUiService.popBlockUI('getAllHtsMasterData');
      })
    );
  }
}
