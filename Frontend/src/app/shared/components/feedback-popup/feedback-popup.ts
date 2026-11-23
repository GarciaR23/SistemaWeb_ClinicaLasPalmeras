import { Component, HostListener, inject } from '@angular/core';
import { Feedback } from '../../../core/services/feedback';

@Component({
  selector: 'app-feedback-popup',
  standalone: true,
  templateUrl: './feedback-popup.html',
  styleUrl: './feedback-popup.scss',
})
export class FeedbackPopup {
  readonly feedback = inject(Feedback);

  @HostListener('document:keydown.escape') closeOnEscape(): void { this.feedback.close(); }
}
