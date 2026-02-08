import { AfterViewInit, Component, EventEmitter, Input, Output } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DFMSheetMetalAnalyzer } from 'src/app/shared/models/dfm-issues.model';
import { environment } from 'src/environments/environment';
declare const cadex: any;
declare const $: any;

@Component({
  selector: 'app-cad-viewer-popup',
  templateUrl: './cad-viewer-popup.component.html',
  styleUrls: ['./cad-viewer-popup.component.scss'],
})
export class CadViewerPopupComponent implements AfterViewInit {
  @Input() public fileName: string;
  @Input() public partData: { [key: string]: any };
  @Input() public dfmIssuesAnalyzer: DFMSheetMetalAnalyzer;
  @Output() passEntry: EventEmitter<boolean> = new EventEmitter();
  aSelectedVertexes: any = [];
  aSelectedMeasurements: any = [];
  aSceneBBox: any;
  aMeasurementFactory: any;
  aMeasurements: any = [];
  aFontSize: number;
  isDistanceUnitSelected = true;
  isAngleUnitsSelectorSelected = false;
  aLastPickResult: any;
  aNotesManager: NoteManager;
  scene: any;
  anAlreadyUsedAxes: any = [];
  isLeftPanelSelected = 0;
  isRightPanelSelected = 0;
  aJsTree: any;
  aPMIFactory: any;
  aPMITree: any;
  aTreeRoot: any;
  theTextureBasePath: any;

  constructor(private modelService: NgbModal) {}

  ngAfterViewInit(): void {
    if (this.fileName) {
      this.loadViewer(this.fileName, 'model-viewer');
    }
  }
  loadViewer(shareId: string, id: string) {
    // Create scene and viewport
    const aScene = new cadex.ModelPrs_Scene();
    const aViewPort = new cadex.ModelPrs_ViewPort({ autoResize: true }, document.getElementById('model-viewer'));
    aViewPort.attachToScene(aScene);

    // Load prepared model
    const aModel = new cadex.ModelData_Model();
    const aLoadResult = aModel.loadFile('Radial_Engine.cdxfb', this.dataLoader, false);

    // Display model on the scene
    const aDisplayMode = cadex.ModelPrs_DisplayMode.Shaded;
    const aRepMode = cadex.ModelData_RepresentationMask.ModelData_RM_Poly;
    cadex.ModelPrs_DisplayerApplier.apply(aLoadResult.roots, [], {
      displayer: new cadex.ModelPrs_SceneDisplayer(aScene),
      displayMode: aDisplayMode,
      repSelector: new cadex.ModelData_RepresentationMaskSelector(aRepMode),
    });

    this.intializeTree();
    this.scene = new cadex.ModelPrs_Scene();
    this.scene.globalSelectionMode = cadex.ModelPrs_SelectionMode.Vertex;
    this.scene.globalDisplayMode = cadex.ModelPrs_DisplayMode.ShadedWithBoundaries;
    this.aSceneBBox = this.scene.boundingBox.clone();
    this.aFontSize = 10;
    this.aMeasurementFactory = new cadex.ModelPrs_MeasurementFactory();
    this.scene.addEventListener('selectionChanged', (evt: any) => {
      this.onSelectionChanged(evt);
    });
    viewPort = new cadex.ModelPrs_ViewPort(
      {
        showViewCube: true,
        cameraType: cadex.ModelPrs_CameraProjectionType.Perspective,
        autoResize: false,
      },
      document.getElementById(id)
    );
    viewPort.attachToScene(this.scene);
    viewPort.hoverEnabled = true;
    this.aPMIFactory = new cadex.ModelPrs_PMIFactory();
    this.scene.addEventListener('boundingBoxChanged', () => {
      const aBoundingBox = this.scene.boundingBox;
      viewPort.clipPlanesManager.planes.forEach((thePlane: any) => {
        thePlane.bbox = aBoundingBox;
      });
    });
    viewPort.domElement.addEventListener('keydown', (theEvent: any) => {
      if (theEvent.code === 'Delete') {
        this.removeSelectedMeasurements(this.scene);
      }
    });
    viewPort.addEventListener('contextMenu', (evt: any) => {
      this.showContextMenu(evt, this.scene);
    });
    viewPort.addEventListener('frameRendered', this.hideContextMenu);
    this.aNotesManager = new NoteManager(viewPort);

    this.aNotesManager.addEventListener('noteAdded', this.updateNotesList);
    this.aNotesManager.addEventListener('noteRemoved', this.updateNotesList);
    document.getElementById('add-note-button').addEventListener('click', () => {
      this.hideContextMenu();
      this.createNote();
    });

    this.loadAndDisplayModel(shareId);
    const childrenList = document.getElementById('model-viewer');
    if (childrenList && childrenList.hasChildNodes() && childrenList.children.length > 1) {
      (document.getElementById('model-viewer').children[1] as HTMLElement).style.visibility = 'hidden';
    }
  }
  intializeTree() {
    $('#file-scenegraph-container')
      .jstree(aJSTreeConfig)
      .on('select_node.jstree', (theEvent: any, theData: any) => this.onSelectedByTreeView(theData.node))
      .on('deselect_node.jstree', (theEvent: any, theData: any) => this.onDeselectedByTreeView(theData.node))
      .on('deselect_all.jstree', (theEvent: any, theData: any) => this.onDeselectedAllByTreeView(theData))
      .on('activate_node.jstree', (theEvent: any, theData: any) => {
        if (theData.displayed !== undefined) {
          if (theData.displayed) {
            this.onDisplayedByTreeView(theData.node);
          } else {
            this.onHiddenByTreeView(theData.node);
          }
        }
      });

    $('#file-pmi-elements')
      .jstree(aJSTreeConfig)
      .on('select_node.jstree', async (theEvent: any, theData: any) => {
        const aNodeData = theData.node.data;
        if (aNodeData && aNodeData.view3dObj) {
          this.scene.select(aNodeData.view3dObj, true);
        }
      });

    $('#file-pmi-elements').jstree(true).create_node(null, { text: 'Select tree node to see PMI data', type: 'pmi' });
  }
  onDisplayedByTreeView(theNode: any) {
    this.collectLeaves(theNode).forEach((theLeaf: any) => {
      if (theLeaf.data.view3dObjects) {
        this.scene.display(theLeaf.data.view3dObjects);
      }
    });
  }

