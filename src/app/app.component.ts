import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.scss'

})
export class AppComponent implements OnInit {
  title = 'data-wallet';

  constructor(private router: Router) {

  }

  async ngOnInit(): Promise<void> {
    await this.router.navigate(['']);
  }
}
