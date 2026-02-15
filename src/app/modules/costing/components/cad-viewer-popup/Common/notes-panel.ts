import cadex from '@cadexchanger/web-toolkit';
import { BasePanel } from './base-panel';
import { htmlToElement } from './dom';
import { CommentFieldService } from 'src/app/shared/services/comment-field.service';
import { take } from 'rxjs/operators';
import { CommentFieldModel, CommentFieldPayloadModel } from 'src/app/shared/models/comment-field-model';
import { ScreeName } from 'src/app/modules/costing/costing.config';

export interface CameraState {
  position: cadex.ModelData_Point;
  target: cadex.ModelData_Point;
  up: cadex.ModelData_Direction;
  near: number;
  far: number;
}

/**
 * Represents editable note with 'actives' state.
 */
class Note extends cadex.ModelPrs_Annotation {
  cameraState: CameraState;
  _isEdit: boolean;
  label: string;
  noteId: number; // ExpCustom
  userId: number; // ExpCustom
  userName: string; // ExpCustom

  constructor(thePoint: cadex.ModelData_Point, theSceneNode: cadex.ModelPrs_SceneNode, theCameraState: CameraState) {
    const aPinElement = document.createElement('div');
    const aCardElement = document.createElement('div');

    super({
      position: thePoint,
      sceneNode: theSceneNode,
      markerElement: aPinElement,
      labelElement: aCardElement,
      markerShown: true,
      labelShown: false,
    });

    aPinElement.classList.add('note-pin');
    aCardElement.classList.add('note-card');

    aPinElement.addEventListener('click', () => {
      this.dispatchEvent({ type: 'pinClicked' });
    });

    this.cameraState = theCameraState;

    this.label = '';

    this._isEdit = true;

    this._updateCard();
  }

  get isEdit() {
    return this._isEdit;
  }

  set isEdit(theEdit) {
    if (theEdit !== this._isEdit) {
      this._isEdit = theEdit;
      this._updateCard();
      this.dispatchEvent({ type: 'isEditChanged' });
    }
  }

  get isActive() {
    return this.isLabelShown;
  }

  set isActive(theActive) {
    if (theActive !== this.isLabelShown) {
      this.isLabelShown = theActive;
      this.markerElement.classList.toggle('active', theActive);
      this.dispatchEvent({ type: 'isActiveChanged' });
    }
  }

