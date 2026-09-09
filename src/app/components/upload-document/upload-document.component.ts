import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

interface UploadedDocument {
  id: number;
  name: string;
  description: string;
  file: File;
  url: string;
}

@Component({
  selector: 'app-document-upload',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './upload-document.component.html',
  styleUrls: ['./upload-document.component.scss']
})
export class UploadDocumentComponent {
  documentForm: FormGroup;
  uploadedFile: File | null = null;
  fileError: string = '';
  isLoading: boolean = false;

  documents: UploadedDocument[] = [];
  editingDocument: UploadedDocument | null = null;

  constructor(private fb: FormBuilder) {
    this.documentForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input?.files?.length) {
      const file = input.files[0];

      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        this.fileError = 'Fișierul este prea mare. Dimensiunea maximă este 10MB.';
        this.uploadedFile = null;
        input.value = '';
        return;
      }

      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'image/jpeg',
        'image/png'
      ];

      if (!allowedTypes.includes(file.type)) {
        this.fileError = 'Tipul de fișier nu este acceptat. Utilizează PDF, DOC, DOCX, TXT, JPG sau PNG.';
        this.uploadedFile = null;
        input.value = '';
        return;
      }

      this.uploadedFile = file;
      this.fileError = '';
    } else {
      this.uploadedFile = null;
      this.fileError = '';
    }
  }

  isFormValid(): boolean {
    return this.documentForm.valid && (this.uploadedFile !== null || this.editingDocument !== null);
  }

  onSubmit() {
    if (this.isFormValid()) {
      if (this.editingDocument) {
        // actualizare document
        this.editingDocument.name = this.documentForm.get('name')?.value;
        this.editingDocument.description = this.documentForm.get('description')?.value;

        if (this.uploadedFile) {
          this.editingDocument.file = this.uploadedFile;
          this.editingDocument.url = URL.createObjectURL(this.uploadedFile);
        }

        alert(`✏️ Documentul "${this.editingDocument.name}" a fost actualizat!`);
        this.resetForm();
      } else {
        // adăugare document nou
        const newDoc: UploadedDocument = {
          id: Date.now(),
          name: this.documentForm.get('name')?.value,
          description: this.documentForm.get('description')?.value,
          file: this.uploadedFile!,
          url: URL.createObjectURL(this.uploadedFile!)
        };

        this.documents.push(newDoc);
        alert(`✅ Documentul "${newDoc.name}" a fost încărcat cu succes!`);
        this.resetForm();
      }
    }
  }

  editDocument(doc: UploadedDocument) {
    this.editingDocument = doc;
    this.documentForm.patchValue({
      name: doc.name,
      description: doc.description
    });
    this.uploadedFile = null;
  }

  deleteDocument(doc: UploadedDocument) {
    this.documents = this.documents.filter(d => d.id !== doc.id);
  }

  resetForm() {
    this.documentForm.reset();
    this.uploadedFile = null;
    this.fileError = '';
    this.editingDocument = null;
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  getFileSize(file: File): string {
    const bytes = file.size;
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
