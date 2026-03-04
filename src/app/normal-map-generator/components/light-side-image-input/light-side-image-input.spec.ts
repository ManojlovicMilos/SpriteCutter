import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LightSideImageInput } from './light-side-image-input';

describe('LightSideImageInput', () => {
  let component: LightSideImageInput;
  let fixture: ComponentFixture<LightSideImageInput>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LightSideImageInput]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LightSideImageInput);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
