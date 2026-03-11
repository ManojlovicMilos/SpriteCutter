import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class LoadingService {
    public isLoading = signal(false);

    public toggle(value: boolean): void {
        this.isLoading.set(value);
    }
}
