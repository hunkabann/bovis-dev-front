import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Components PRIMENG
import { MenubarModule } from 'primeng/menubar';
import { SlideMenuModule } from 'primeng/slidemenu';
import { MegaMenuModule } from 'primeng/megamenu';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { TabViewModule } from 'primeng/tabview';
import { ToolbarModule } from 'primeng/toolbar';
import { SplitButtonModule } from 'primeng/splitbutton';
import { ChipModule } from 'primeng/chip';

import { FileUploadModule }  from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { DynamicDialogModule } from 'primeng/dynamicdialog';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MenubarModule,
    SlideMenuModule,
    MegaMenuModule,
    ButtonModule,
    TooltipModule,
    TabViewModule,
    ToolbarModule,
    SplitButtonModule,
    FileUploadModule,
    ToastModule,
    TableModule,
    MessagesModule,
    MessageModule,
    InputNumberModule,
    DropdownModule,
    CalendarModule,
    DialogModule,
    ConfirmDialogModule,
    ConfirmPopupModule,
    DynamicDialogModule,
    ChipModule
  ],
  exports: [
    MenubarModule,
    SlideMenuModule,
    MegaMenuModule,
    ButtonModule,
    TooltipModule,
    TabViewModule,
    ToolbarModule,
    SplitButtonModule,
    FileUploadModule,
    ToastModule,
    TableModule,
    MessagesModule,
    MessageModule,
    InputNumberModule,
    DropdownModule,
    CalendarModule,
    DialogModule,
    ConfirmDialogModule,
    ConfirmPopupModule,
    DynamicDialogModule,
    ChipModule
  ]
})
export class PrimengModule { }
