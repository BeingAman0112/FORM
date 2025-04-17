import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DropdownData, FormListData } from '../Model/model';

@Component({
  selector: 'app-grouped-dropdown',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template:`
  <div class="form-group">
  <i class="far fa-check-circle action-icons"></i>
  <button type="button" class="select-one-btn" (click)="openPopup()">
    {{  placeholder }}
  </button>

  <div *ngIf="getSelectedLabels().length" class="selected-chips">
    <span class="chip" *ngFor="let value of getSelectedLabels()">{{ value }}</span>
  </div>

  <div *ngIf="formGroup.get(fieldName)?.invalid && formGroup.get(fieldName)?.touched" class="error-message">
    This field is required
  </div>

  <div class="popup-backdrop" *ngIf="showPopup">
    <div class="popup-container">
      <div class="popup-header">
        <h3>{{Label}}</h3>
        <button type="button" class="close-btn" (click)="closePopup()">×</button>
      </div>

      <div class="search-container">
        <input
          type="text"
          class="search-input"
          placeholder="Search..."
          [(ngModel)]="searchTerm"
          (input)="onSearch()"
        />
        <button *ngIf="searchTerm" class="clear-search" (click)="clearSearch()">
          ×
        </button>
      </div>

      <div class="popup-content">
        <div class="popup-options">
          <div *ngIf="filteredGroups.length === 0" class="no-results">
            No results found for "{{ searchTerm }}"
          </div>
          <div *ngFor="let groupItem of filteredGroups">
            <strong>{{ groupItem.title }}</strong>
            <ul>
              <li *ngFor="let item of groupItem.items">
                <label *ngIf="isMultiSelect">
                  <input
                    type="checkbox"
                    [value]="item.value"
                    [checked]="isChecked(item.value)"
                    (change)="toggleOption(item.value)" />
                  {{ item.value }}
                </label>
                <span *ngIf="!isMultiSelect" class="single-select-item" (click)="toggleOption(item.value)">
                  {{ item.value }}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div class="popup-footer" *ngIf="isMultiSelect">
          <button type="button" (click)="applyMultiSelect()">Apply</button>
        </div>
      </div>
    </div>
  </div>
</div>

  `,
  styles:`
  .form-group {
  margin-bottom: 1rem;
  position: relative;
}

.select-one-btn {
  padding: 8px 16px;
    font-weight: bold;
    background-color: white;
    border: 1px solid #007bff;
    color: #007bff;
    border-radius: 4px;
    cursor: pointer;
    text-transform: uppercase;

  &:hover {
    border-color: #888;
  }
}

.selected-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;

  .chip {
    background-color: #e0f3ff;
    border: 1px solid #91d5ff;
    padding: 4px 10px;
    border-radius: 14px;
    font-size: 13px;
    color: #007acc;
  }
}

.error-message {
  color: #ff4d4f;
  font-size: 13px;
  margin-top: 4px;
}

.popup-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.popup-container {
  background-color: #fff;
  border-radius: 10px;
  padding: 16px 16px 0;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.25);
  position: relative;
  display: flex;
  flex-direction: column;
  max-height: 80vh;

  @media (max-width: 480px) {
    width: 95%;
    max-width: 100%;
    padding: 12px 12px 0;
    margin: 0 10px;
  }
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;

  h3 {
    font-size: 16px;
    margin: 0;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    color: #555;

    @media (max-width: 480px) {
      font-size: 24px;
      padding: 8px;
      margin: -8px;
    }
  }

  @media (max-width: 480px) {
    padding-bottom: 8px;
    border-bottom: 1px solid #eee;
    margin-bottom: 12px;
  }
}
.action-icons {
  color: #2196F3;
  font-size: 16px;
  text-decoration: none;
  transition: color 0.2s;
  padding: 5px;
  border: none;
  // background-color: rgba(33, 150, 243, 0.1);
}

.search-container {
  position: relative;
  margin-bottom: 12px;

  .search-input {
    width: 100%;
    padding: 8px 30px 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    box-sizing: border-box;

    &:focus {
      outline: none;
      border-color: #007acc;
      box-shadow: 0 0 0 2px rgba(0, 122, 204, 0.2);
    }
  }

  .clear-search {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #999;
    font-size: 16px;
    cursor: pointer;
    padding: 0;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;

    &:hover {
      background-color: #f0f0f0;
      color: #555;
    }
  }

  @media (max-width: 480px) {
    margin-bottom: 10px;

    .search-input {
      padding: 10px 35px 10px 12px;
      font-size: 16px;
    }

    .clear-search {
      right: 10px;
      font-size: 18px;
      width: 24px;
      height: 24px;
    }
  }
}

.popup-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.popup-options {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 10px;
  -webkit-overflow-scrolling: touch;
  max-height: 300px;

  @media (max-width: 480px) {
    max-height: none;
  }

  .no-results {
    padding: 20px 0;
    text-align: center;
    color: #666;
    font-style: italic;
    border-top: 1px solid #eee;
    border-bottom: 1px solid #eee;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;

    li {
      padding: 5px 0;
      cursor: pointer;
      transition: background 0.2s;

      &:hover {
        background-color: #f5f5f5;
      }

      label {
        display: flex;
        align-items: center;
        cursor: pointer;
        font-size: 14px;

        input[type="checkbox"] {
          margin-right: 8px;
        }
      }

      @media (max-width: 480px) {
        padding: 12px 0;
        border-bottom: 1px solid #f0f0f0;

        label {
          font-size: 16px;

          input[type="checkbox"] {
            width: 18px;
            height: 18px;
            margin-right: 12px;
          }
        }
      }
    }
  }

  strong {
    display: block;
    margin-top: 10px;
    font-size: 14px;
    font-weight: Bolder;
    color: black;
  }
  .single-select-item {
    display: block;
    width: 95%;
    padding: 1px 2px;
    cursor: pointer;

    @media (max-width: 480px) {
      padding: 12px 0;
      font-size: 16px;
    }
  }

}

.popup-footer {
  position: sticky;
  bottom: 0;
  background-color: #fff;
  padding: 12px 16px;
  border-top: 1px solid #eee;
  margin: 0 -16px;
  display: flex;
  justify-content: flex-end;

  @media (max-width: 480px) {
    padding: 12px;
    margin: 0 -12px;
  }

  button {
    background-color: #007acc;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    min-width: 100px;

    &:hover {
      background-color: #005fa3;
    }

    @media (max-width: 480px) {
      padding: 12px 16px;
      font-size: 16px;
      width: 100%;
    }
  }
}

  `,
})
export class GroupedDropdownComponent implements OnInit {
  @Input() Label!: string;
  @Input() formGroup!: FormGroup;
  @Input() fieldName!: string;
  @Input() placeholder: string = 'Select';
  @Input() group!: DropdownData;
  @Input() isMultiSelect: boolean = true;

