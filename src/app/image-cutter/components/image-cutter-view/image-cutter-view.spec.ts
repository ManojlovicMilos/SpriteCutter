import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageCutterView } from './image-cutter-view';

describe('ImageCutterView', () => {
  let component: ImageCutterView;
  let fixture: ComponentFixture<ImageCutterView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageCutterView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImageCutterView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
