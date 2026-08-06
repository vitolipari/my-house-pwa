import { Injectable, signal } from '@angular/core';

interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
        outcome: 'accepted' | 'dismissed';
        platform: string;
    }>;
    prompt(): Promise<void>;
}

@Injectable({
    providedIn: 'root'
})
export class PwaInstallService {
    readonly canInstall = signal(false);
    readonly isInstalled = signal(this.detectStandaloneMode());

    private deferredPrompt: BeforeInstallPromptEvent | null = null;
    private initialized = false;

    init(): void {
        if (this.initialized) {
            return;
        }

        this.initialized = true;

        window.addEventListener('beforeinstallprompt', (event: Event) => {
            event.preventDefault();
            this.deferredPrompt = event as BeforeInstallPromptEvent;
            this.canInstall.set(!this.isInstalled());
        });

        window.addEventListener('appinstalled', () => {
            this.deferredPrompt = null;
            this.canInstall.set(false);
            this.isInstalled.set(true);
        });

        const displayMode = window.matchMedia('(display-mode: standalone)');
        displayMode.addEventListener('change', ({ matches }) => {
            this.isInstalled.set(matches || this.detectStandaloneMode());

            if (this.isInstalled()) {
                this.canInstall.set(false);
            }
        });
    }

    async install(): Promise<void> {
        const prompt = this.deferredPrompt;

        if (!prompt) {
            return;
        }

        await prompt.prompt();
        const choice = await prompt.userChoice;

        this.deferredPrompt = null;
        this.canInstall.set(false);

        if (choice.outcome === 'accepted') {
            this.isInstalled.set(true);
        }
    }

    private detectStandaloneMode(): boolean {
        const navigatorWithStandalone = navigator as Navigator & {
            standalone?: boolean;
        };

        return window.matchMedia('(display-mode: standalone)').matches
            || navigatorWithStandalone.standalone === true;
    }
}
