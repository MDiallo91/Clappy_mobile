import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    ScrollView, 
    Alert,
    StyleSheet 
} from 'react-native';
import webSocketService from '@/services/websocket';

interface CourseData {
    type: string;
    message: string;
    course_id?: number;
    depart?: string;
    destination?: string;
    tarif_estime?: string;
    type_vehicule?: string;
    chauffeur_name?: string;
}

interface Notification {
    id: number;
    type: string;
    message: string;
    courseId?: number;
    timestamp: Date;
}

interface CourseNotificationsProps {
    chauffeurId: string | null;
    authToken: string | null;
}

const CourseNotifications: React.FC<CourseNotificationsProps> = ({ 
    chauffeurId, 
    authToken 
}) => {
    // ✅ TOUS LES HOOKS DOIVENT ÊTRE APPELÉS INCONDITIONNELLEMENT
    const [availableCourses, setAvailableCourses] = useState<CourseData[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [isWebSocketInitialized, setIsWebSocketInitialized] = useState<boolean>(false);

    //  Effet pour gérer la connexion WebSocket
    useEffect(() => {
        // Vérifier si on peut initialiser WebSocket
        if (authToken && chauffeurId && !isWebSocketInitialized) {
            console.log('Initialisation WebSocket');
            
            webSocketService.connect(authToken);
            
            // Configurer les callbacks
            webSocketService.onNewCourse((courseData: CourseData) => {
                setAvailableCourses(prev => [...prev, courseData]);
                addNotification(courseData);
            });

            webSocketService.onCourseConfirmed((confirmationData: CourseData) => {
                setAvailableCourses(prev => 
                    prev.filter(course => course.course_id !== confirmationData.course_id)
                );
                addNotification(confirmationData);
            });

            setIsWebSocketInitialized(true);
        }

        // Nettoyage
        return () => {
            // Ne pas déconnecter immédiatement, laisser le composant parent gérer
        };
    }, [authToken, chauffeurId, isWebSocketInitialized]); // ✅ Dépendances correctes

    // ✅ Effet séparé pour vérifier la connexion
    useEffect(() => {
        if (!isWebSocketInitialized) return;

        const checkConnection = setInterval(() => {
            setIsConnected(webSocketService.getConnectionStatus());
        }, 1000);

        return () => {
            clearInterval(checkConnection);
        };
    }, [isWebSocketInitialized]); //  Dépendance claire

    // Fonction helper - doit être déclarée après tous les hooks
    const addNotification = (data: CourseData) => {
        const newNotification: Notification = {
            id: Date.now(),
            type: data.type || 'unknown',
            message: data.message || 'Nouvelle notification',
            courseId: data.course_id,
            timestamp: new Date()
        };
        
        setNotifications(prev => [newNotification, ...prev.slice(0, 4)]);
        
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
        }, 8000);
    };

    //  Fonction pour accepter une course
    const acceptCourse = async (courseId: number) => {
        try {
            if (!authToken || !chauffeurId) {
                Alert.alert('Erreur', 'Données d\'authentification manquantes');
                return;
            }

            const response = await fetch(
                `http://192.168.1.167:8000/api/courses/${courseId}/confirmer_par_chauffeur/`, 
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify({
                        chauffeur_id: chauffeurId
                    })
                }
            );

            if (response.ok) {
                console.log('✅ Course acceptée avec succès');
                setAvailableCourses(prev => prev.filter(course => course.course_id !== courseId));
                Alert.alert('Succès', 'Course acceptée avec succès!');
            } else {
                console.error('❌ Erreur lors de l\'acceptation');
                Alert.alert('Erreur', 'Impossible d\'accepter la course');
            }
        } catch (error) {
            console.error('❌ Erreur:', error);
            Alert.alert('Erreur', 'Problème de connexion');
        }
    };

    // ✅ Fonction pour supprimer une notification
    const removeNotification = (id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    // ✅ RENDER - aucun hook après ce point
    return (
        <View style={styles.container}>
            Badge de statut de connexion
            <View style={[
                styles.connectionStatus, 
                isConnected ? styles.connected : styles.disconnected
            ]}>
                <Text style={styles.connectionText}>
                    {isConnected ? '🟢 Connecté' : '🔴 Déconnecté'}
                </Text>
            </View>

            {/* Liste des notifications */}
            <View style={styles.notificationsList}>
                {notifications.map(notification => (
                    <View 
                        key={notification.id} 
                        style={[
                            styles.notification,
                            notification.type === 'new_course' ? styles.newCourse : styles.courseConfirmed
                        ]}
                    >
                        <View style={styles.notificationContent}>
                            <Text style={styles.notificationIcon}>
                                {notification.type === 'new_course' ? '🚗' : 'ℹ️'}
                            </Text>
                            <Text style={styles.notificationMessage}>
                                {notification.message}
                            </Text>
                            <TouchableOpacity 
                                style={styles.closeButton}
                                onPress={() => removeNotification(notification.id)}
                            >
                                <Text style={styles.closeButtonText}>×</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </View>

            {/* Liste des courses disponibles */}
            <View style={styles.availableCourses}>
                <Text style={styles.sectionTitle}>
                    📋 Courses Disponibles ({availableCourses.length})
                </Text>
                
                {availableCourses.length === 0 ? (
                    <View style={styles.noCourses}>
                        <Text style={styles.noCoursesText}>
                            Aucune course disponible pour le moment
                        </Text>
                    </View>
                ) : (
                    <ScrollView style={styles.coursesGrid}>
                        {availableCourses.map((course, index) => (
                            <View key={course.course_id || index} style={styles.courseCard}>
                                <View style={styles.courseHeader}>
                                    <Text style={styles.courseType}>
                                        {course.type_vehicule || 'Non spécifié'}
                                    </Text>
                                    <Text style={styles.coursePrice}>
                                        {course.tarif_estime || '0'} GNF
                                    </Text>
                                </View>
                                
                                <View style={styles.courseRoute}>
                                    <View style={styles.routeItem}>
                                        <Text style={styles.routeIcon}>📍</Text>
                                        <Text style={styles.routeText}>
                                            {course.depart || 'Non spécifié'}
                                        </Text>
                                    </View>
                                    <View style={styles.routeItem}>
                                        <Text style={styles.routeIcon}>🎯</Text>
                                        <Text style={styles.routeText}>
                                            {course.destination || 'Non spécifié'}
                                        </Text>
                                    </View>
                                </View>
                                
                                {course.course_id && (
                                    <TouchableOpacity 
                                        style={styles.acceptButton}
                                        onPress={() => acceptCourse(course.course_id!)}
                                    >
                                        <Text style={styles.acceptButtonText}>
                                            ✅ Accepter la Course
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        ))}
                    </ScrollView>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    connectionStatus: {
        padding: 8,
        borderRadius: 20,
        marginBottom: 15,
        alignItems: 'center',
    },
    connected: {
        backgroundColor: '#d4edda',
    },
    disconnected: {
        backgroundColor: '#f8d7da',
    },
    connectionText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    notificationsList: {
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 1000,
        maxWidth: 300,
    },
    notification: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 12,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    newCourse: {
        borderLeftWidth: 4,
        borderLeftColor: '#28a745',
    },
    courseConfirmed: {
        borderLeftWidth: 4,
        borderLeftColor: '#6c757d',
    },
    notificationContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    notificationIcon: {
        fontSize: 18,
        marginRight: 10,
    },
    notificationMessage: {
        flex: 1,
        fontSize: 14,
    },
    closeButton: {
        padding: 4,
    },
    closeButtonText: {
        fontSize: 18,
        color: '#6c757d',
    },
    availableCourses: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    noCourses: {
        alignItems: 'center',
        padding: 40,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
    },
    noCoursesText: {
        color: '#6c757d',
        fontSize: 16,
    },
    coursesGrid: {
        flex: 1,
    },
    courseCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    courseHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    courseType: {
        backgroundColor: '#007bff',
        color: 'white',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        fontSize: 12,
        fontWeight: 'bold',
        overflow: 'hidden',
    },
    coursePrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#28a745',
    },
    courseRoute: {
        marginBottom: 15,
    },
    routeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    routeIcon: {
        fontSize: 16,
        marginRight: 8,
    },
    routeText: {
        fontSize: 14,
    },
    acceptButton: {
        backgroundColor: '#28a745',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    acceptButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default CourseNotifications;