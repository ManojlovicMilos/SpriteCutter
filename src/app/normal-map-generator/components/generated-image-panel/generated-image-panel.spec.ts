import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneratedImagePanel } from './generated-image-panel';

describe('GeneratedImagePanel', () => {
  let component: GeneratedImagePanel;
  let fixture: ComponentFixture<GeneratedImagePanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeneratedImagePanel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GeneratedImagePanel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