  private _updateCard() {
    const aLabelElement = this.labelElement as HTMLElement;
    aLabelElement.classList.toggle('editing', this._isEdit);
    if (this._isEdit) {
      aLabelElement.textContent = '';

      const aCardInner = document.createElement('div');
      aCardInner.classList.add('note-card__inner');
      aLabelElement.appendChild(aCardInner);

      const anInput = document.createElement('input');
      anInput.type = 'text';
      anInput.placeholder = 'Write text...';
      anInput.value = this.label;
      anInput.maxLength = 250;
      aCardInner.appendChild(anInput);

      const saveEdit = () => {
        this.label = anInput.value;
        this.isEdit = false;
      };
      const cancelEdit = () => {
        this.isEdit = false;
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

/**
 * Represents collection of notes with one active note.
 */
class NotesManager extends cadex.ModelPrs_MarkersManager {
  listOfNotesDom: HTMLElement;
  temporaryNode: Note | null;
  activeNote: Note | null;

  /** ExpCustom - Begin */
  user: any = JSON.parse(localStorage.getItem('user') || '[]');
  partInfoId: number;
  comments: CommentFieldModel[] = [];
  /** ExpCustom - End */

  constructor(private commentFieldService: CommentFieldService) {
    super();
    this.listOfNotesDom = document.getElementById('notes-container') as HTMLElement;
    this.temporaryNode = null;
    this.activeNote = null;

    this.onNotePinClicked = this.onNotePinClicked.bind(this);
    this.onNoteCardOutsideClicked = this.onNoteCardOutsideClicked.bind(this);
  }

  addTemporaryNote(thePoint: cadex.ModelData_Point, theSceneNode: cadex.ModelPrs_SceneNode) {
    if (!this.viewport) {
      return;
    }

    this.activateNote(null);

    const aCamera = this.viewport.camera;
    const aTemporaryNode = new Note(thePoint, theSceneNode, {
      position: aCamera.position.clone(),
      target: aCamera.target.clone(),
      up: aCamera.up.clone(),
      near: aCamera.near,
      far: aCamera.far,
    });

    this.addMarker(aTemporaryNode);
    this.activateNote(aTemporaryNode);

    const onTemporaryNoteChanged = () => {
      this.temporaryNode = null;

      aTemporaryNode.removeEventListener('isEditChanged', onTemporaryNoteChanged);
      aTemporaryNode.removeEventListener('isActiveChanged', onTemporaryNoteChanged);

      if (aTemporaryNode.label) {
        this.addNote(aTemporaryNode);
        this.activateNote(aTemporaryNode);
      } else {
        aTemporaryNode.isActive = false;
        this.removeMarker(aTemporaryNode);
      }
    };

    aTemporaryNode.addEventListener('isEditChanged', onTemporaryNoteChanged);
    aTemporaryNode.addEventListener('isActiveChanged', onTemporaryNoteChanged);

    this.temporaryNode = aTemporaryNode;
  }

  async activateNote(theNote: Note | null) {
    if (this.activeNote === theNote) {
      return;
    }
    if (this.activeNote) {
      this.activeNote.isActive = false;
      this.activeNote = null;
    }
    if (!theNote) {
      document.removeEventListener('pointerdown', this.onNoteCardOutsideClicked);
      return;
    }
    if (theNote.cameraState && this.viewport) {
      this.viewport.camera.set(theNote.cameraState.position, theNote.cameraState.target, theNote.cameraState.up, theNote.cameraState.near, theNote.cameraState.far);
    }
    theNote.isActive = true;
    this.activeNote = theNote;
    document.addEventListener('pointerdown', this.onNoteCardOutsideClicked);
  }

  addNote(theNote: Note) {
    if (!this.containsMarker(theNote)) {
      this.addMarker(theNote);
    }
    /** ExpCustom - Begin */
    const newNote: CommentFieldPayloadModel = {
      partInfoId: this.partInfoId,
      primaryId: 0,
      screenId: ScreeName.CadDrawing,
      formControlName: 'cadDrawing',
      userName: this.user.firstName + ' ' + this.user.lastName,
      commentText: JSON.stringify({
        text: theNote.label, // text
        point: theNote.position, // actual points
        position: theNote.cameraState.position,
        target: theNote.cameraState.target,
        up: theNote.cameraState.up,
        near: theNote.cameraState.near,
        far: theNote.cameraState.far,
      }),
    };
    this.commentFieldService
      .saveCommentField(newNote)
      .pipe(take(1))
      .subscribe((result: CommentFieldModel) => {
        result && this.comments.push(result);
        this.removeAllMarkers();
        this.loadNotes();
      });
    /** ExpCustom - End */

    theNote.addEventListener('pinClicked', this.onNotePinClicked);

    this.updateNotesList();
  }

  removeNote(theNote: Note) {
    if (!this.containsMarker(theNote)) {
      return;
    }
    this.removeMarker(theNote);

    theNote.removeEventListener('pinClicked', this.onNotePinClicked);

    this.updateNotesList();
  }

  override removeAllMarkers() {
    for (const aMarker of this.markers()) {
      this.removeNote(aMarker as Note);
    }
  }

  onNotePinClicked(theEvent: cadex.ModelPrs_Event<'pinClicked', Note>) {
    this.activateNote(theEvent.target);
  }

  onNoteCardOutsideClicked(theEvent: PointerEvent) {
    if (this.activeNote && (theEvent?.target as HTMLElement | null)?.closest('.note-card') !== this.activeNote.labelElement) {
      this.activateNote(null);
    }
  }

  /**
   * Updates list with notes
   */
  updateNotesList() {
    // Just for demo purpose: clean up all content and re-generate note-cards
    this.listOfNotesDom.innerHTML = '';

    for (const aMarker of this.markers()) {
      const aNote = aMarker as Note;
      const aNoteListElement = document.createElement('div');
      aNoteListElement.classList.add('note-card');
      aNoteListElement.style.display = 'flex';

      const aLabelElement = document.createElement('div');
      aLabelElement.innerHTML = aNote.label;
      aLabelElement.classList.add('note-label');

      /** ExpCustom - Begin */
      const aLabelUserName = document.createElement('span');
      aLabelUserName.innerHTML = ' (' + aNote.userName + ')';
      aLabelUserName.classList.add('note-label-user');
      aLabelElement.appendChild(aLabelUserName);
      /** ExpCustom - End */

      aNoteListElement.appendChild(aLabelElement);

      if (this.user.userId === aNote.userId) {
        // ExpCustom
        const aDeleteButton = document.createElement('img');
        aDeleteButton.src = '/assets/images/delete.svg';
        aDeleteButton.addEventListener('click', (theEvent) => {
          theEvent.stopPropagation();
          this.removeNote(aNote);
          /** ExpCustom - Begin */
          this.commentFieldService
            .deleteCommentField(aNote.noteId)
            .pipe(take(1))
            .subscribe(() => {
              this.comments = this.comments.filter((x) => x.commentId !== aNote.noteId);
            });
          /** ExpCustom - End */
        });
        aNoteListElement.appendChild(aDeleteButton);
      }

      aNoteListElement.addEventListener('click', () => {
        this.activateNote(aNote);
      });

      this.listOfNotesDom.appendChild(aNoteListElement);
    }
  }

  /** ExpCustom - Begin */
  loadNotesFromDb() {
    if (this.partInfoId) {
      const params = {
        partInfoId: this.partInfoId,
        screenId: ScreeName.CadDrawing,
        primaryId: 0,
        formControlName: 'cadDrawing',
      };
      if (this.comments.length > 0) {
        this.removeAllMarkers();
        this.loadNotes();
      } else {
        this.commentFieldService
          .getCommentFieldsByParams(params)
          .pipe(take(1))
          .subscribe((result: CommentFieldModel[]) => {
            this.comments = [...result].reverse();
            this.removeAllMarkers();
            this.loadNotes();
          });
      }
    }
  }

  loadNotes() {
    for (const note of this.comments) {
      const aNode = new cadex.ModelPrs_SceneNode();
      const points = JSON.parse(note.commentText);
      if (points) {
        const aPoint = new cadex.ModelData_Point();
        aPoint.x = points.point.x;
        aPoint.y = points.point.y;
        aPoint.z = points.point.z;

        const aTemporaryNode = new Note(aPoint, aNode, {
          position: points.position,
          target: points.target,
          up: points.up,
          near: points.near,
          far: points.far,
        });
        this.addMarker(aTemporaryNode);
        this.activateNote(aTemporaryNode);
        aTemporaryNode.label = points.text;
        aTemporaryNode.noteId = note.commentId;
        aTemporaryNode.userId = note.modifiedUserId;
        aTemporaryNode.userName = note.userName;
        aTemporaryNode.isEdit = false;
        aTemporaryNode.addEventListener('pinClicked', this.onNotePinClicked);
        this.activateNote(null);
      }
      this.updateNotesList();
    }
  }
  /** ExpCustom - End */
}

class ContextMenuHandler extends cadex.ModelPrs_ContextMenuHandler {
  scene: cadex.ModelPrs_Scene;
  notesManager: NotesManager;
  contextMenuElement: HTMLElement;
  addNoteButton: HTMLDivElement;
  lastContextMenuState: { node: cadex.ModelPrs_SceneNode; point: cadex.ModelData_Point } | null;

  constructor(theScene: cadex.ModelPrs_Scene, theNotesManager: NotesManager) {
    super();
    this.scene = theScene;
    this.notesManager = theNotesManager;

    this.contextMenuElement = document.getElementById('context-menu') as HTMLElement;

    this.addNoteButton = document.createElement('div');
    this.addNoteButton.id = 'add-note-button';
    this.addNoteButton.textContent = 'Add note';
    this.contextMenuElement.appendChild(this.addNoteButton);

    this.lastContextMenuState = null;

    this.addNoteButton.addEventListener('click', () => {
      this.hideContextMenu();

      if (!this.lastContextMenuState) {
        this.notesManager.activateNote(null);
        return;
      }

      // Create temporary note and display it in viewer
      this.notesManager.addTemporaryNote(this.lastContextMenuState.point, this.lastContextMenuState.node);
    });

    // Hide mouse menu by any mouse press
    document.addEventListener('pointerdown', (theEvent) => {
      if ((theEvent?.target as HTMLElement | null)?.closest('.context-menu')) {
        this.hideContextMenu();
      }
    });
  }

  override contextMenu(theEvent: cadex.ModelPrs_PointerInputEvent) {
    const aPosition = theEvent.point.position;
    const aPickResult = this.scene.selectionManager.pickFromViewport(aPosition.x, aPosition.y, theEvent.viewport);
    if (aPickResult && aPickResult.node) {
      this.lastContextMenuState = {
        point: aPickResult.point,
        node: aPickResult.node,
      };
      this.addNoteButton.classList.remove('disabled');
    } else {
      this.lastContextMenuState = null;
      this.addNoteButton.classList.add('disabled');
    }
    this.contextMenuElement.style.display = 'block';
    this.contextMenuElement.style.left = `${aPosition.x + 200}px`;
    this.contextMenuElement.style.top = `${aPosition.y}px`;
  }

  hideContextMenu() {
    this.contextMenuElement.style.display = '';
  }
}

/** @type {Partial<NotePanelConfig>} */
export const NotePanelDefaultConfig = {
  title: 'Notes',
};

export class NotePanel extends BasePanel {
  /**
   * @param {NotePanelConfig} theConfig
   */
  _selectedElements: any;
  viewport: any;
  notesManager: NotesManager;
  scene: any;

  constructor(
    theConfig,
    scene: any,
    viewport: any,
    private commentFieldService: CommentFieldService
  ) {
    const aConfig = /** @type {Required<NotePanelConfig>} */ Object.assign({}, NotePanelDefaultConfig, theConfig);
    super(aConfig);

    this.domElement.classList.add('note-panel');
    this._panelTitle.classList.add('note-panel__title');
    this._panelBody.classList.add('note-panel__body');
    this.clear(scene, viewport);
  }

  async clear(scene: any, viewport: any) {
    await this.loaddata(scene, viewport);
  }

  /**
   * @override
   */
  show() {
    super.show();
    this.notesManager.loadNotesFromDb(); // ExpCustom
  }

  /**
   * @override
   */
  hide() {
    super.hide();
    this.notesManager.removeAllMarkers(); // ExpCustom
  }

  /** @protected */
  async loaddata(scene: any, viewport: any) {
    this.scene = scene;
    this.viewport = viewport;

    this._panelBody.replaceChildren();
    const anUnits = htmlToElement(' <div id="notes-list"><div id="notes-container"></div></div>');
    this._panelBody.append(anUnits);

    // Use custom marker manager with binding to UI elements
    this.notesManager = new NotesManager(this.commentFieldService);
    this.viewport.markerManager = this.notesManager;

    // Enables context menu handling
    const aContextMenuHandler = new ContextMenuHandler(this.scene, this.notesManager);
    this.viewport.inputManager.pushInputHandler(aContextMenuHandler);
  }
}
