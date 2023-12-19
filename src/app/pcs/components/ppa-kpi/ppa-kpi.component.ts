import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { PcsService } from '../../services/pcs.service';
import { SharedService } from 'src/app/shared/services/shared.service';

@Component({
  selector: 'app-ppa-kpi',
  templateUrl: './ppa-kpi.component.html',
  styleUrls: ['./ppa-kpi.component.css']
})
export class PpaKpiComponent implements OnInit {

  fb                = inject(FormBuilder)
  messageService    = inject(MessageService)
  pcsService        = inject(PcsService)
  sharedService     = inject(SharedService)

  constructor() { }

  ngOnInit(): void {
    
    this.pcsService.cambiarEstadoBotonNuevo(false)
  }

}
