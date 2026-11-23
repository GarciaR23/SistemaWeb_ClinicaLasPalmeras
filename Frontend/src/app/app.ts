import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FeedbackPopup } from './shared/components/feedback-popup/feedback-popup';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FeedbackPopup],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