  onHiddenByTreeView(theNode: any) {
    this.collectLeaves(theNode).forEach((theLeaf: any) => {
      if (theLeaf.data.view3dObjects) {
        this.scene.hide(theLeaf.data.view3dObjects);
      }
    });
  }
  async onSelectedByTreeView(theNode: any) {
    this.collectLeaves(theNode).forEach((theLeaf: any) => {
      if (theLeaf.data.view3dObjects) {
        this.scene.select(theLeaf.data.view3dObjects, false, false);
      }
    });
    this.aPMITree = $('#file-pmi-elements').jstree(true);
    this.aTreeRoot = this.aPMITree.get_node('#');
    // Clean up current PMI graphical elements tree
    this.aTreeRoot.children.forEach((theRoot: any) => this.aPMITree.delete_node(theRoot));

    const aNodeData = theNode.data;
    const aSGE = aNodeData && aNodeData.ancestors && aNodeData.ancestors[aNodeData.ancestors.length - 1];
    if (aSGE && aSGE.pmi) {
      if (!aNodeData.pmiView3dObj) {
        aNodeData.pmiView3dObj = await this.aPMIFactory.create(aSGE.pmi, aNodeData.ancestors);
      }
      const aView3Objs = aNodeData.pmiView3dObj;
      const aSGNode = await this.aPMITree.create_node(this.aTreeRoot, {
        text: aSGE.name,
        type: theNode.type,
        data: { sge: aSGE },
      });
      // Combine PMI graphical elements by type
      const aPMIDataItems = await aSGE.pmi.pmiDataItems();
      const aTypedElements = {};
      aPMIDataItems.forEach((thePMIData: any, theIndex: any) => {
        aTypedElements[thePMIData.type] = aTypedElements[thePMIData.type] || [];
        aTypedElements[thePMIData.type].push({
          pmiData: thePMIData,
          // the view3d objects are created in order PMI elements storing
          view3dObj: aView3Objs[theIndex],
        });
      });
      // Feed PMI elements tree
      for (const aPMIType in aTypedElements) {
        const anElementNode = this.aPMITree.create_node(aSGNode, {
          text: Object.keys(cadex.ModelData_PMIType).find((key) => `${cadex.ModelData_PMIType[key]}` === aPMIType),
          type: 'pmi',
        });
        aTypedElements[aPMIType].forEach((theElement: any) => {
          this.aPMITree.create_node(anElementNode, {
            text: theElement.pmiData.name,
            type: 'pmi-element',
            data: theElement,
          });
        });
      }
      // Feed PMI Saved Views dropdown
      const aDropDown: any = document.getElementById('file-pmi-saved-views-select');
      while (aDropDown.options.length > 0) {
        aDropDown.remove(0);
      }
      const anAllOption = document.createElement('option');
      anAllOption.text = 'All (auto created)';
      aDropDown.add(anAllOption);

      const aViews = await aSGE.pmi.views();
      aViews.forEach((theView: any) => {
        const anOption = document.createElement('option');
        anOption.text = theView.name || 'Unnamed view';
        aDropDown.add(anOption);
      });
      aDropDown.onchange = () => {
        if (aDropDown.selectedIndex === 0) {
          this.scene.display(aView3Objs, cadex.ModelPrs_DisplayMode.Shaded, cadex.ModelPrs_SelectionMode.Shape);
        } else if (aDropDown.selectedIndex > 0) {
          this.scene.hide(aView3Objs);
          const aSelectedView = aViews[aDropDown.selectedIndex - 1];
          aSelectedView.elements.forEach((theElement: any) => {
            const anElementIndex = aPMIDataItems.findIndex((theItem: any) => theElement === theItem.graphicalElement);
            if (anElementIndex !== -1) {
              this.scene.display(aView3Objs[anElementIndex], cadex.ModelPrs_DisplayMode.Shaded, cadex.ModelPrs_SelectionMode.Shape);
            }
          });
          const aTrsf = aNodeData.ancestors.reduce((theTrsf: any, theAncestor: any) => {
            if (theAncestor instanceof cadex.ModelData_Instance) {
              theTrsf.multiply(theAncestor.transformation);
            }
            return theTrsf;
          }, new cadex.ModelData_Transformation());
          viewPort.changeCamera({
            position: aSelectedView.camera.location.transformed(aTrsf),
            target: aSelectedView.camera.targetPoint.transformed(aTrsf),
            up: aSelectedView.camera.upDirection.transformed(aTrsf),
          });
        }
      };
      aDropDown.selectedIndex = -1;
      aDropDown.onchange();
    } else {
      this.aPMITree.create_node(this.aTreeRoot, {
        text: 'There is no PMI table available',
        type: 'pmi',
      });
      // Clean up dropdown
      const aDropDown: any = document.getElementById('file-pmi-saved-views-select');
      while (aDropDown.options.length > 0) {
        aDropDown.remove(0);
      }
    }
    if (aNodeData && aNodeData.sge) {
      const aVisitor = new ElementVisitor(aNodeData.textureBasePath);
      await aNodeData.sge.accept(aVisitor);
      $('#info-card').html(aVisitor.info);
    } else {
      const anInfoCardMessage = document.createElement('span');
      anInfoCardMessage.textContent = 'No information available.';
      $('#info-card').html(anInfoCardMessage);
    }
    this.aPMITree.open_all(null, 0);
  }

  onDeselectedByTreeView(theNode: any) {
    this.collectLeaves(theNode).forEach((theLeaf: any) => {
      if (theLeaf.data.view3dObjects) {
        this.scene.deselect(theLeaf.data.view3dObjects);
      }
    });
  }
  collectLeaves(theNode: any) {
    if (theNode.children.length === 0) {
      return [theNode];
    } else {
      return theNode.children_d.reduce((theLeaves: any, theChildId: any) => {
        const aChild = this.aJsTree.get_node(theChildId);
        if (aChild.children.length === 0) {
          theLeaves.push(aChild);
        }
        return theLeaves;
      }, []);
    }
  }
  onDeselectedAllByTreeView(theData: any) {
    this.scene.deselectAll();
    const aTreeNodes = theData.node;
    const aPMITree = $('#file-scenegraph-container').jstree(true);

    aTreeNodes.forEach((theNodeId: any) => {
      const aNode = aPMITree.get_node(theNodeId);
      if (aNode.data && aNode.data.pmiView3dObj) {
        this.scene.hide(aNode.data.pmiView3dObj);
      }
    });
  }
  addPlane() {
    if (viewPort.clipPlanesManager.planes.size >= 3) {
      return;
    }
    viewPort.clipPlanesManager.planes.forEach((thePlane: any) => {
      this.anAlreadyUsedAxes.push(thePlane.axis);
    });
    const aMissingAxis = Object.values(CliPlaneAxis).filter((theAxis) => !this.anAlreadyUsedAxes.includes(theAxis))[0];
    const aClipPlane = new ClipPlane(this.scene.boundingBox, aMissingAxis);
    viewPort.clipPlanesManager.addGlobalClipPlane(aClipPlane);
    document.querySelector('.clip-planes').appendChild(aClipPlane.planePanel);
  }
  deletePlane(thePlane: any) {
    viewPort.clipPlanesManager.removeGlobalClipPlane(thePlane);
    thePlane.planePanel.remove();
  }
  removeAllPlanes() {
    viewPort.clipPlanesManager.clear(); /* Remove all planes from clippingPlanesManager. */
    document.querySelector('.clip-planes').innerHTML = ''; /* Remove all planes from layout. */
  }
  showContextMenu(theEvent: any, scene: any) {
    const aContextMenu = document.getElementById('context-menu');
    aContextMenu.style.display = 'block';
    aContextMenu.style.left = `${theEvent.point.x}px`;
    aContextMenu.style.top = `${theEvent.point.y}px`;

    // Save pick result to global variable to reuse it on note creation
    this.aLastPickResult = scene.pick(theEvent.ray);
    // Enable 'add note' button only when view3d object has been clicked
    const addNoteButton: any = document.getElementById('add-note-button');
    addNoteButton.disabled = !this.aLastPickResult;
  }
  hideContextMenu() {
    const aContextMenu = document.getElementById('context-menu');
    if (aContextMenu) {
      aContextMenu.style.display = '';
    }
  }

