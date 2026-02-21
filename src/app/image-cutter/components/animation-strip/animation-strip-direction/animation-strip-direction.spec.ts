import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimationStripDirection } from './animation-strip-direction';

describe('AnimationStripDirection', () => {
  let component: AnimationStripDirection;
  let fixture: ComponentFixture<AnimationStripDirection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnimationStripDirection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnimationStripDirection);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
