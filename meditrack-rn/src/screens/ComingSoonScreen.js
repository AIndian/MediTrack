import React from 'react';
import AppText from '../components/AppText';
import { AppPage, Panel } from '../components/DesignWidgets';

export default function ComingSoonScreen({ navigation, route }) {
  const onBack = navigation.canGoBack() ? () => navigation.goBack() : undefined;
  return (
    <AppPage title={route.params?.title ?? route.name} onBack={onBack}>
      <Panel>
        <AppText>This screen is being ported by a teammate.</AppText>
      </Panel>
    </AppPage>
  );
}