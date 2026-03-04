import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NormalMagGeneratorView } from './normal-mag-generator-view';

describe('NormalMagGeneratorView', () => {
  let component: NormalMagGeneratorView;
  let fixture: ComponentFixture<NormalMagGeneratorView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NormalMagGeneratorView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NormalMagGeneratorView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