  createNote() {
    // Deactivate active note
    this.aNotesManager.activateNote(null);

    // Create temporary note and display in viewer
    const aNewNote = new Note(this.aLastPickResult.point, this.aLastPickResult.object, viewPort.getCameraProperties());
    aNewNote.active = true;
    viewPort.addMarker(aNewNote.annotation);

    // let onViewportChanged: any;

    // Save temporary note to notes manager if label is not empty
    const onEditChanged = () => {
      aNewNote.removeEventListener('editChanged', onEditChanged);
      viewPort.removeEventListener('frameRendered', onViewportChanged);
      if (aNewNote.label) {
        this.aNotesManager.addNote(aNewNote);
        this.aNotesManager.activateNote(aNewNote);
      } else {
        viewPort.removeMarker(aNewNote.annotation);
      }
    };

    // Remove temporary note when viewer has been changed (e.g. rotated by input)
    const onViewportChanged = () => {
      aNewNote.label = '';
      onEditChanged();
    };

    aNewNote.addEventListener('editChanged', onEditChanged);
    viewPort.addEventListener('frameRendered', onViewportChanged);
  }
  updateNotesList() {
    const aNotesContainer = document.getElementById('notes-container');
    // Just for demo purpose: clean up all content and re-generate cards
    aNotesContainer.innerHTML = '';

    this.aNotesManager.notes.forEach((_theNote: any) => {
      // const aNoteListElement = document.createElement('div');
      // aNoteListElement.classList.add('card');
      // aNoteListElement.style.display = 'flex';
      // const aLabelElement = document.createElement('div');
      // aLabelElement.innerHTML = theNote.label;
      // aLabelElement.classList.add('note-label');
      // aNoteListElement.appendChild(aLabelElement);
      // const aDeleteButton = document.createElement('img');
      // aDeleteButton.src = '/assets/images/delete.svg';
      // aDeleteButton.addEventListener('click', (theEvent) => {
      //   this.aNotesManager.removeNote(theNote);
      //   theEvent.stopPropagation();
      // });
      // aNoteListElement.appendChild(aDeleteButton);
      // aNoteListElement.addEventListener('click', () => {
      //   this.aNotesManager.activateNote(theNote);
      // });
      // aNotesContainer.appendChild(aNoteListElement);
    });
  }
  async loadAndDisplayModel(shareId: string) {
    try {
      this.aJsTree = $('#file-scenegraph-container').jstree(true);
      this.scene.removeAll(true);
      const aRootNode = this.aJsTree.get_node('#');
      aRootNode.children.forEach((theNodeId: any) => this.aJsTree.delete_node(theNodeId));

      const anInfoCardMessage = document.createElement('span');
      anInfoCardMessage.textContent = 'Select tree node to see element info.';
      $('#info-card').html(anInfoCardMessage);

      const model = new cadex.ModelData_Model();
      const loadResult = await model.loadFile(shareId, this.dataLoader, false);

      // Create root file item
      const aFileNode = this.aJsTree.create_node(null, { text: shareId, type: 'file', data: {} });

      this.theTextureBasePath = `${environment.apiUrl}/api/costing/CadExtractor/${shareId}`;

      // Feed tree with model structure
      const aVisitor = new SceneGraphToJsTreeConverter(aFileNode, this.aJsTree, this.theTextureBasePath);
      await model.accept(aVisitor);
      this.aJsTree.open_all(null, 0);

      let aDisplayMode = cadex.ModelPrs_DisplayMode.Shaded;
      let aRepMode = cadex.ModelData_RepresentationMask.ModelData_RM_Poly;
      if (loadResult.hasBRepRep) {
        aDisplayMode = cadex.ModelPrs_DisplayMode.ShadedWithBoundaries;
        aRepMode = cadex.ModelData_RepresentationMask.ModelData_RM_BRep;
      }
      this.scene.globalDisplayMode = aDisplayMode;

      // Convert added model roots into visualization objects and display it
      await cadex.ModelPrs_DisplayerApplier.apply(loadResult.roots, [], {
        displayer: new SceneDisplayer(this.scene, aFileNode, this.aJsTree),
        //new cadex.ModelPrs_SceneDisplayer(this.scene),
        repSelector: new cadex.ModelData_RepresentationMaskSelector(aRepMode),
      });

      this.aSceneBBox = this.scene.boundingBox.copy(this.scene.boundingBox);
      const xRange = Number(this.aSceneBBox.xRange());
      const yRange = Number(this.aSceneBBox.yRange());
      const zRange = Number(this.aSceneBBox.zRange());

      const aSceneBBoxSizeLength = Math.sqrt(xRange * xRange + yRange * yRange + zRange * zRange);
      this.aFontSize = aSceneBBoxSizeLength / 50;

      // Auto adjust camera settings to look to whole model
      viewPort.fitAll();
      this.initExploderSlider();
    } catch (theErr) {
      console.log('Unable to load and display model: ', theErr);
    }
  }
  onChange(deviceValue: any) {
    if (deviceValue.target.value == 'Vertex') {
      this.isAngleUnitsSelectorSelected = true;
      this.isDistanceUnitSelected = false;
    } else if (deviceValue.target.value == 'Shape') {
      this.isAngleUnitsSelectorSelected = false;
      this.isDistanceUnitSelected = true;
    }
  }
  async dataLoader(shareId: string, subFileName: string) {
    const myHeaders = new Headers();
    const token = localStorage.getItem('token');
    const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('Authorization', `Bearer ${token}`);
    myHeaders.append('x-extension-Tenant', loggedInUser.client.clientKey || '');
    myHeaders.append('x-extension-UserId', loggedInUser.userId.toString() || '');

    const res = await fetch(`${environment.apiUrl}/api/costing/CadExtractor/${shareId}/Model/${subFileName}`, { method: 'GET', headers: myHeaders });
    if (res.status === 200) {
      return res.arrayBuffer();
    }
    throw new Error(res.statusText);
  }

  dismissAll() {
    this.modelService.dismissAll();
    this.passEntry.emit(true);
  }

  initExploderSlider() {
    const anExploderSlider: HTMLSelectElement = document.querySelector('#exploder-slider>input');
    const anExploderValue: HTMLElement = document.getElementById('exploder-value');
    const aExploderAutoFitAllCheckbox: any = document.getElementById('exploder-fit-all-auto-checkbox');

    anExploderSlider.oninput = () => {
      const aSliderValue = parseInt(anExploderSlider.value);
      viewPort.exploder.isActive = aSliderValue !== 0;
      viewPort.exploder.value = aSliderValue / 100;
      anExploderValue.textContent = `${anExploderSlider.value}%`;
    };
    anExploderSlider.onchange = () => {
      if (aExploderAutoFitAllCheckbox.checked) {
        viewPort.fitAll();
      }
    };
  }

