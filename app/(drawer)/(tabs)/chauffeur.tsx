import {Link} from 'expo-router';
import{StyleSheet} from 'react-native';

import {ThemedText} from '@/components/themed-text';
import {ThemedView} from '@/components/themed-view';
import ChauffeurContenaire from '@/components/chauffeur/chauffeurContenaire';
export default function ChauffeurScreen() {
  return (
    <ChauffeurContenaire/>
  );
}