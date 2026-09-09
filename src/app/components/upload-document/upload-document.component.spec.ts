import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { UploadDocumentComponent } from './upload-document.component';

describe('DocumentUploadComponent', () => {
  let component: UploadDocumentComponent;
  let fixture: ComponentFixture<UploadDocumentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UploadDocumentComponent],
      imports: [ReactiveFormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(UploadDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('form invalid when empty', () => {
    expect(component.documentForm.valid).toBeFalsy();
  });

  it('form valid when all fields are filled', () => {
    component.documentForm.controls['name'].setValue('Test Doc');
    component.documentForm.controls['description'].setValue('Descriere test');
    component.documentForm.controls['file'].setValue(new File([""], "test.txt"));

    expect(component.documentForm.valid).toBeTruthy();
  });
});
