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
    private reconnectTimeout: number | null = null;
    private onNotificationCallback: ((data: WebSocketMessage) => void) | null = null;
    private onAlertCallback: ((data: WebSocketMessage) => void) | null = null;

    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.onCourseCallback = null;
        this.onConfirmationCallback = null;
        this.reconnectTimeout = null;
        this.onNotificationCallback = null;
        this.onAlertCallback = null;
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
                // ✅ Pour React Native, on utilise des callbacks au lieu de DOM
                if (this.onNotificationCallback) {
                    this.onNotificationCallback(data);
                }
                break;

            case 'course_confirmed':
                if (this.onConfirmationCallback) {
                    this.onConfirmationCallback(data);
                }
                // ✅ Pour React Native, on utilise des callbacks
                if (this.onAlertCallback) {
                    this.onAlertCallback(data);
                }
                break;

            case 'connection_success':
                console.log('🔗 ' + data.message);
                break;

            default:
                console.log('📦 Message non géré:', data);
        }
    }

    // ✅ SUPPRIMÉ: Les méthodes avec document.createElement (incompatibles React Native)
    // private showNotification(courseData: WebSocketMessage): void { ... }
    // private showInAppNotification(courseData: WebSocketMessage): void { ... }
    // private showConfirmationAlert(data: WebSocketMessage): void { ... }

    private handleReconnection(token: string): void {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`🔄 Tentative de reconnexion ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
            
            this.reconnectTimeout = setTimeout(() => {
                this.connect(token);
            }, 3000 * this.reconnectAttempts); // Backoff exponentiel
        } else {
            console.error('❌ Échec de reconnexion après plusieurs tentatives');
        }
    }

    private async acceptCourse(courseId: number): Promise<void> {
        try {
            // ✅ Pour React Native, utilisez AsyncStorage ou passez le token en paramètre
            // Vous devrez passer le token et chauffeurId depuis votre composant React Native
            console.log('📝 Acceptation de course:', courseId);
            
            // Cette méthode sera appelée depuis votre composant React Native
            // avec les données d'authentification
        } catch (error) {
            console.error('❌ Erreur:', error);
        }
    }

    disconnect(): void {
        if (this.reconnectTimeout !== null) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
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

    // ✅ NOUVELLES MÉTHODES POUR REACT NATIVE
    onNotification(callback: (data: WebSocketMessage) => void): void {
        this.onNotificationCallback = callback;
    }

    onAlert(callback: (data: WebSocketMessage) => void): void {
        this.onAlertCallback = callback;
    }

    // Getter pour le statut de connexion
    getConnectionStatus(): boolean {
        return this.isConnected;
    }

    // ✅ MÉTHODE POUR ACCEPTER UNE COURSE (à appeler depuis React Native)
    async acceptCourseFromApp(courseId: number, authToken: string, chauffeurId: string): Promise<boolean> {
        try {
            const response = await fetch(`http://192.168.1.167:8000/api/courses/${courseId}/confirmer_par_chauffeur/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    chauffeur_id: chauffeurId
                })
            });

            if (response.ok) {
                console.log('✅ Course acceptée avec succès');
                return true;
            } else {
                console.error('❌ Erreur lors de l\'acceptation');
                return false;
            }
        } catch (error) {
            console.error('❌ Erreur:', error);
            return false;
        }
    }
}

// Instance globale
const WebSocketServices = new WebSocketService();
export default WebSocketServices;