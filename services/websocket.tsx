interface WebSocketMessage {
    type: string;
    message: string;
    course_id?: number;
    depart?: string;
    destination?: string;
    tarif_estime?: string;
    type_vehicule?: string;
    chauffeur_name?: string;
}

class WebSocketService {
    private socket: WebSocket | null = null;
    private isConnected: boolean = false;
    private reconnectAttempts: number = 0;
    private readonly maxReconnectAttempts: number = 5;
    private onCourseCallback: ((data: WebSocketMessage) => void) | null = null;
    private onConfirmationCallback: ((data: WebSocketMessage) => void) | null = null;
    private reconnectTimeout: NodeJS.Timeout | null = null;

    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.onCourseCallback = null;
        this.onConfirmationCallback = null;
        this.reconnectTimeout = null;
    }

    connect(token: string): void {
        try {
            // Fermer la connexion existante
            if (this.socket) {
                this.socket.close();
            }

            // Établir nouvelle connexion
            const wsUrl = `ws://192.168.1.167:8000/ws/chauffeur/?token=${token}`;
            this.socket = new WebSocket(wsUrl);

            this.socket.onopen = () => {
                console.log('✅ Connecté au serveur de notifications');
                this.isConnected = true;
                this.reconnectAttempts = 0;
            };

            this.socket.onmessage = (event: MessageEvent) => {
                try {
                    const data: WebSocketMessage = JSON.parse(event.data);
                    this.handleMessage(data);
                } catch (error) {
                    console.error('❌ Erreur parsing message:', error);
                }
            };

            this.socket.onclose = () => {
                console.log('❌ Déconnecté du serveur');
                this.isConnected = false;
                this.handleReconnection(token);
            };

            this.socket.onerror = (error: Event) => {
                console.error('❌ Erreur WebSocket:', error);
            };

        } catch (error) {
            console.error('❌ Erreur connexion WebSocket:', error);
        }
    }

    private handleMessage(data: WebSocketMessage): void {
        console.log('📨 Notification reçue:', data);

        switch (data.type) {
            case 'new_course':
                if (this.onCourseCallback) {
                    this.onCourseCallback(data);
                }
                this.showNotification(data);
                break;

            case 'course_confirmed':
                if (this.onConfirmationCallback) {
                    this.onConfirmationCallback(data);
                }
                this.showConfirmationAlert(data);
                break;

            case 'connection_success':
                console.log('🔗 ' + data.message);
                break;

            default:
                console.log('📦 Message non géré:', data);
        }
    }

    private showNotification(courseData: WebSocketMessage): void {
        // Notification système du navigateur
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('🚗 Nouvelle Course Disponible', {
                body: `${courseData.depart} → ${courseData.destination}\n💰 ${courseData.tarif_estime} GNF`,
                icon: '/icon.png',
                tag: `course-${courseData.course_id}`
            });
        }

        // Notification dans l'application
        this.showInAppNotification(courseData);
    }

    private showInAppNotification(courseData: WebSocketMessage): void {
        // Créer une notification dans l'UI
        const notification = document.createElement('div');
        notification.className = 'course-notification-alert';
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-header">
                    <span class="icon">🚗</span>
                    <h4>Nouvelle Course</h4>
                    <button class="close-btn">&times;</button>
                </div>
                <div class="course-info">
                    <p><strong>📍 Départ:</strong> ${courseData.depart}</p>
                    <p><strong>🎯 Destination:</strong> ${courseData.destination}</p>
                    <p><strong>💰 Tarif:</strong> ${courseData.tarif_estime} GNF</p>
                    <p><strong>🚙 Type:</strong> ${courseData.type_vehicule}</p>
                </div>
                <div class="notification-actions">
                    <button class="btn-accept" data-course-id="${courseData.course_id}">
                        ✅ Accepter
                    </button>
                    <button class="btn-ignore">
                        ❌ Ignorer
                    </button>
                </div>
            </div>
        `;

        // Ajouter les event listeners
        const closeBtn = notification.querySelector('.close-btn');
        const acceptBtn = notification.querySelector('.btn-accept');
        const ignoreBtn = notification.querySelector('.btn-ignore');

        closeBtn?.addEventListener('click', () => notification.remove());
        ignoreBtn?.addEventListener('click', () => notification.remove());
        acceptBtn?.addEventListener('click', () => {
            const courseId = acceptBtn.getAttribute('data-course-id');
            if (courseId) {
                this.acceptCourse(parseInt(courseId));
            }
            notification.remove();
        });

        document.body.appendChild(notification);

        // Auto-suppression après 10 secondes
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 10000);
    }

    private showConfirmationAlert(data: WebSocketMessage): void {
        // Alerte quand une course est prise par un autre chauffeur
        const alert = document.createElement('div');
        alert.className = 'confirmation-alert';
        alert.innerHTML = `
            <div class="alert-content">
                <span class="icon">ℹ️</span>
                <span>${data.message} - ${data.chauffeur_name}</span>
            </div>
        `;

        document.body.appendChild(alert);
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 5000);
    }

    private handleReconnection(token: string): void {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`🔄 Tentative de reconnexion ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
            
            // this.reconnectTimeout = setTimeout(() => {
            //     this.connect(token);
            // }, 3000 * this.reconnectAttempts); // Backoff exponentiel
        } else {
            console.error(' Échec de reconnexion après plusieurs tentatives');
        }
    }

    private async acceptCourse(courseId: number): Promise<void> {
        try {
            const token = localStorage.getItem('authToken');
            const chauffeurId = localStorage.getItem('chauffeurId');
            
            const response = await fetch(`http://192.168.1.167:8000/api/courses/${courseId}/confirmer_par_chauffeur/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    chauffeur_id: chauffeurId
                })
            });

            if (response.ok) {
                console.log('✅ Course acceptée avec succès');
            } else {
                console.error('❌ Erreur lors de l\'acceptation');
            }
        } catch (error) {
            console.error('❌ Erreur:', error);
        }
    }

    disconnect(): void {
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
        }
        
        if (this.socket) {
            this.socket.close();
            this.socket = null;
            this.isConnected = false;
        }
    }

    // Méthodes pour enregistrer les callbacks
    onNewCourse(callback: (data: WebSocketMessage) => void): void {
        this.onCourseCallback = callback;
    }

    onCourseConfirmed(callback: (data: WebSocketMessage) => void): void {
        this.onConfirmationCallback = callback;
    }

    // Getter pour le statut de connexion
    getConnectionStatus(): boolean {
        return this.isConnected;
    }
}

// Instance globale
const webSocketService = new WebSocketService();
export default webSocketService;