import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Industry } from '../../models';
import { IndustryService } from '../../services/industry.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-industris',
  templateUrl: './industris.component.html',
  styleUrls: ['./industris.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatButtonModule],
})
export class IndustrisComponent implements OnInit {
  @Input() selectedIndustris: Industry[] = [];
  selectedToAdd: Industry[] = [];
  selectedToRemove: Industry[] = [];
  subscription: Subscription[] = [];
  industriTypeList: Industry[] = [];

  constructor(private industrySvc: IndustryService) {}

  ngOnInit(): void {
    this.subscribeData();
  }

  chosenIndustri(industri: Industry[]) {
    this.selectedToAdd = industri;
  }

  chosenToRemove(industri: Industry[]) {
    this.selectedToRemove = industri;
  }

  assigne() {
    this.selectedIndustris = this.selectedIndustris.concat(this.selectedToAdd);
    this.industriTypeList = this.industriTypeList.filter((item) => {
      return this.selectedIndustris.indexOf(item) < 0;
    });

    this.filterIndustrList();

    this.selectedToAdd = [];
  }

  unassigne() {
    this.industriTypeList = this.industriTypeList.concat(this.selectedToRemove);
    this.selectedIndustris = this.selectedIndustris.filter((selectedCar) => {
      return this.industriTypeList.indexOf(selectedCar) < 0;
    });
    this.filterIndustrList();
    this.selectedToRemove = [];
  }

  private subscribeData() {
    this.subscription['IndustrisComponent:subscribeData'] = this.industrySvc.industrySubject$.subscribe((res) => {
      if (res?.length) {
        this.industriTypeList = res;
        this.filterIndustrList();
        this.subscription['IndustrisComponent:subscribeData']?.unsubscribe();
      } else {
        this.industrySvc.getIndustry();
      }
    });
  }

  private filterIndustrList() {
    this.industriTypeList = this.industriTypeList.filter((x) => this.selectedIndustris.every((el) => el.indTypeId != x.indTypeId));
  }
}
