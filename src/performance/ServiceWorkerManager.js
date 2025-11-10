// ================================
// SERVICE WORKER MANAGER
// Register and manage service worker
// Performance Optimization - Fase 3
// ================================

class ServiceWorkerManager {
    constructor() {
        this.registration = null;
        this.updateAvailable = false;

        this.callbacks = {
            onUpdateAvailable: null,
            onOfflineReady: null,
            onError: null
        };
    }

    /**
     * Register service worker
     */
    async register() {
        if (!('serviceWorker' in navigator)) {
            console.warn('Service Workers not supported');
            return false;
        }

        try {
            console.log('📦 Registering service worker...');

            // Detect if running on GitHub Pages or localhost
            const isGitHubPages = window.location.hostname === 'yesidanacona-ag.github.io';
            const baseUrl = isGitHubPages ? '/abckidslearning' : '';

            this.registration = await navigator.serviceWorker.register(`${baseUrl}/sw.js`, {
                scope: `${baseUrl}/`
            });

            console.log('✅ Service worker registered with scope:', `${baseUrl}/`);

            // Listen for updates
            this.listenForUpdates();

            // Check for updates periodically (every hour)
            setInterval(() => {
                this.checkForUpdates();
            }, 60 * 60 * 1000);

            // Notify when offline-ready
            if (this.registration.active) {
                this.notifyOfflineReady();
            }

            return true;
        } catch (error) {
            console.error('❌ Service worker registration failed:', error);
            if (this.callbacks.onError) {
                this.callbacks.onError(error);
            }
            return false;
        }
    }

    /**
     * Listen for service worker updates
     */
    listenForUpdates() {
        if (!this.registration) return;

        // Update found
        this.registration.addEventListener('updatefound', () => {
            const newWorker = this.registration.installing;

            newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // New version available
                    console.log('🔄 New version available!');
                    this.updateAvailable = true;

                    if (this.callbacks.onUpdateAvailable) {
                        this.callbacks.onUpdateAvailable();
                    }
                }

                if (newWorker.state === 'activated') {
                    console.log('✅ Service worker activated');
                }
            });
        });

        // Controller changed (new SW took over)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('🔄 Controller changed, reloading...');
            window.location.reload();
        });
    }

    /**
     * Check for service worker updates
     */
    async checkForUpdates() {
        if (!this.registration) return;

        try {
            await this.registration.update();
        } catch (error) {
            console.error('Failed to check for updates:', error);
        }
    }

    /**
     * Activate waiting service worker
     */
    activateUpdate() {
        if (!this.registration || !this.registration.waiting) return;

        // Tell waiting SW to skip waiting and activate
        this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }

    /**
     * Get service worker version
     */
    async getVersion() {
        if (!navigator.serviceWorker.controller) return null;

        return new Promise((resolve) => {
            const messageChannel = new MessageChannel();

            messageChannel.port1.onmessage = (event) => {
                resolve(event.data.version);
            };

            navigator.serviceWorker.controller.postMessage(
                { type: 'GET_VERSION' },
                [messageChannel.port2]
            );
        });
    }

    /**
     * Clear all caches
     */
    async clearCache() {
        if (!navigator.serviceWorker.controller) return false;

        return new Promise((resolve) => {
            const messageChannel = new MessageChannel();

            messageChannel.port1.onmessage = (event) => {
                resolve(event.data.success);
            };

            navigator.serviceWorker.controller.postMessage(
                { type: 'CLEAR_CACHE' },
                [messageChannel.port2]
            );
        });
    }

    /**
     * Unregister service worker
     */
    async unregister() {
        if (!this.registration) return false;

        try {
            const success = await this.registration.unregister();
            console.log('Service worker unregistered');
            return success;
        } catch (error) {
            console.error('Failed to unregister service worker:', error);
            return false;
        }
    }

    /**
     * Notify that app is ready for offline use
     */
    notifyOfflineReady() {
        console.log('📱 App ready for offline use');

        if (this.callbacks.onOfflineReady) {
            this.callbacks.onOfflineReady();
        }
    }

    /**
     * Set callback for update available
     */
    onUpdateAvailable(callback) {
        this.callbacks.onUpdateAvailable = callback;
    }

    /**
     * Set callback for offline ready
     */
    onOfflineReady(callback) {
        this.callbacks.onOfflineReady = callback;
    }

    /**
     * Set callback for errors
     */
    onError(callback) {
        this.callbacks.onError = callback;
    }

    /**
     * Show update notification to user
     */
    showUpdateNotification() {
        if (!this.updateAvailable) return;

        // Create notification UI
        const notification = document.createElement('div');
        notification.className = 'sw-update-notification';
        notification.innerHTML = `
            <div class="sw-update-content">
                <p>🎉 ¡Nueva versión disponible!</p>
                <button id="sw-update-btn">Actualizar ahora</button>
                <button id="sw-dismiss-btn">Después</button>
            </div>
        `;

        document.body.appendChild(notification);

        // Handle update button
        document.getElementById('sw-update-btn').addEventListener('click', () => {
            this.activateUpdate();
            notification.remove();
        });

        // Handle dismiss button
        document.getElementById('sw-dismiss-btn').addEventListener('click', () => {
            notification.remove();
        });

        // Add CSS if not already present
        this.addUpdateNotificationStyles();
    }

    /**
     * Add CSS for update notification
     */
    addUpdateNotificationStyles() {
        if (document.getElementById('sw-update-styles')) return;

        const style = document.createElement('style');
        style.id = 'sw-update-styles';
        style.textContent = `
            .sw-update-notification {
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: #4CAF50;
                color: white;
                padding: 15px 25px;
                border-radius: 10px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                z-index: 10000;
                animation: slideUp 0.3s ease-out;
            }

            .sw-update-content {
                display: flex;
                align-items: center;
                gap: 15px;
            }

            .sw-update-content p {
                margin: 0;
                font-size: 16px;
            }

            .sw-update-content button {
                padding: 8px 16px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 14px;
                transition: opacity 0.2s;
            }

            #sw-update-btn {
                background: white;
                color: #4CAF50;
                font-weight: bold;
            }

            #sw-dismiss-btn {
                background: rgba(255,255,255,0.2);
                color: white;
            }

            .sw-update-content button:hover {
                opacity: 0.8;
            }

            @keyframes slideUp {
                from {
                    transform: translateX(-50%) translateY(100px);
                    opacity: 0;
                }
                to {
                    transform: translateX(-50%) translateY(0);
                    opacity: 1;
                }
            }

            @media (max-width: 640px) {
                .sw-update-notification {
                    left: 10px;
                    right: 10px;
                    transform: none;
                    bottom: 10px;
                }

                .sw-update-content {
                    flex-direction: column;
                    gap: 10px;
                }
            }
        `;

        document.head.appendChild(style);
    }
}

// Global instance
window.ServiceWorkerManager = ServiceWorkerManager;
