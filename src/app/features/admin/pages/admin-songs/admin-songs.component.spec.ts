import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminSongsComponent } from './admin-songs.component';

describe('AdminSongsComponent', () => {
  let component: AdminSongsComponent;
  let fixture: ComponentFixture<AdminSongsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminSongsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminSongsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
