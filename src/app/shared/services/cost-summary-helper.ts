import { Injectable } from '@angular/core';
import { SharedService } from 'src/app/modules/costing/services/shared.service';
import { NestingNotesDto, PdfExtractionDto } from '../models/cost-summary.model';
import { PartInfoDto } from '../models';

@Injectable({ providedIn: 'root' })
export class CostSummaryHelper {
  constructor(private readonly sharedService: SharedService) {}

  getSummaryNotes(suggestedCategoryNotes: string, nestingNotes: string, costingNotes: string, partDto?: PartInfoDto): string {
    let aiSuggestedCategoryText = '';
    let nestingNotesText = '';
    let costingNotesText = '';
    if (suggestedCategoryNotes && this.sharedService.isValidJSON(suggestedCategoryNotes)) {
      const suggestedCategoryNotesObject = JSON.parse(suggestedCategoryNotes);
      if (suggestedCategoryNotesObject && suggestedCategoryNotesObject.length > 0) {
        aiSuggestedCategoryText += 'Suggested Category : ';
        aiSuggestedCategoryText += suggestedCategoryNotesObject[0].category ?? '';
      }
    }
    if (nestingNotes && this.sharedService.isValidJSON(nestingNotes)) {
      const nestingNotesObject: NestingNotesDto = JSON.parse(nestingNotes);
      if (nestingNotesObject) {
        nestingNotesText += '<br><br>Nesting Notes';
        nestingNotesText += '<br>Process Type : ';
        nestingNotesText += nestingNotesObject?.processType ?? '';
        nestingNotesText += '<br>Sheet Length : ';
        nestingNotesText += nestingNotesObject?.sheetLength ?? '';
        nestingNotesText += '<br>Sheet Width : ';
        nestingNotesText += nestingNotesObject?.sheetWidth ?? '';
        nestingNotesText += '<br>Count : ';
        nestingNotesText += nestingNotesObject?.count ?? '';
        nestingNotesText += '<br>Smallest Parts : ';
        nestingNotesText += nestingNotesObject?.smallestParts ?? '';
        nestingNotesText += '<br>utilisation : ';
        nestingNotesText += nestingNotesObject?.utilisation ?? '';
        nestingNotesText += '<br>xUtilDim : ';
        nestingNotesText += nestingNotesObject?.xUtilDim ?? '';
        nestingNotesText += '<br>yUtilDim : ';
        nestingNotesText += nestingNotesObject?.yUtilDim ?? '';
      }
    }

    if (costingNotes) {
      const costingNotesObject: PdfExtractionDto = JSON.parse(costingNotes);
      if (costingNotesObject) {
        let manufacturingCategory = costingNotesObject?.manufacturing_category_from_pdf_aux;
        if (manufacturingCategory) {
          costingNotesText += '<br><br>Suggested Category from PDF: ';
          costingNotesText += manufacturingCategory;
        }
        for (const value of costingNotesObject.generic_info ?? []) {
          costingNotesText += `<br>${value?.category ?? ''}:`;
          costingNotesText += '<br>Accuracy : ';
          costingNotesText += `<b>${value?.data?.accuracy?.toString() ?? ''}</b>`;
          if (value.category === 'material' && value.data.colour) {
            costingNotesText += '<br>Colour : ';
            costingNotesText += value?.data.colour?.toString();
          }
          costingNotesText += '<br>Data from PDF : ';
          costingNotesText += `<b>${value?.data?.ml_match?.description ? value?.data?.ml_match?.description : value?.data?.ml_match}</b>`;
          costingNotesText += '<br>Similar Match from DB : ';
          costingNotesText += `<span style="color: var(--esg-tab-green);">${value?.data?.similar_match_from_db ?? ''}</span>`;
        }
        const processGroup = costingNotesObject?.ProcessSteps?.process_group;
        const secondaryProcessSteps = costingNotesObject?.ProcessSteps?.secondary_process_steps;
        const wireHarness = costingNotesObject?.WiringHarness;
        const pcbInfo = costingNotesObject?.PCB;
        if (secondaryProcessSteps) {
          costingNotesText += `<br><br>Secondary Processes Steps: `;
          for (const [key, value] of Object.entries(secondaryProcessSteps)) {
            costingNotesText += `<br>${key}: <b>${value}</b>`;
          }
          costingNotesText += `<br>`;
        }
        if (processGroup) {
          costingNotesText += '<br>Process Group: ';
          costingNotesText += '<br>Group name: ';
          costingNotesText += `<span style="color: var(--esg-tab-green);">${processGroup.name ?? ''}</span>`;
          costingNotesText += '<br>Confidence: ';
          costingNotesText += `<b>${processGroup.confidence ?? ''}</b>`;
          costingNotesText += '<br>Reason: ';
          costingNotesText += processGroup.reason;
        }
        if (wireHarness) {
          costingNotesText += '<br><br>Wire/Cable Harness Info: ';
          const wireHarnessInfo = wireHarness['Drawing number/revision number/part number'];
          if (wireHarnessInfo) {
            costingNotesText += '<br>Drawing number: ';
            costingNotesText += `<b>${wireHarnessInfo?.drawing_number ?? ''}</b>`;
            costingNotesText += '<br>Part number: ';
            costingNotesText += `<b>${wireHarnessInfo?.part_number ?? ''}</b>`;
            costingNotesText += '<br>Revision number: ';
            costingNotesText += `<b>${wireHarnessInfo?.revision_number ?? ''}</b>`;
          }
          const cableHarnessInfos = wireHarness.cableHarnessInfo;
          for (let cableHarnessInfo of cableHarnessInfos) {
            costingNotesText += '<br>------------------------';
            costingNotesText += '<br>Manufacturing part number: ';
            costingNotesText += `<b>${cableHarnessInfo?.manufacturing_part_number ?? ''}</b>`;
            costingNotesText += '<br>Part description: ';
            costingNotesText += `<b>${cableHarnessInfo?.manufacturing_description ?? ''}</b>`;
            costingNotesText += '<br>Quantity: ';
            costingNotesText += `<b>${cableHarnessInfo?.quantity_of_manufacturing_part_number ?? ''}</b>`;
            costingNotesText += '<br>UOM: ';
            costingNotesText += `<b>${cableHarnessInfo?.unit_of_measurement ?? ''}</b>`;
            costingNotesText += '<br>Family: ';
            costingNotesText += `<b>${cableHarnessInfo?.name ?? ''}</b>`;
            costingNotesText += '<br>Confidence: ';
            costingNotesText += `<b>${cableHarnessInfo?.confidence ?? ''}</b>`;
          }
          const technicalReq = wireHarness.technical_req;
          if (technicalReq) {
            costingNotesText += '<br><br>Notes/Technical requirements: ';
            for (let cableHarnesTechReq of technicalReq) {
              costingNotesText += '<br>';
              costingNotesText += `<b>${cableHarnesTechReq ?? ''}</b>`;
            }
          }
        }
        if (pcbInfo) {
          costingNotesText += '<br><br>PCB Info: ';
          costingNotesText += '<br>Depaneling method: ';
          costingNotesText += `<b>${pcbInfo?.depaneling_method ?? ''}</b>`;
          for (const drillingInfo of pcbInfo.drilling_details) {
            costingNotesText += '<br>Drill size: ';
            costingNotesText += `<b>${drillingInfo?.drill_size ?? ''}</b>`;
            costingNotesText += '<br>Drill type: ';
            costingNotesText += `<b>${drillingInfo?.drill_type ?? ''}</b>`;
            costingNotesText += '<br>Hole type: ';
            costingNotesText += `<b>${drillingInfo?.hole_count ?? ''}</b>`;
            costingNotesText += '<br>-------------------------';
          }
          if (pcbInfo?.impedance_control) {
            costingNotesText += '<br>Impedence Control: ';
            costingNotesText += `<b>${pcbInfo?.impedance_control ?? ''}</b>`;
          }
          if (pcbInfo?.ipc_class) {
            costingNotesText += '<br>ipc class: ';
            costingNotesText += `<b>${pcbInfo?.ipc_class ?? ''}</b>`;
          }
          if (pcbInfo?.laminate) {
            for (const [key, value] of Object.entries(pcbInfo.laminate)) {
              costingNotesText += `<br>${key}: <b>${value}</b>`;
            }
            costingNotesText += `<br>`;
          }
          if (pcbInfo?.material) {
            costingNotesText += '<br>Core: ';
            const coreInfo = pcbInfo.material?.core;
            const coreThicknesses = coreInfo?.core_thickness;
            const cores = coreInfo?.cores;
            for (const coreThickness of coreThicknesses) {
              for (const [key, value] of Object.entries(coreThickness)) {
                costingNotesText += `<br>${key}: <b>${value}</b>`;
              }
              costingNotesText += '<br>-------------------------';
            }
            for (const core of cores) {
              for (const [key, value] of Object.entries(core)) {
                costingNotesText += `<br>${key}: <b>${value}</b>`;
              }
              costingNotesText += '<br>-------------------------';
            }
            costingNotesText += `<br>`;

            costingNotesText += '<br>Prepeg: ';
            const prepegInfos = pcbInfo.material?.prepeg;
            for (const prepegInfo of prepegInfos) {
              for (const [key, value] of Object.entries(prepegInfo)) {
                costingNotesText += `<br>${key}: <b>${value}</b>`;
              }
              costingNotesText += '<br>-------------------------';
            }
            costingNotesText += `<br>`;
          }
          costingNotesText += '<br>Number of copper layers: ';
          costingNotesText += `<b>${pcbInfo?.number_of_copper_layers ?? ''}</b>`;
          costingNotesText += '<br>Overall thickness: ';
          costingNotesText += `<b>${pcbInfo?.overall_thickness ?? ''}</b>`;
          costingNotesText += '<br>Pcb dimension: ';
          costingNotesText += `<b>${pcbInfo?.pcb_dimension ?? ''}</b>`;
          if (pcbInfo?.silkscreen) {
            for (const [key, value] of Object.entries(pcbInfo.silkscreen)) {
              costingNotesText += `<br>${key}: <b>${value}</b>`;
            }
            costingNotesText += `<br>`;
          }
          if (pcbInfo?.soldermask) {
            for (const [key, value] of Object.entries(pcbInfo.soldermask)) {
              costingNotesText += `<br>${key}: <b>${value}</b>`;
            }
            costingNotesText += `<br>`;
          }
          costingNotesText += '<br>Stackup technology: ';
          costingNotesText += `<b>${pcbInfo?.stackup_technology ?? ''}</b>`;
          costingNotesText += '<br>Surface finish: ';
          costingNotesText += `<b>${pcbInfo?.surface_finish ?? ''}</b>`;
        }
      }
    } else if (partDto?.documentCollectionDto?.documentRecords?.some((doc) => doc.isSupportingDoc && !doc.deleted)) {
      costingNotesText += '<span style="font-size:10px"><br><I> Costing notes are currently being extracted by AI.<br> Please check back later or refresh the page for updates...</I></span>';
    } else {
      costingNotesText += '<span style="font-size:10px"><br><I> Please upload any supporting document to see costing notes...</I></span>';
    }

    return aiSuggestedCategoryText + nestingNotesText + costingNotesText;
  }
}