  showPopup = false;
  selectedOptions: string[] = [];
  searchTerm: string = '';
  filteredGroups: any[] = [];

  ngOnInit() {
    const currentVal = this.formGroup.get(this.fieldName)?.value;
    if (this.isMultiSelect && Array.isArray(currentVal)) {
      this.selectedOptions = [...currentVal];
    } else if (currentVal) {
      this.selectedOptions = [currentVal];
    }
    this.filteredGroups = [...this.group.list];
  }

  openPopup() {
    this.showPopup = true;
    this.formGroup.get(this.fieldName)?.markAsTouched();
    this.filteredGroups = [...this.group.list];
    this.searchTerm = '';
  }

  closePopup() {
    this.showPopup = false;
  }

  isChecked(value: string): boolean {
    return this.selectedOptions.includes(value);
  }

  toggleOption(value: string) {
    if (this.isMultiSelect) {
      if (this.selectedOptions.includes(value)) {
        this.selectedOptions = this.selectedOptions.filter(v => v !== value);
      } else {
        this.selectedOptions.push(value);
      }
    } else {
      this.selectedOptions = [value];
      this.formGroup.get(this.fieldName)?.setValue(value);
      this.closePopup();
    }
  }

  applyMultiSelect() {
    this.formGroup.get(this.fieldName)?.setValue(this.selectedOptions);
    this.closePopup();
  }

  getSelectedLabels(): string[] {
    const allItems = this.group.list.flatMap(g => g.items);
    return allItems
      .filter(item => this.selectedOptions.includes(item.value))
      .map(item => item.value);
  }

  onSearch() {
    if (!this.searchTerm || !this.searchTerm.trim()) {
      this.filteredGroups = [...this.group.list];
      return;
    }

    const term = this.searchTerm.toLowerCase().trim();

    this.filteredGroups = this.group.list.map(group => {
      const filteredItems = group.items.filter((item: any) =>
        (item.value && item.value.toLowerCase().includes(term))
      );

      if (filteredItems.length > 0) {
        return {
          ...group,
          items: filteredItems
        };
      }
      return null;
    }).filter(group => group !== null);
  }

  clearSearch() {
    this.searchTerm = '';
    this.filteredGroups = [...this.group.list];
  }
}
