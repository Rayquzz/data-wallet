import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
//import {MassaWeb3Service} from '../../services/massa-web3.service';
//import {Credential} from '../../models/credential';

export interface FileInfo {
  fileName: string;
  dateAdded: string;
  fileData: File | null;
  size?: number;
  fileType: string;

  isPreviewVisible?: boolean;
  isSelected?: boolean;
}

@Component({
  selector: 'app-files',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.scss'],
})

export class FilesComponent implements  OnInit{
  fileForm: FormGroup;
  documents: FileInfo[] = [];
  menuOpenIndex: number | null = null;
  editingIndex: number | null = null;
  showForm = false;
  fileError = '';
  searchTerm = '';
  selectedFile: FileInfo | null = null;
  showLoading = false;
  showAddForm = false;

  constructor(private fb: FormBuilder, private router: Router) {
    this.fileForm = this.fb.group({
      fileName: [''],
      fileData: [null, Validators.required]
    });
  }

  ngOnInit() {
    const nav = this.router.getCurrentNavigation();
    if (nav?.extras.state?.['openForm']) {
      this.showAddForm = true;
    }
  }

  closeForm() {
    this.showAddForm = false;
  }

  filteredDocuments() {
    return this.documents.filter(doc =>
      doc.fileName.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  addOrUpdateFile() {
    if (this.fileForm.invalid) {
      this.fileError = 'Please complete all mandatory fields.';
      return;
    }

    const formValue = this.fileForm.value;
    const fileName = formValue.fileName || formValue.fileData?.name || 'Unnamed File';

    const newFile: FileInfo = {
      fileName: fileName,
      fileData: formValue.fileData,
      dateAdded: new Date().toISOString().split('T')[0],
      size: formValue.fileData?.size,
      fileType: this.getFileExtension(formValue.fileData?.name)
    };

    if (this.editingIndex !== null) {
      this.documents[this.editingIndex] = newFile;
    } else {
      this.documents.push(newFile);
    }

    this.toggleForm(null);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.fileForm.patchValue({
        fileName: file.name,
        fileData: file
      });
      this.fileForm.get('fileData')?.updateValueAndValidity();
      this.fileError = '';
    }
  }

  toggleForm(index: number | null) {
    this.showForm = index !== null || !this.showForm;
    if (index !== null) {
      this.editingIndex = index;
      const doc = this.documents[index];
      this.fileForm.patchValue(doc);
    } else {
      this.editingIndex = null;
      this.fileForm.reset();
    }
  }

  getFileExtension(name: string) {
    const parts = name.split('.');
    return parts.length > 1 ? '.' + parts.pop() : '';
  }

  preview(file: File | null): string {
    if (!file) return '';
    return URL.createObjectURL(file);
  }

  getPreviewSrc(): string {
    return (this.selectedFile?.fileData) ? this.preview(this.selectedFile.fileData) : '';
  }

  addDocument() {
    this.toggleForm(null);
  }

  editDocument(index: number) {
    this.toggleForm(index);
  }

  deleteDocument(index: number) {
    this.documents.splice(index, 1);
  }

  toggleMenu(index: number) {
    this.menuOpenIndex = this.menuOpenIndex === index ? null : index;
  }

  toggleDetails(doc: FileInfo) {
    if (this.selectedFile === doc) {
      this.selectedFile = null; // clicking again closes it
    } else {
      this.selectedFile = doc;  // show details
    }
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.doc-menu')) {
      this.menuOpenIndex = null;
    }
  }

    searchFiles() {
    }
}
