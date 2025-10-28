import {Link} from 'expo-router';
import{StyleSheet} from 'react-native';

import {ThemedText} from '@/components/themed-text';
import {ThemedView} from '@/components/themed-view';
import ChauffeurContenaire from '@/components/chauffeur/chauffeurContenaire';
import React from 'react';
export default function ChauffeurScreen() {
  return (
    <ChauffeurContenaire/>
  );
}