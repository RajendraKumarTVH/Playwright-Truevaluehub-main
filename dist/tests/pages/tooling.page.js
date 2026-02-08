"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolingPage = void 0;
const BasePage_1 = require("../lib/BasePage");
class ToolingPage extends BasePage_1.BasePage {
    constructor(page, context) {
        super(page, context);
        this.ToolingName = page.locator('select[formcontrolname="toolingNameId"]');
        this.SourceCountry = page.locator('input[formcontrolname="sourceCountryId"]');
        this.ToolLifeNoOfShots = page.locator('select[formcontrolname="toolLifeNoOfShots"]');
        this.NoOfShotsNeededFromTool = page.locator('input[formcontrolname="toolLifeInParts"]');
        this.NoOfDieStages = page.locator('input[formcontrolname="noOfDieStages"]');
        this.NoOfStagesAlong = page.locator('input[formcontrolname="noOfStagesAlong"]');
        this.NoOfStagesAcross = page.locator('input[formcontrolname="noOfStagesAcross"]');
        this.DieSizeLength = page.locator('input[formcontrolname="dieSizeLength"]');
        this.DieSizeWidth = page.locator('input[formcontrolname="dieSizeWidth"]');
        this.DieSetSizeLength = page.locator('input[formcontrolname="dieSetSizeLength"]');
        this.DieSetSizeWidth = page.locator('input[formcontrolname="dieSetSizeWidth"]');
        this.DieSetSizeHeight = page.locator('input[formcontrolname="dieSetSizeHeight"]');
        this.TotalNoOfTools = page.locator('input[formcontrolname="noOfTool"]');
        this.NoOfNewTools = page.locator('input[formcontrolname="noOfNewTool"]');
        this.NoOfSubsequentTools = page.locator('input[formcontrolname="noOfSubsequentTool"]');
        this.NoOfCavity = page.locator('input[formcontrolname="noOfCavity"]');
        this.NoOfCopperElectrodes = page.locator('input[formcontrolname="noOfCopperElectrodes"]');
        this.NoOfGraphiteElectrodes = page.locator('input[formcontrolname="noOfGraphiteElectrodes"]');
        this.CavityLength = page.locator('input[formcontrolname="cavityMaxLength"]');
        this.CavityWidth = page.locator('input[formcontrolname="cavityMaxWidth"]');
        this.MouldType = page.locator('select[formcontrolname="mouldTypeId"]');
        this.MouldSubType = page.locator('select[formcontrolname="mouldSubTypeId"]');
        this.NoOfDrop = page.locator('input[formcontrolname="noOfDrop"]');
        this.MouldCriticality = page.locator('select[formcontrolname="mouldCriticality"]');
        this.SurfaceFinish = page.locator('select[formcontrolname="surfaceFinish"]');
        this.TextureGrade = page.locator('input[formcontrolname="textureGrade"]');
        this.EnvelopeLength = page.locator('input[formcontrolname="envelopLength"]');
        this.EnvelopeWidth = page.locator('input[formcontrolname="envelopWidth"]');
        this.EnvelopeHeight = page.locator('input[formcontrolname="envelopHeight"]');
        this.RunnerGapLength = page.locator('input[formcontrolname="runnerGapLength"]');
        this.RunnerGapWidth = page.locator('input[formcontrolname="runnerGapWidth"]');
        this.SideGapLength = page.locator('input[formcontrolname="sideGapLength"]');
        this.SideGapWidth = page.locator('input[formcontrolname="sideGapWidth"]');
        this.MoldBaseLength = page.locator('input[formcontrolname="moldBaseLength"]');
        this.MoldBaseWidth = page.locator('input[formcontrolname="moldBaseWidth"]');
        this.MoldBaseHeight = page.locator('input[formcontrolname="moldBaseHeight"]');
        this.ExternalSideCores = page.locator('input[formcontrolname="undercutsSideCores"]');
        this.InternalAngularSlides = page.locator('input[formcontrolname="undercutsAngularSlides"]');
        this.UndercutsUnscrewing = page.locator('input[formcontrolname="undercutsUnscrewing"]');
    }
}
exports.ToolingPage = ToolingPage;
