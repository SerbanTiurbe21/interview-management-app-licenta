import { Component } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-generalinformation',
  templateUrl: './generalinformation.component.html',
  styleUrls: ['./generalinformation.component.css'],
})
export class GeneralinformationComponent {
  message: string = '';

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {}

  ngOnInit(): void {
    this.message = this.config.data.message;
  }
}