  onSelectionChanged(theEvent: any) {
    if (theEvent.removed.length > 0) {
      theEvent.removed.forEach((theRemoved: any) => {
        if (!theRemoved.shapes) {
          const anIndex = this.aSelectedMeasurements.indexOf(theRemoved.object);
          this.aSelectedMeasurements.splice(anIndex);
          return;
        }
        const anObjectTransformation = theRemoved.object.transformation;
        theRemoved.shapes.forEach((s: any) => {
          if (s instanceof cadex.ModelData_Vertex) {
            const aVertexWorldPosition = s.point.transformed(anObjectTransformation);
            const anIndex = this.aSelectedVertexes.findIndex((v: any) => v.point.isEqual(aVertexWorldPosition, 1e-5));
            if (anIndex !== -1) {
              this.aSelectedVertexes.splice(anIndex, 1);
            }
          }
        });
      });
      theEvent.added.forEach((theAdded: any) => {
        const anAddedObject = theAdded.object;
        if (anAddedObject.treeId) {
          this.aJsTree.select_node(anAddedObject.treeId);
        }
      });
      theEvent.removed.forEach((theRemoved: any) => {
        const aRemovedObject = theRemoved.object;
        if (aRemovedObject.treeId) {
          this.aJsTree.deselect_node(aRemovedObject.treeId);
        }
      });
    }
    if (theEvent.added.length > 0) {
      theEvent.added.forEach((theAdded: any) => {
        if (!theAdded.shapes) {
          this.aSelectedMeasurements.push(theAdded.object);
          return;
        }
        const anObjectTransformation = theAdded.object.transformation;
        theAdded.shapes.forEach((s: any) => {
          if (s instanceof cadex.ModelData_Vertex) {
            const aVertexWorldPosition = s.point.transformed(anObjectTransformation);
            const anIndex = this.aSelectedVertexes.findIndex((v: any) => v.point.isEqual(aVertexWorldPosition, 1e-5));
            if (anIndex === -1) {
              this.aSelectedVertexes.push(new cadex.ModelData_Vertex(aVertexWorldPosition));
            }
          }
        });
      });
    }

    const aMeasurementsModeSelector: any = document.querySelector('#measurements-mode-selector>select');
    if (aMeasurementsModeSelector.selectedIndex === 0 && this.aSelectedVertexes.length === 2) {
      // find the direction of annotation
      // the main idea is to use direction aligned with vector from scene bbox center to measurement points.
      const aBBoxCenter = this.aSceneBBox.getCenter();
      const aPoint1 = this.aSelectedVertexes[0].point;
      const aPoint2 = this.aSelectedVertexes[1].point;
      // use center of measurement reference point for annotation direction
      const anAnnotationDirTmp = aPoint1.clone().add(aPoint2).multiplyScalar(0.5).sub(aBBoxCenter);
      const anAnnotationDirection = new cadex.ModelData_Direction(anAnnotationDirTmp.x, anAnnotationDirTmp.y, anAnnotationDirTmp.z);

      const aP1P2DirectionTmp = aPoint1.clone().sub(aPoint2);
      const aP1P2Direction = new cadex.ModelData_Direction(aP1P2DirectionTmp.x, aP1P2DirectionTmp.y, aP1P2DirectionTmp.z);

      // next try to align annotation direction with X, Y, Z axes.
      const aDirXAbs = Math.abs(anAnnotationDirection.x);
      const aDirYAbs = Math.abs(anAnnotationDirection.y);
      const aDirZAbs = Math.abs(anAnnotationDirection.z);
      if (aDirZAbs && aDirZAbs >= aDirXAbs && aDirZAbs >= aDirYAbs) {
        if (Math.abs(aP1P2Direction.x) < 1e-5 && Math.abs(aP1P2Direction.y) < 1e-5) {
          // degenerate case, choose X axis
          anAnnotationDirection.z = 0;
        } else {
          anAnnotationDirection.x = 0;
        }
        anAnnotationDirection.y = 0;
      } else if (aDirXAbs > 1e-5 && aDirXAbs >= aDirYAbs && aDirXAbs >= aDirZAbs) {
        if (Math.abs(aP1P2Direction.y) < 1e-5 && Math.abs(aP1P2Direction.z) < 1e-5) {
          // degenerate case, choose Z axis
          anAnnotationDirection.x = 0;
        } else {
          anAnnotationDirection.z = 0;
        }
        anAnnotationDirection.y = 0;
      } else if (aDirYAbs > 1e-5) {
        if (Math.abs(aP1P2Direction.x) < 1e-5 && Math.abs(aP1P2Direction.z) < 1e-5) {
          // degenerate case, choose Z axis
          anAnnotationDirection.y = 0;
        } else {
          anAnnotationDirection.z = 0;
        }
        anAnnotationDirection.x = 0;
      } else {
        // default is Z axis
        anAnnotationDirection.set(0, 0, 1);
      }

      // orthogonalize annotation with dimension direction
      const anOrthogonalizedAnnotationDirection = aP1P2Direction.crossed(anAnnotationDirection).cross(aP1P2Direction);

      const dot = (v1: any, v2: any) => {
        return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
      };

      // annotation text is placed out of model
      // so find the distance between points to BBox boundaries in chosen direction
      const tmp = new cadex.ModelData_Point();
      const aBBoxMinCorner = this.aSceneBBox.minCorner;
      const aBBoxMaxCorner = this.aSceneBBox.maxCorner;
      let aMeasurementElevation = Math.max(
        dot(tmp.setCoord(aBBoxMinCorner.x, aBBoxMinCorner.y, aBBoxMinCorner.z).sub(aPoint1), anOrthogonalizedAnnotationDirection),
        dot(tmp.setCoord(aBBoxMinCorner.x, aBBoxMinCorner.y, aBBoxMaxCorner.z).sub(aPoint1), anOrthogonalizedAnnotationDirection),
        dot(tmp.setCoord(aBBoxMinCorner.x, aBBoxMaxCorner.y, aBBoxMinCorner.z).sub(aPoint1), anOrthogonalizedAnnotationDirection),
        dot(tmp.setCoord(aBBoxMinCorner.x, aBBoxMaxCorner.y, aBBoxMaxCorner.z).sub(aPoint1), anOrthogonalizedAnnotationDirection),
        dot(tmp.setCoord(aBBoxMaxCorner.x, aBBoxMinCorner.y, aBBoxMinCorner.z).sub(aPoint1), anOrthogonalizedAnnotationDirection),
        dot(tmp.setCoord(aBBoxMaxCorner.x, aBBoxMinCorner.y, aBBoxMaxCorner.z).sub(aPoint1), anOrthogonalizedAnnotationDirection),
        dot(tmp.setCoord(aBBoxMaxCorner.x, aBBoxMaxCorner.y, aBBoxMinCorner.z).sub(aPoint1), anOrthogonalizedAnnotationDirection),
        dot(tmp.setCoord(aBBoxMaxCorner.x, aBBoxMaxCorner.y, aBBoxMaxCorner.z).sub(aPoint1), anOrthogonalizedAnnotationDirection),
        dot(tmp.setCoord(aBBoxMinCorner.x, aBBoxMinCorner.y, aBBoxMinCorner.z).sub(aPoint2), anOrthogonalizedAnnotationDirection),
        dot(tmp.setCoord(aBBoxMinCorner.x, aBBoxMinCorner.y, aBBoxMaxCorner.z).sub(aPoint2), anOrthogonalizedAnnotationDirection),
        dot(tmp.setCoord(aBBoxMinCorner.x, aBBoxMaxCorner.y, aBBoxMinCorner.z).sub(aPoint2), anOrthogonalizedAnnotationDirection),
        dot(tmp.setCoord(aBBoxMinCorner.x, aBBoxMaxCorner.y, aBBoxMaxCorner.z).sub(aPoint2), anOrthogonalizedAnnotationDirection),
        dot(tmp.setCoord(aBBoxMaxCorner.x, aBBoxMinCorner.y, aBBoxMinCorner.z).sub(aPoint2), anOrthogonalizedAnnotationDirection),
        dot(tmp.setCoord(aBBoxMaxCorner.x, aBBoxMinCorner.y, aBBoxMaxCorner.z).sub(aPoint2), anOrthogonalizedAnnotationDirection),
        dot(tmp.setCoord(aBBoxMaxCorner.x, aBBoxMaxCorner.y, aBBoxMinCorner.z).sub(aPoint2), anOrthogonalizedAnnotationDirection),
        dot(tmp.setCoord(aBBoxMaxCorner.x, aBBoxMaxCorner.y, aBBoxMaxCorner.z).sub(aPoint2), anOrthogonalizedAnnotationDirection)
      );

      // add addition offset for better UX
      aMeasurementElevation += 3 * this.aFontSize;

      const aMeasurement = this.aMeasurementFactory.createDistanceDimension(
        this.aSelectedVertexes[0],
        this.aSelectedVertexes[1],
        anOrthogonalizedAnnotationDirection,
        aMeasurementElevation,
        this.aFontSize
      );
      const distanceUnitSelector: any = document.querySelector('#distance-units-selector>select');
      aMeasurement.setLengthDisplayUnits(cadex.Base_LengthUnit[distanceUnitSelector.value]);
      this.scene.display(aMeasurement, cadex.ModelPrs_DisplayMode.Shaded, cadex.ModelPrs_SelectionMode.Shape);
      this.aMeasurements.push(aMeasurement);
      this.scene.deselectAll();
    }
    if (aMeasurementsModeSelector.selectedIndex === 1 && this.aSelectedVertexes.length === 3) {
      const aMeasurement = this.aMeasurementFactory.createAngleDimension(this.aSelectedVertexes[0], this.aSelectedVertexes[1], this.aSelectedVertexes[2], this.aFontSize);
      const angleUnitSelector: any = document.querySelector('#angle-units-selector>select');
      aMeasurement.setAngleDisplayUnits(cadex.Base_AngleUnit[angleUnitSelector.value]);
      this.scene.display(aMeasurement, cadex.ModelPrs_DisplayMode.Shaded, cadex.ModelPrs_SelectionMode.Shape);
      this.aMeasurements.push(aMeasurement);
      this.scene.deselectAll();
    }
  }

