import {Link} from 'expo-router';
import{StyleSheet} from 'react-native';

import {ThemedText} from '@/components/themed-text';
import {ThemedView} from '@/components/themed-view';
import React from 'react';
import CoursesConetainer from '@/components/courses/coursesContainer';
export default function CourseScreen() {
  return (
    <CoursesConetainer/>
  );
}