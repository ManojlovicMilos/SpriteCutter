import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimationStrip } from './animation-strip';

describe('AnimationStrip', () => {
  let component: AnimationStrip;
  let fixture: ComponentFixture<AnimationStrip>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnimationStrip]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnimationStrip);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