  removeSelectedMeasurements(scene: any) {
    scene.remove(this.aSelectedMeasurements);
  }
}
export class Note extends cadex.ModelPrs_EventDispatcher {
  /**
   * @param {cadex.ModelData_PointLike} thePoint
   * @param {cadex.ModelPrs_View3dObject} theView3dObj
   * @param {cadex.ModelPrs_CameraState} theCameraState
   */
  constructor(thePoint: any, theView3dObj: any, theCameraState: any) {
    super();

    const aPinElement = document.createElement('div');
    const aCardElement = document.createElement('div');

    this.annotation = new cadex.ModelPrs_Annotation({
      position: thePoint,
      view3dObject: theView3dObj,
      camera: theCameraState,
      markerElement: aPinElement,
      labelElement: aCardElement,
      markerShown: true,
      labelShown: false,
    });

    /** @type {string} */
    this.label = '';
    /** @type {boolean} */
    this._edit = true;

    aPinElement.classList.add('pin');
    aCardElement.classList.add('card');

    aPinElement.addEventListener('click', () => {
      this.dispatchEvent({ type: 'markerClicked' });
    });

    this.active = true;
    this._updateCard();
  }

  get edit() {
    return this._edit;
  }

  set edit(theEdit) {
    if (theEdit !== this._edit) {
      this._edit = theEdit;
      this._updateCard();
      this.dispatchEvent({ type: 'editChanged', value: theEdit });
    }
  }

  get active() {
    return this.labelShown;
  }

  set active(theActive) {
    if (theActive !== this.annotation.labelShown) {
      this.annotation.labelShown = theActive;
      this.annotation.markerElement.classList.toggle('active', theActive);
      this.dispatchEvent({ type: 'activeChanged', value: theActive });
    }
  }

  _updateCard() {
    const aLabelElement = this.annotation.labelElement;
    aLabelElement.classList.toggle('editing', this._edit);
    if (this._edit) {
      aLabelElement.textContent = '';

      const aCardInner = document.createElement('div');
      aCardInner.classList.add('card__inner');
      aLabelElement.appendChild(aCardInner);

      const anInput = document.createElement('input');
      anInput.type = 'text';
      anInput.placeholder = 'Write text...';
      anInput.value = this.label;
      aCardInner.appendChild(anInput);

      const saveEdit = () => {
        this.label = anInput.value;
        this.edit = false;
      };
      const cancelEdit = () => {
        this.edit = false;
      };

      const aSaveButton = document.createElement('img');
      aSaveButton.src = '/assets/images/done.svg';
      aSaveButton.addEventListener('click', saveEdit);
      aCardInner.appendChild(aSaveButton);

      const aCancelButton = document.createElement('img');
      aCancelButton.src = '/assets/images/delete.svg';
      aCancelButton.addEventListener('click', cancelEdit);
      aCardInner.appendChild(aCancelButton);

      // Some keyboard user friendliness: save on 'enter' press, cancel on 'escape' press
      anInput.addEventListener('keyup', (theEvent) => {
        if (theEvent.key === 'Enter') {
          saveEdit();
        } else if (theEvent.key === 'Escape') {
          cancelEdit();
        }
      });

      // focus input when it will be shown
      setTimeout(() => {
        anInput.focus();
      }, 100);
    } else {
      aLabelElement.innerHTML = `<div class="note-label"><span>${this.label}</span></div>`;
    }
  }
}
export class NoteManager extends cadex.ModelPrs_EventDispatcher {
  /**
   * @param {cadex.ModelPrs_ViewPort} theViewport
   */
  constructor(theViewport: any) {
    super();

    this.viewport = theViewport;

    /** @type {Set<Note>} */
    this.notes = new Set();

    /** @type {Note} */
    this.activeNote = null;

    // Hide active note on any viewport manipulation (e.g. camera rotation)
    this.viewport.addEventListener('frameRendered', () => {
      this.activateNote(null);
    });
  }

  /**
   * @param {Note} theNote
   */
  addNote(theNote: any) {
    if (this.notes.has(theNote)) {
      return;
    }
    this.notes.add(theNote);
    this.viewport.addMarker(theNote.annotation);

    theNote.onMarkerClicked = () => {
      this.activateNote(theNote);
    };
    theNote.addEventListener('markerClicked', theNote.onMarkerClicked);

    this.dispatchEvent({ type: 'noteAdded', note: theNote });
  }

  /**
   * @param {Note} theNote
   */
  removeNote(theNote: any) {
    if (!this.notes.has(theNote)) {
      return;
    }
    this.notes.delete(theNote);
    this.viewport.removeMarker(theNote.annotation);

    theNote.removeEventListener('markerClicked', theNote.onMarkerClicked);

    this.dispatchEvent({ type: 'noteRemoved', note: theNote });
  }

  /**
   * @param {Note} theNote
   */
  async activateNote(theNote: any) {
    if (this.activeNote === theNote) {
      return;
    }
    if (this.activeNote) {
      this.activeNote.active = false;
      this.activeNote = null;
      this.dispatchEvent({ type: 'noteDeactivated', note: this.activeNote });
    }
    if (!theNote) {
      return;
    }
    // wait while animation finish, then show label
    if (theNote.annotation.camera) {
      await this.viewport.changeCamera(theNote.annotation.camera);
    }
    theNote.active = true;
    this.activeNote = theNote;
    this.dispatchEvent({ type: 'noteActivated', note: this.activeNote });
  }

  clean() {
    for (const aNote of this.notes) {
      this.removeNote(aNote);
    }
  }
}
export class ClipPlane extends cadex.ModelPrs_ClipPlane {
  constructor(theBBox: any, theAxis: any) {
    // create default plane, the position and direction will be updated later
    const aPlane = cadex.ModelData_Plane.fromPointAndNormal(new cadex.ModelData_Point(), new cadex.ModelData_Direction(-1, 0, 0));
    super(aPlane);

    this.planeId = ++theClipPlaneIndex;
    this.min = 0;
    this.max = 100;
    // in percents, from 0 to 100
    this.myValue = 50;
    this.myBBox = new cadex.ModelData_Box();
    this.myBBox.copy(theBBox);
    this.myAxis = theAxis;
    this.myReverse = false;

    this.updateRange();

    this.planePanel = this.createPlanePanel();

    this.addEventListener('planeChanged', (theEvent: any) => {
      if (theEvent.byViewPortInput) {
        this.onPositionChangedByScene();
      }
    });
  }

  get value() {
    return this.myValue;
  }

  set value(theValue) {
    if (theValue < 0) {
      theValue = 0;
    }
    if (theValue > 100) {
      theValue = 100;
    }
    this.myValue = Math.round(theValue);

    const aHtmlValue = `${this.myValue}`;
    const aRangeInput = this.planePanel.querySelector(`#position-range-${this.planeId}`);
    aRangeInput.value = aHtmlValue;

    const aPercentInput = this.planePanel.querySelector(`#position-percent-${this.planeId}`);
    aPercentInput.value = aHtmlValue;

    this.updatePlane();
  }

  get bbox() {
    return this.myBBox;
  }

  set bbox(theBBox) {
    this.myBBox.copy(theBBox);
    this.updateRange();
  }

  get axis() {
    return this.myAxis;
  }
  set axis(theAxis) {
    this.myAxis = theAxis;
    this.updateRange();
  }

  get reverse() {
    return this.myReverse;
  }
  set reverse(theReverse) {
    this.myReverse = theReverse;
    this.updatePlane();
  }

  updateRange() {
    this.min = this.myBBox.minCorner[this.myAxis];
    this.max = this.myBBox.maxCorner[this.myAxis];
    // Add additional 1% gap to avoid rendering artefacts
    const gap = (this.max - this.min) / 100;
    this.min -= gap;
    this.max += gap;
    this.updatePlane();
  }

