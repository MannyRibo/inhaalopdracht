import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { NotesComponent }      from './notes/notes.component';
import { NoteDetailComponent }  from './note-detail/note-detail.component';

const routes: Routes = [
  { path: '', redirectTo: '/crud', pathMatch: 'full' },
  { path: 'detail/:id', component: NoteDetailComponent },
  { path: 'crud', component: NotesComponent }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
