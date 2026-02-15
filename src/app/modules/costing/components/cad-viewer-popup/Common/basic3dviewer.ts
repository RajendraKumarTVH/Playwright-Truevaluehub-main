import { BaseViewer } from './BaseViewer';
import cadex from '@cadexchanger/web-toolkit';

export class Basic3dViewer extends BaseViewer {
  constructor(containid: any) {
    //ExpCustom
    super(/** @type {HTMLElement} */ document.getElementById(containid) as HTMLElement, {
      showViewCube: false,
      autoResize: true,
      showLogo: false,
      cameraType: cadex.ModelPrs_CameraProjectionType.Perspective,
    });
  }

  override async displayModel(theRepMask: cadex.ModelData_RepresentationMask, theProgressScope: cadex.Base_ProgressScope) {
    this.modelSceneNode.displayMode = this.hasBRepRep ? cadex.ModelPrs_DisplayMode.ShadedWithBoundaries : cadex.ModelPrs_DisplayMode.Shaded;
    super.displayModel(theRepMask, theProgressScope);
  }
}
