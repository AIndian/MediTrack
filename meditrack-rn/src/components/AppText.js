import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { useTextScale } from '../state/AppStoreContext';

export default function AppText({ style, ...props }) {
  const scale = useTextScale();
  const flat = StyleSheet.flatten(style) || {};
  const fontSize = (flat.fontSize ?? 16) * scale;
  const lineHeight = flat.lineHeight ? flat.lineHeight * scale : undefined;
  return <Text {...props} style={[flat, { fontSize, lineHeight }]} />;
}