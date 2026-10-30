import React from 'react';
import { StyleSheet, Text, useWindowDimensions } from 'react-native';
import { useTextScale } from '../state/AppStoreContext';

export default function AppText({ style, ...props }) {
  const appScale = useTextScale();
  const { fontScale } = useWindowDimensions();
  // Use whichever is larger (app setting or phone setting) instead of multiplying both
  const scale = Math.max(appScale, fontScale);
  const flat = StyleSheet.flatten(style) || {};
  const fontSize = (flat.fontSize ?? 16) * scale;
  const lineHeight = flat.lineHeight ? flat.lineHeight * scale : undefined;
  return <Text allowFontScaling={false} {...props} style={[flat, { fontSize, lineHeight }]} />;
}