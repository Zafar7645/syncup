import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Nav } from '@/app/shared/nav/nav';

@Component({
  selector: 'app-kanban',
  imports: [Nav],
  templateUrl: './kanban.html',
})
export class Kanban implements OnInit {
  private route = inject(ActivatedRoute);
  projectId: string | null = null;

  ngOnInit() {
    this.projectId = this.route.snapshot.paramMap.get('id');
  }
}