  updatePlane() {
    const aPlane = this.plane;
    aPlane.location.copy(this.myBBox.minCorner).add(this.myBBox.maxCorner).multiplyScalar(0.5);
    const aPositionValue = Math.round(this.min + (this.max - this.min) * (this.value / 100));
    switch (this.axis) {
      case CliPlaneAxis.x:
        aPlane.location.x = aPositionValue;
        aPlane.direction.setCoord(this.reverse ? 1 : -1, 0, 0);
        break;
      case CliPlaneAxis.y:
        aPlane.location.y = aPositionValue;
        aPlane.direction.setCoord(0, this.reverse ? -1 : 1, 0);
        break;
      case CliPlaneAxis.z:
        aPlane.location.z = aPositionValue;
        aPlane.direction.setCoord(0, 0, this.reverse ? 1 : -1);
        break;
    }
    this.plane = aPlane;
  }

  onPositionChangedByScene() {
    this.value = ((this.plane.location[this.axis] - this.min) * 100) / (this.max - this.min);
  }

  createPlanePanel() {
    const aPlanePanel = document.createElement('div');
    aPlanePanel.classList.add('plane-panel');
    aPlanePanel.id = this.planeId;

    const anAxesSection = document.createElement('div');
    anAxesSection.classList.add('plane-panel__axes-section');
    aPlanePanel.appendChild(anAxesSection);

    const aPlaneTitle = document.createElement('span');
    aPlaneTitle.classList.add('plane-panel__plane-title');
    aPlaneTitle.innerText = 'Plane';
    anAxesSection.appendChild(aPlaneTitle);

    Object.keys(CliPlaneAxis).forEach((theAxis) => {
      const anAxisSection = document.createElement('div');
      anAxisSection.classList.add('plane-panel__axis-section');

      const anAxisRadio = document.createElement('input');
      anAxisRadio.id = `radio-${theAxis}-${this.planeId}`;
      anAxisRadio.type = 'radio';
      anAxisRadio.name = `radio-axes-${this.planeId}`;
      anAxisRadio.value = theAxis;
      anAxisRadio.checked = theAxis === this.axis;
      anAxisRadio.onclick = () => {
        this.axis = CliPlaneAxis[theAxis];
      };

      const anAxisLabel = document.createElement('label');
      anAxisLabel.htmlFor = anAxisRadio.id;
      anAxisLabel.innerText = theAxis.toUpperCase();

      anAxisSection.appendChild(anAxisRadio);
      anAxisSection.appendChild(anAxisLabel);

      anAxesSection.appendChild(anAxisSection);
    });

    const aDivider = document.createElement('div');
    aDivider.classList.add('plane-panel__divider');
    aPlanePanel.appendChild(aDivider);

    const aReverseCheckboxSection = document.createElement('div');
    aReverseCheckboxSection.classList.add('plane-panel__reverse-checkbox-section');
    aPlanePanel.appendChild(aReverseCheckboxSection);

    const aReverseCheckbox = document.createElement('input');
    aReverseCheckbox.classList.add('plane-panel__checkbox-reverse');
    aReverseCheckbox.id = `checkbox-reverse-${this.planeId}`;
    aReverseCheckbox.type = 'checkbox';
    aReverseCheckbox.name = aReverseCheckbox.id;
    aReverseCheckbox.checked = false;
    aReverseCheckbox.onchange = (theEvent: any) => {
      theEvent.preventDefault();
      this.reverse = theEvent.target.checked;
    };

    const anReverseLabel = document.createElement('label');
    anReverseLabel.htmlFor = aReverseCheckbox.id;
    anReverseLabel.innerText = 'Reversed plane';

    aReverseCheckboxSection.appendChild(anReverseLabel);
    aReverseCheckboxSection.appendChild(aReverseCheckbox);

    const aPositionRangeSection = document.createElement('div');
    aPositionRangeSection.classList.add('plane-panel__position-range-section');
    aPlanePanel.appendChild(aPositionRangeSection);

    const aPlanePositionRange = document.createElement('input');
    aPlanePositionRange.classList.add('plane-panel__position-range');
    aPlanePositionRange.id = `position-range-${this.planeId}`;
    aPlanePositionRange.type = 'range';
    aPlanePositionRange.min = '0';
    aPlanePositionRange.max = '100';
    aPlanePositionRange.step = '1';
    aPlanePositionRange.value = `${this.value}`;
    aPlanePositionRange.oninput = (theEvent: any) => {
      theEvent.preventDefault();
      this.value = Number(theEvent.target.value);
    };

    const aPlanePositionPercent = document.createElement('input');
    aPlanePositionPercent.classList.add('plane-panel__position-percent');
    aPlanePositionPercent.id = `position-percent-${this.planeId}`;
    aPlanePositionPercent.type = 'number';
    aPlanePositionPercent.min = '0';
    aPlanePositionPercent.max = '100';
    aPlanePositionPercent.value = `${this.value}`;
    aPlanePositionPercent.oninput = (theEvent: any) => {
      theEvent.preventDefault();
      this.value = Number(theEvent.target.value);
    };

    aPositionRangeSection.appendChild(aPlanePositionRange);
    aPositionRangeSection.appendChild(aPlanePositionPercent);
    aPositionRangeSection.append('%');

    const anDeletePlaneBtn = document.createElement('img');
    anDeletePlaneBtn.classList.add('plane-panel__delete-plane-btn');
    anDeletePlaneBtn.src = '/assets/images/delete.svg';
    anDeletePlaneBtn.alt = 'basket';
    anDeletePlaneBtn.onclick = () => {
      this.deletePlane(this);
    };
    aPlanePanel.appendChild(anDeletePlaneBtn);

    return aPlanePanel;
  }
  deletePlane(thePlane: any) {
    viewPort.clipPlanesManager.removeGlobalClipPlane(thePlane);
    thePlane.planePanel.remove();
  }
}

class SceneGraphToJsTreeConverter extends cadex.ModelData_SceneGraphElementVisitor {
  constructor(theRootNode: any, aJsTree: any, theTextureBasePath: any) {
    super();
    this.jsTreeNodes = [theRootNode];
    this.lastInstance = null;
    this.aJsTree = aJsTree;
    this.ancestors = [];
    this.textureBasePath = theTextureBasePath;
  }
  currentNode() {
    return this.jsTreeNodes[this.jsTreeNodes.length - 1];
  }

  visitPart(thePart: any) {
    const anAncestors = this.ancestors.slice();
    anAncestors.push(thePart);

    const aTreeItem = {
      text: (this.lastInstance && this.lastInstance.name) || thePart.name || 'Unnamed Part',
      type: 'part',
      data: {
        sge: this.lastInstance || thePart,
        ancestors: anAncestors,
        textureBasePath: this.textureBasePath,
      },
    };
    const aNode = this.aJsTree.create_node(this.currentNode(), aTreeItem);
    this.aJsTree.loading_node(aNode);
  }

  visitInstanceEnter(theInstance: any) {
    this.lastInstance = theInstance;
    return true;
  }

  visitInstanceLeave() {
    this.lastInstance = null;
  }

  visitAssemblyEnter(theAssembly: any) {
    this.ancestors.push(theAssembly);
    const aTreeItem = {
      text: (this.lastInstance && this.lastInstance.name) || theAssembly.name || 'Unnamed Assembly',
      type: 'assembly',
      data: {
        sge: this.lastInstance || theAssembly,
        ancestors: this.ancestors.slice(),
      },
    };
    const aNode = this.aJsTree.create_node(this.currentNode(), aTreeItem);
    this.aJsTree.loading_node(aNode);
    this.jsTreeNodes.push(aNode);
    return true;
  }

  visitAssemblyLeave() {
    this.jsTreeNodes.pop();
    this.ancestors.pop();
  }
  getSGEName(theSGE: any) {
    const aLastInstance = this.ancestors.length > 0 && this.ancestors[this.ancestors.length - 1];
    if (aLastInstance && aLastInstance instanceof cadex.ModelData_Instance && aLastInstance.name) {
      return aLastInstance.name;
    }
    return theSGE.name;
  }
}

class SceneDisplayer extends cadex.ModelPrs_Displayer {
  /**
   * @param {cadex.ModelPrs_Scene} theScene
   * @param {string} theFileNodeId
   */
  constructor(theScene: any, theFileNodeId: any, jsTree: any) {
    super();
    this.scene = theScene;
    this.fileNode = jsTree.get_node(theFileNodeId);
    this.displayCounter = 0;
    this.jsTree = jsTree;
  }

