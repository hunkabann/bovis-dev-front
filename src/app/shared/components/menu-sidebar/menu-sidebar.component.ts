import { Component, OnInit, inject } from '@angular/core';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-menu-sidebar',
  templateUrl: './menu-sidebar.component.html',
  styleUrls: ['./menu-sidebar.component.css'],
})
export class MenuSidebarComponent implements OnInit {

  userService = inject(UserService)

  constructor() {}

  ngOnInit(): void {}
}
