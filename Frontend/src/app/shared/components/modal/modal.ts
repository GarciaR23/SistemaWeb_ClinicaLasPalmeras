import {
    Component,
    ElementRef,
    HostListener,
    AfterViewInit,
    OnDestroy,
    input,
    output,
    viewChild,
} from '@angular/core';
import { Icon } from '../icono/icono';
@Component({
    selector: 'app-modal',
    styleUrl: './modal.scss',
    imports: [Icon],
    template: `<div class="modal-overlay" (click)="close.emit()">
    <section
      #panel
      class="modal"
      [class.modal-wide]="wide()"
      role="dialog"
      aria-modal="true"
      [attr.aria-label]="title()"
      tabindex="-1"
      (click)="$event.stopPropagation()"
    >
      <div class="modal-head">
        <h2>{{ title() }}</h2>
        <button type="button" class="icon-btn" aria-label="Cerrar diálogo" (click)="close.emit()">
          <app-icon name="close" />
        </button>
      </div>
      <div class="modal-body"><ng-content /></div>
    </section>
  </div>`,
})
export class Modal implements AfterViewInit, OnDestroy {
    title = input('');
    wide = input(false);
    close = output();
    panel = viewChild.required<ElementRef<HTMLElement>>('panel');
    private previous = document.activeElement as HTMLElement | null;
    private overflow = document.body.style.overflow;
    ngAfterViewInit() {
        document.body.style.overflow = 'hidden';
        this.panel().nativeElement.focus();
    }
    ngOnDestroy() {
        document.body.style.overflow = this.overflow;
        this.previous?.focus();
    }
    @HostListener('document:keydown', ['$event']) key(event: KeyboardEvent) {
        if (event.key === 'Escape') this.close.emit();
        if (event.key === 'Tab') {
            const nodes = Array.from(
                this.panel().nativeElement.querySelectorAll<HTMLElement>(
                    'button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),a[href],[tabindex="0"]',
                ),
            );
            const first = nodes[0],
                last = nodes.at(-1);
            if (!first) {
                event.preventDefault();
                return;
            }
            if (
                event.shiftKey &&
                (document.activeElement === first || document.activeElement === this.panel().nativeElement)
            ) {
                event.preventDefault();
                last?.focus();
            } else if (
                !event.shiftKey &&
                (document.activeElement === last || document.activeElement === this.panel().nativeElement)
            ) {
                event.preventDefault();
                first.focus();
            }
        }
    }
}
