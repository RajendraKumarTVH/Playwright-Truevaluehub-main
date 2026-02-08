import cadex from '@cadexchanger/web-toolkit';
import { fetchFile } from './helpers';
import { environment } from 'src/environments/environment';
// import { Select } from '@ngxs/store';
import { Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UserState } from 'src/app/modules/_state/user.state';

export interface ModelInfo {
  modelName: string;
  path: string;
  filename: string;
  hasPMI?: boolean;
  hasDrawing?: boolean;
  bimModel?: boolean;
  mainPartId?: string;
  comparePartId?: string;
}

interface ExampleViewer {
  loadAndDisplayModel(theModelInfo: ModelInfo, dataProvider: cadex.ModelData_ExternalDataProvider): Promise<unknown>;
}

export class BaseExample {
  userData: any;
  userData$: Observable<{ [key: string]: any }>;
  private unsubscribe$: Subject<undefined> = new Subject<undefined>();

  // @Select(UserState.getUser) userData$: Observable<{ [key: string]: any }>;

  constructor(
    public viewer: ExampleViewer,
    private _store: Store
  ) {
    this.userData$ = this._store.select(UserState.getUser);
    this.userData$.pipe(takeUntil(this.unsubscribe$)).subscribe((result) => {
      this.userData = result;
    });
  }

  //ExpCustom - Customized for the project requirements

  // protected modelUrl(theModelPath: string): string {
  //   return '/assets/models/' + theModelPath;
  // }

  /**
   * Fetches list of models.
   */
  // async getModelList(): Promise<Array<ModelInfo>> {
  //   const aRes = await fetch(this.modelUrl('models.json'));
  //   return await aRes.json();
  // }

  /**
   * Initializes model selector.
   */
  async initModelSelector(
    theModelname: string,
    partData?: any,
    filter?: any,
    isCompareModal?: boolean,
    mainPartId?: string,
    comparePartId?: string
    // filter?: (arg: ModelInfo) => boolean,
    // theModelSelector = document.querySelector<HTMLSelectElement>('#model-selector select')
  ) {
    const theModel: ModelInfo = {
      modelName: theModelname,
      path: theModelname,
      filename: 'scenegraph.cdxfb',
      hasPMI: true,
    };
    if (isCompareModal) {
      const compareModel: ModelInfo = {
        modelName: 'ConvertedModel.cdxfb',
        filename: 'ConvertedModel.cdxfb',
        path: 'ConvertedModel.cdxfb',
        hasPMI: true,
        mainPartId: mainPartId,
        comparePartId: comparePartId,
      };
      this.onCompareModelChanged(compareModel);
      return;
    } else if (partData?.caller === 'material' && partData?.commodityId === 3) {
      // Casting
      theModel.filename = 'CoreExtractedModel.cdxfb';
    } else if (partData?.caller === 'manufacturing' && [3, 4].includes(partData?.commodityId)) {
      // Stock machining
      theModel.filename = 'CNCPlaneModel.cdxfb';
    } else if (partData?.caller === 'manufacturing' && partData?.commodityId === 5) {
      // Metal forming - forging
      theModel.filename = 'FSimplifiedModel.cdxfb';
    }
    this.onModelChanged(theModel);

    // let aModelsInfo = await this.getModelList();

    // if (filter) {
    //   aModelsInfo = aModelsInfo.filter(filter);
    // }

    // const aQueryModelName = new URLSearchParams(window.location.search).get('model');
    // if (aQueryModelName) {
    //   const aSelectedModelIndex = aModelsInfo.findIndex((info) => info.modelName === aQueryModelName);
    //   if (aSelectedModelIndex === -1) {
    //     // redirect to example with default settings
    //     window.location.href = window.location.origin + window.location.pathname;
    //   } else {
    //     this.onModelChanged(aModelsInfo[aSelectedModelIndex]);
    //   }
    //   return;
    // }

    // if (!theModelSelector) {
    //   return;
    // }

    // aModelsInfo.forEach(info => {
    //   const anOption = document.createElement('option');
    //   anOption.text = info.modelName;
    //   theModelSelector.add(anOption);
    // });

    /* Possible fix for extra-width of options panel: */
    /* const options = document.querySelectorAll('option');
    options.forEach(option => {
      if(option.textContent.length > 30) {
        option.textContent = option.textContent.substring(0, 30) + '...';
      }
    }); */

    // let aSelectedModelIndex = aModelsInfo.findIndex((modelInfo) => modelInfo.modelName === theDefaultModelName);
    // if (aSelectedModelIndex === -1) {
    //   aSelectedModelIndex = 0;
    // }
    // theModelSelector.selectedIndex = aSelectedModelIndex;

    // const onchange = () => {
    //   const anInfo = aModelsInfo[theModelSelector.selectedIndex];
    //   if (anInfo) {
    //     this.onModelChanged(anInfo);
    //   }
    // };
    // theModelSelector.onchange = onchange;
    // onchange();
  }

  async onModelChanged(theModelInfo: ModelInfo) {
    try {
      // Provider for external files of the model
      const dataLoader: cadex.ModelData_ExternalDataProvider = (externalFileName, progressScope) => {
        // return fetchFile(this.modelUrl(theModelInfo.path) + '/' + externalFileName, progressScope);
        const endpoint = `${environment.apiUrl}/api/costing/CadExtractor/${encodeURIComponent(theModelInfo.modelName)}/Model/${encodeURIComponent(externalFileName)}`;
        return fetchFile(endpoint, progressScope, this.userData);
      };

      await this.viewer.loadAndDisplayModel(theModelInfo, dataLoader);
    } catch (theErr) {
      console.error(`Unable to load and display model "${theModelInfo.modelName}"`, theErr);
    }
  }

  async onCompareModelChanged(compareModel: ModelInfo) {
    try {
      // Provider for external files of the model
      const dataLoader: cadex.ModelData_ExternalDataProvider = (externalFileName, progressScope) => {
        const relativeUrl = `/api/costing/AIMLSearch/getCompareModel?mainPartId=${compareModel.mainPartId}&comparePartId=${compareModel.comparePartId}&fileName=${externalFileName}`;
        const endpoint = `${environment.apiUrl}${relativeUrl}`;
        return fetchFile(endpoint, progressScope, this.userData);
      };

      await this.viewer.loadAndDisplayModel(compareModel, dataLoader);
    } catch (theErr) {
      console.error(`Unable to load and display compare model "${compareModel.modelName}"`, theErr);
    }
  }
}
