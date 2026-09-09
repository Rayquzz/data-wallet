import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({ providedIn: 'root' })
export class AlertService {
  constructor(private messageService: MessageService) {}

  showError(detail: string) {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail,
      sticky: false
    });
  }

  showInfo(detail: string) {
    this.messageService.add({
      severity: 'info',
      summary: 'Info',
      detail,
      sticky: false
    });
  }
}
