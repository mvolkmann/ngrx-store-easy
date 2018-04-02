import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {HelloDisplayComponent} from './hello-display.component';

describe('HelloDisplayComponent', () => {
  let component: HelloDisplayComponent;
  let fixture: ComponentFixture<HelloDisplayComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [HelloDisplayComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(HelloDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