  /**
   * @override
   * @param {Array<ModelPrs_View3dObject>} theView3dObjects List of objects to display
   * @param {ModelData_Representation} theRepresentation The presentation which view3d object created for.
   * @param {Array<ModelData_SceneGraphElement>} theAncestors The valid path in scenegraph to the element which displayed.
   * @param {ModelPrs_DisplayMode} theDisplayMode Mode to display with. See also {@link cadex.ModelPrs_DisplayMode ModelPrs_DisplayMode}.
   */
  display(theView3dObjects: any, theRepresentation: any, theAncestors: any, theDisplayMode: any) {
    if (!theView3dObjects) {
      return;
    }
    this.scene.display(theView3dObjects, theDisplayMode);

    // Find corresponding tree node
    let currentJsTreNode = this.fileNode;
    for (let i = 0; i < theAncestors.length; i++) {
      const aCurrentSGE = theAncestors[i];
      let aFound = false;
      for (const aChildrenId of currentJsTreNode.children) {
        const aNode = this.jsTree.get_node(aChildrenId);
        if (aNode.data.sge === aCurrentSGE) {
          currentJsTreNode = aNode;
          aFound = true;
          if (aCurrentSGE instanceof cadex.ModelData_Instance) {
            i++;
            if (aCurrentSGE.reference !== theAncestors[i]) {
              aFound = false;
            }
          }
          break;
        }
      }
      if (!aFound) {
        console.error('Unable to find tree view node by path', theAncestors);
        return;
      }
    }
    // Create bidirectional binding between visual objects and tree node
    currentJsTreNode.data.view3dObjects = theView3dObjects;
    theView3dObjects.forEach((theObj: any) => {
      theObj.treeId = currentJsTreNode.id;
    });
    // Set state to displayed
    this.jsTree.display_node(currentJsTreNode);

    this.displayCounter++;
    if (this.displayCounter % 10 === 0) {
      viewPort.fitAll();
    }
  }
}
class ElementVisitor extends cadex.ModelData_SceneGraphElementVisitor {
  constructor(theTextureBasePath: any) {
    super();
    this.info = '<h3>Information</h3>';
    this.textureBasePath = theTextureBasePath;
  }
  async visitElement(theElement: any) {
    const generalInfo = this.formatKeyValue('Uuid', theElement.uuid) + this.formatKeyValue('Name', theElement.name);
    this.info += this.formatKeyValue('General', generalInfo);

    //this.info += this.formatKeyValue('Appearance', await this.formatAppearance(theElement.appearance, this.textureBasePath));

    const aPropsText = await this.formatPropertyTable(theElement.properties);
    this.info += this.formatKeyValue('Properties', aPropsText);
  }
  async visitPart(thePart: any) {
    await this.visitElement(thePart);
    const aFormatter = new RepresentationFormatter(this.textureBasePath);
    await thePart.acceptRepresentationVisitor(aFormatter);
    this.info += this.formatKeyValue('Representation', aFormatter.str);
  }
  async visitInstanceEnter(theInstance: any) {
    await this.visitElement(theInstance);
    this.info += this.formatKeyValue(
      'Transformation',
      theInstance.transformation
        ?.toString()
        ?.split(/\n/g)
        ?.map((row: any) => `<span>${row}</span><br>`)
        ?.join('')
    );
  }
  async visitAssemblyEnter(theAssembly: any) {
    return this.visitElement(theAssembly);
  }
  formatKeyValue(theKey: any, theValue: any) {
    if (String(theValue).indexOf('<') === -1) {
      theValue = `<span>${theValue}</span>`;
    }
    return `<div class="info-row"><div class="info-name">${theKey}:</div><div class="info-value">${theValue}</div></div>`;
  }
  formatEnumValue(theEnum: any, theValue: any) {
    return Object.keys(theEnum).find((v) => theEnum[v] === theValue);
  }
  async formatAppearance(theAppearance: any, theTextureBasePath: any) {
    if (!theAppearance) {
      return null;
    }
    const formatColor = (theColor: any) => {
      return `<span class="colored-square" style="background:rgba${theColor}"></span><span>${theColor}</span>`;
    };
    let aString = this.formatKeyValue('Uuid', theAppearance.uuid);
    aString += this.formatKeyValue('Name', theAppearance.name);
    if (theAppearance.material) {
      let aMapString = this.formatKeyValue('Uuid', theAppearance.material.uuid);
      aMapString += this.formatKeyValue('Name', theAppearance.material.name);
      aMapString += this.formatKeyValue('Ambient', formatColor(theAppearance.material.ambientColor));
      aMapString += this.formatKeyValue('Diffuse', formatColor(theAppearance.material.diffuseColor));
      aMapString += this.formatKeyValue('Specular', formatColor(theAppearance.material.specularColor));
      aMapString += this.formatKeyValue('Emissive', formatColor(theAppearance.material.emissiveColor));
      aMapString += this.formatKeyValue('Shininess', theAppearance.material.shininess);
      aString += this.formatKeyValue('Material', aMapString);
    }
    if (theAppearance.genericColor) {
      let aColorString = this.formatKeyValue('Uuid', theAppearance.genericColor.uuid);
      aColorString += this.formatKeyValue('Name', theAppearance.genericColor.name);
      aColorString += this.formatKeyValue('Value', formatColor(theAppearance.genericColor));
      aString += this.formatKeyValue('Color', aColorString);
    }

    if (theAppearance.textureSet) {
      const aFormatter = new TextureFormatter(theTextureBasePath);
      let aTextureSetString = this.formatKeyValue('Uuid', theAppearance.textureSet.uuid);
      aTextureSetString += this.formatKeyValue('Name', theAppearance.textureSet.name);

      await theAppearance.textureSet.accept(aFormatter);
      aString += this.formatKeyValue('TextureSet', aTextureSetString + aFormatter.str);
    }
    return aString;
  }
  async formatPropertyTable(thePropertyTable: any) {
    if (!thePropertyTable) {
      return null;
    }
    const aProperties = await thePropertyTable.properties();
    let aString = '';
    Object.keys(aProperties).forEach((thePropName) => {
      aString += this.formatKeyValue(thePropName, aProperties[thePropName]);
    });
    return aString;
  }
}
class TextureFormatter extends cadex.ModelData_TextureVisitor {
  constructor(theTextureBasePath: any) {
    super();
    this.str = '';
    this.textureBasePath = theTextureBasePath;
  }

