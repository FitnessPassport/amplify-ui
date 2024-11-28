import { Component } from '@angular/core';
import { translate } from '@FitnessPassport/ui';

@Component({
  selector: 'amplify-error',
  templateUrl: './error.component.html',
})
export class ErrorComponent {
  public isVisible = true;
  public dismissAriaLabel = translate('Dismiss alert');

  public close(): void {
    this.isVisible = false;
  }
}
