import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const primary = "#EE6841";

interface ConfirmeAlertProps {
  visible: boolean;
  onClose?: () => void;
  message?: string;
}

const ConfirmeAlert: React.FC<ConfirmeAlertProps> = ({ 
  visible, 
  onClose,
  message = "Vous avez réservé avec succès ! Veuillez patienter, un chauffeur vient vous chercher."
}) => {
  const scaleValue = useRef(new Animated.Value(0)).current;
  const fadeValue = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      // Animation de pulsation pour l'icône
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );

      // Animation d'entrée
      Animated.parallel([
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
        Animated.timing(fadeValue, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      pulseAnimation.start();

      // Fermeture automatique après 5 secondes
    //   const timer = setTimeout(() => {
    //     if (onClose) onClose();
    //   }, 5000);

    //   return () => {
    //     clearTimeout(timer);
    //     pulseAnimation.stop();
    //   };
    } else {
      // Animation de sortie
      Animated.parallel([
        Animated.timing(scaleValue, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeValue, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const LoadingDots = () => {
    const dot1Anim = useRef(new Animated.Value(0)).current;
    const dot2Anim = useRef(new Animated.Value(0)).current;
    const dot3Anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      if (visible) {
        const animateDots = () => {
          Animated.stagger(200, [
            Animated.timing(dot1Anim, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(dot2Anim, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(dot3Anim, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
          ]).start(() => {
            dot1Anim.setValue(0);
            dot2Anim.setValue(0);
            dot3Anim.setValue(0);
            animateDots();
          });
        };
        animateDots();
      }
    }, [visible]);

    return (
      <View style={styles.loadingDots}>
        <Animated.View 
          style={[
            styles.dot,
            { 
              opacity: dot1Anim,
              transform: [{ scale: dot1Anim }] 
            }
          ]} 
        />
        <Animated.View 
          style={[
            styles.dot,
            { 
              opacity: dot2Anim,
              transform: [{ scale: dot2Anim }] 
            }
          ]} 
        />
        <Animated.View 
          style={[
            styles.dot,
            { 
              opacity: dot3Anim,
              transform: [{ scale: dot3Anim }] 
            }
          ]} 
        />
      </View>
    );
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeValue }]}>
        <Animated.View 
          style={[
            styles.container,
            { 
              transform: [{ scale: scaleValue }],
              opacity: fadeValue 
            }
          ]}
        >
          {/* Icone de succès animée */}
          <View style={styles.iconContainer}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <Ionicons name="checkmark-circle" size={80} color={primary} />
            </Animated.View>
          </View>

          {/* Titre */}
          <Text style={styles.title}>Réservation Confirmée !</Text>

          {/* Message */}
          <Text style={styles.message}>{message}</Text>

          {/* Détails supplémentaires */}
          <View style={styles.detailsContainer}>
            {/* <View style={styles.detailItem}>
              <Ionicons name="time-outline" size={20} color="#666" />
              <Text style={styles.detailText}>Temps d'attente estimé: 5-10 min</Text>
            </View> */}
            <View style={styles.detailItem}>
              <Ionicons name="car-sport-outline" size={20} color={primary} />
              <Text style={styles.detailText}>Votre chauffeur est en route</Text>
            </View>
          </View>

          {/* Bouton de fermeture */}
          <TouchableOpacity 
            style={styles.button}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>Compris</Text>
          </TouchableOpacity>

          {/* Indicateur de chargement */}
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Recherche de chauffeur en cours</Text>
            <LoadingDots />
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    maxWidth: 400,
    width: width - 40,
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: primary,
    textAlign: 'center',
    marginBottom: 15,
  } as const,
  message: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  } as const,
  detailsContainer: {
    width: '100%',
    marginBottom: 25,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  detailText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
  } as const,
  button: {
    backgroundColor: primary,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  } as const,
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
  } as const,
  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 20,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: primary,
    marginHorizontal: 2,
  },
});

export default ConfirmeAlert;