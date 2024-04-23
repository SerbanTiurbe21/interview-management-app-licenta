import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pagenotfound',
  templateUrl: './pagenotfound.component.html',
  styleUrls: ['./pagenotfound.component.css'],
})
export class PagenotfoundComponent {
  constructor(private route: Router) {}
  backToHomePage(): void {
    this.route.navigate(['/home']);
  }
}