  formatTexture(theTexture: any) {
    this.str += this.formatKeyValue('Name', theTexture.name);
    this.str += this.formatKeyValue('Uuid', theTexture.uuid);
    this.str += this.formatKeyValue('Type', this.formatEnumValue(cadex.ModelData_TextureType, theTexture.type));
    let aParametersStr = null;
    if (theTexture.parameters) {
      aParametersStr = this.formatKeyValue('Generate mipmaps', theTexture.parameters.generateMipmaps);
      aParametersStr += this.formatKeyValue('Magnification Filter', this.formatEnumValue(cadex.ModelData_TextureMagnificationFilter, theTexture.parameters.magnificationFilter));
      aParametersStr += this.formatKeyValue('Minification Filter', this.formatEnumValue(cadex.ModelData_TextureMinificationFilter, theTexture.parameters.minificationFilter));
      aParametersStr += this.formatKeyValue(
        'Wrap Mode',
        `(${this.formatEnumValue(cadex.ModelData_TextureWrapMode, theTexture.parameters.wrapModeU)}, ${this.formatEnumValue(cadex.ModelData_TextureWrapMode, theTexture.parameters.wrapModeV)})`
      );
      aParametersStr += this.formatKeyValue('Blend mode', this.formatEnumValue(cadex.ModelData_TextureBlendMode, theTexture.parameters.blendMode));
      aParametersStr += this.formatKeyValue('Mapping mode', this.formatEnumValue(cadex.ModelData_TextureMappingMode, theTexture.parameters.mappingMode));
      aParametersStr += this.formatKeyValue('Rotation', theTexture.parameters.rotation);
      aParametersStr += this.formatKeyValue('Scale', `(${theTexture.parameters.scaleU.toFixed(2)}, ${theTexture.parameters.scaleV.toFixed(2)})`);
      aParametersStr += this.formatKeyValue('Translation', `(${theTexture.parameters.translationU.toFixed(2)}, ${theTexture.parameters.translationV.toFixed(2)})`);
    }
    this.str += this.formatKeyValue('Parameters', aParametersStr);
  }
  async visitFileTexture(theFileTexture: any) {
    this.str += '<i>File Texture</i>';
    this.formatTexture(theFileTexture);
    // Considered the path is relative
    this.str += this.formatKeyValue(
      'FilePath',
      `<img width="200" height="200" src="${this.textureBasePath}/${theFileTexture.filePath}">
                                            <br>${theFileTexture.filePath}`
    );
  }
  async visitPixMapTexture(thePixMapTexture: any) {
    this.str += '<i>PixMap Texture</i>';
    this.formatTexture(thePixMapTexture);
    let aPixMapStr = null;
    const aPixMap = await thePixMapTexture.pixmap();
    if (aPixMap) {
      aPixMapStr = this.formatKeyValue('PixelFormat', this.formatEnumValue(cadex.ModelData_PixelFormat, aPixMap.pixelFormat));
      aPixMapStr += this.formatKeyValue('Width', aPixMap.width);
      aPixMapStr += this.formatKeyValue('Height', aPixMap.height);
      aPixMapStr += this.formatKeyValue('Data', aPixMap.pixelData.byteLength + ' bytes');
    }
    this.str += this.formatKeyValue('PixMap', aPixMapStr);
  }
}

class RepresentationFormatter extends cadex.ModelData_RepresentationVisitor {
  constructor(theTextureBasePath: any) {
    super();
    this.str = '';
    this.textureBasePath = theTextureBasePath;
    this.exploreSubShapes = false;
  }
  /**
   * @param {cadex.ModelData_BRepRepresentation} theBRepRep
   */
  async visitBRepRepresentation(theBRepRep: any) {
    this.str += '<i>BRep Representation</i>';
    this.str += this.formatKeyValue('Uuid', theBRepRep.uuid);
    this.str += this.formatKeyValue('Name', theBRepRep.name);
    let aBodiesStr = '';
    const aBodyList = await theBRepRep.bodyList();
    for (let i = 0; i < aBodyList.size(); i++) {
      const aBody = aBodyList.element(i);
      const aBodyTypeStr = this.formatEnumValue(cadex.ModelData_BodyType, aBody.bodyType);
      if (this.exploreSubShapes) {
        let aSubShapeStr = '';
        for (const aShape of aBody) {
          aSubShapeStr += this.visitShape(aShape);
        }
        aBodiesStr += this.formatKeyValue(`${aBodyTypeStr} body`, aSubShapeStr);
      } else {
        aBodiesStr += this.formatKeyValue(`Body ${i + 1}`, aBodyTypeStr);
      }
    }
    this.str += this.formatKeyValue('Bodies', aBodiesStr);
  }

  /**
   * @param {cadex.ModelData_Shape} theShape
   * @returns {string}
   */
  visitShape(theShape: any) {
    const aShapeType = Object.keys(cadex.ModelData_ShapeType).find((theKey) => cadex.ModelData_ShapeType[theKey] === theShape.type);
    let aShapeStr = '';
    if (theShape.type === cadex.ModelData_ShapeType.Vertex) {
      aShapeStr += theShape.point;
    } else {
      for (const aShape of theShape) {
        aShapeStr += this.visitShape(aShape);
      }
    }
    return this.formatKeyValue(aShapeType, aShapeStr);
  }

  /**
   * @param {cadex.ModelData_PolyRepresentation} thePolyRep
   */
  async visitPolyRepresentation(thePolyRep: any) {
    this.str += '<i>Poly Representation</i>';
    this.str += this.formatKeyValue('Uuid', thePolyRep.uuid);
    this.str += this.formatKeyValue('Name', thePolyRep.name);
    const aPolyShapeList = await thePolyRep.polyShapeList();
    for (let i = 0; i < aPolyShapeList.size(); i++) {
      const aPolyShape = aPolyShapeList.element(i);
      if (aPolyShape instanceof cadex.ModelData_IndexedTriangleSet) {
        let anITSStr = this.formatKeyValue('Uuid', aPolyShape.uuid);
        anITSStr += this.formatKeyValue('Name', aPolyShape.name);
        anITSStr += this.formatKeyValue('Triangles', aPolyShape.numberOfFaces());
        anITSStr += this.formatKeyValue('Vertices', `[${aPolyShape.numberOfVertices()} items]`);
        anITSStr += this.formatKeyValue('Normals', aPolyShape.hasNormals() ? `[${aPolyShape.numberOfNormals()} items]` : null);
        anITSStr += this.formatKeyValue('Colors', aPolyShape.hasColors() ? `[${aPolyShape.numberOfColors()} items]` : null);
        anITSStr += this.formatKeyValue('UVCoordinates', aPolyShape.hasUVCoordinates() ? `[${aPolyShape.numberOfUVCoordinates()} items]` : null);
        anITSStr += this.formatKeyValue('Appearance', await this.formatAppearance(aPolyShape.appearance, this.textureBasePath));
        this.str += this.formatKeyValue(`Triangle Set ${i + 1}`, anITSStr);
      } else if (aPolyShape instanceof cadex.ModelData_PolyLineSet) {
        let aPLSStr = this.formatKeyValue('Uuid', aPolyShape.uuid);
        aPLSStr += this.formatKeyValue('Name', aPolyShape.name);
        aPLSStr += this.formatKeyValue('Polylines', aPolyShape.numberOfPolylines());
        aPLSStr += this.formatKeyValue('Vertices', `[${aPolyShape.numberOfVertices()} items]`);
        aPLSStr += this.formatKeyValue('Colors', aPolyShape.hasColors() ? `[${aPolyShape.numberOfColors()} items]` : null);
        aPLSStr += this.formatKeyValue('Appearance', await this.formatAppearance(aPolyShape.appearance, this.textureBasePath));
        this.str += this.formatKeyValue(`Polyline Set ${i + 1}`, aPLSStr);
      } else if (aPolyShape instanceof cadex.ModelData_PolyPointSet) {
        let aPPSStr = this.formatKeyValue('Uuid', aPolyShape.uuid);
        aPPSStr += this.formatKeyValue('Name', aPolyShape.name);
        aPPSStr += this.formatKeyValue('Vertices', `[${aPolyShape.numberOfVertices()} items]`);
        aPPSStr += this.formatKeyValue('Colors', aPolyShape.hasColors() ? `[${aPolyShape.numberOfColors()} items]` : null);
        aPPSStr += this.formatKeyValue('Appearance', await this.formatAppearance(aPolyShape.appearance, this.textureBasePath));
        this.str += this.formatKeyValue(`Point Set ${i + 1}`, aPPSStr);
      }
    }
  }
}

export const CliPlaneAxis = { x: 'x', y: 'y', z: 'z' };
export let theClipPlaneIndex = 0;
export let viewPort: any;
export const aJSTreeConfig = {
  core: {
    multiple: true,
    check_callback: true,
    themes: {
      name: 'null',
      dots: true,
    },
  },
  types: {
    file: {
      icon: 'icon-file',
    },
    assembly: {
      icon: 'icon-assembly',
    },
    instance: {
      icon: 'icon-instance',
    },
    part: {
      icon: 'icon-part',
    },
    pmi: {
      icon: 'icon-pmi',
    },
    'pmi-element': {
      icon: 'icon-pmi-element',
    },
  },
  plugins: ['wholerow', 'types', 'sgestates'],
};
