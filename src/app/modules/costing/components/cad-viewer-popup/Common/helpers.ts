import cadex from '@cadexchanger/web-toolkit';

class CancellationObserver extends cadex.Base_ProgressStatusObserver {
  xhr: XMLHttpRequest;

  constructor(xhr: XMLHttpRequest) {
    super();
    this.xhr = xhr;
  }

  override changedValue() {} // NOSONAR

  override completed() {} // NOSONAR

  override canceled() {
    this.xhr.abort();
  }
}

/**
 * Remote file data provider.
 */
export async function fetchFile(theUrl: string, theProgressScope: cadex.Base_ProgressScope, userData: any): Promise<ArrayBuffer> {
  const aFileDownloadingScope = new cadex.Base_ProgressScope(theProgressScope);
  let aProgressStatusCancelationObserver: CancellationObserver | undefined;

  return new Promise<ArrayBuffer>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.responseType = 'arraybuffer';
    const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
    xhr.open('GET', theUrl, true);
    // xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token'));//ExpCustom
    xhr.setRequestHeader('Authorization', 'Bearer ' + userData.token); //ExpCustom
    xhr.setRequestHeader('x-extension-Tenant', loggedInUser.client.clientKey || '');
    xhr.setRequestHeader('x-extension-UserId', loggedInUser.userId.toString() || '');
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.response);
      } else {
        reject(new Error(xhr.statusText));
      }
    };
    xhr.onabort = () => {
      reject(new Error(xhr.statusText));
    };
    xhr.onerror = () => {
      reject(new Error(xhr.statusText));
    };
    xhr.onprogress = (event) => {
      aFileDownloadingScope.increment(event.loaded - aFileDownloadingScope.value);
    };
    xhr.onreadystatechange = () => {
      if (xhr.readyState === xhr.HEADERS_RECEIVED && xhr.status === 200) {
        const fileSize = xhr.getResponseHeader('content-length');
        aFileDownloadingScope.setRange(0, Number(fileSize));
      }
    };

    aProgressStatusCancelationObserver = new CancellationObserver(xhr);
    aFileDownloadingScope.owner.register(aProgressStatusCancelationObserver);

    xhr.send();
  }).finally(() => {
    aFileDownloadingScope.close();
    if (aProgressStatusCancelationObserver) {
      aFileDownloadingScope.owner.unregister(aProgressStatusCancelationObserver);
    }
  });
}

// Class customized ExpCustom
export class ModelAnalyzer extends cadex.ModelData_SceneGraphElementVoidVisitor {
  hasBRepRep: boolean;
  polyRepCount = 0;
  jstree: any;
  treeNodes: any;
  sceneNodes: any;
  lastInstance: any;
  sceneNodeFactory: any;
  repMask: cadex.ModelData_RepresentationMask;
  public collectedParts: any;
  constructor() {
    super();
    this.hasBRepRep = false;
    this.polyRepCount = 0;
    this.collectedParts = [];
  }

  /**
   * @param {cadex.ModelData_Part} thePart
   */
  visitPart(thePart: cadex.ModelData_Part) {
    const aHasBRepRep = Boolean(thePart.brepRepresentation());
    const aHasPolyRep = Boolean(thePart.polyRepresentation(112));
    if (aHasBRepRep && !aHasPolyRep) {
      // brep is true & polyrep is false
      this.hasBRepRep = true;
    }
    this.polyRepCount = Math.max(this.polyRepCount, thePart.numberOfRepresentation - (aHasBRepRep ? 1 : 0));

    const aPartID = thePart.uuid ? thePart.uuid.toString() : '';
    /* Only unique parts (not all instances) should be present in the part selection drop-down list: */
    if (!this.collectedParts.find((theCollectedPart) => theCollectedPart.sge === thePart)) {
      this.collectedParts.push({
        id: aPartID,
        label: thePart.name || 'Unnamed part',
        sge: thePart,
        representation: thePart.representation(this.repMask),
      });
    }
  }
  /**
   * @param {cadex.ModelData_RepresentationMask} theRepMask
   */
  updateRepMask(theRepMask) {
    this.repMask = theRepMask;
    this.collectedParts.forEach((theCollectedPart) => (theCollectedPart.representation = theCollectedPart.sge.representation(theRepMask)));
  }

  /**
   * Clear the CustomSGEVisitor collected parts collection.
   */
  clear() {
    this.collectedParts.length = 0;
  }
}
