import React from 'react';
import { Dimensions, Text } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { AppPage, ActionButton, StatusBadge } from '../src/components/DesignWidgets';
import { AppStoreProvider } from '../src/state/AppStoreContext';
import { makeStore } from '../test-utils/store';
describe('Additional design widget coverage', () => {
  const originalWindow = Dimensions.get('window');
  afterEach(() => {
    Dimensions.set({
      window: originalWindow,
      screen: originalWindow,
    });
    jest.restoreAllMocks();
  });
  test('renders a narrow phone layout with side content', async () => {
    Dimensions.set({
      window: { ...originalWindow, width: 280, height: 600 },
      screen: { ...originalWindow, width: 280, height: 600 },
    });
    await render(
      <AppPage title="Today" side={<Text>Side panel</Text>}>
        <Text>Main panel</Text>
      </AppPage>
    );
    expect(screen.getByText('Main panel')).toBeTruthy();
    expect(screen.getByText('Side panel')).toBeTruthy();
  });
  test('renders a wide tablet layout with side content', async () => {
    Dimensions.set({
      window: { ...originalWindow, width: 1000, height: 800 },
      screen: { ...originalWindow, width: 1000, height: 800 },
    });
    await render(
      <AppPage title="Today" side={<Text>Tablet side</Text>}>
        <Text>Tablet main</Text>
      </AppPage>
    );
    expect(screen.getByText('Tablet main')).toBeTruthy();
    expect(screen.getByText('Tablet side')).toBeTruthy();
  });
  test('supports enlarged app text on a tablet', async () => {
    Dimensions.set({
      window: { ...originalWindow, width: 1000, height: 800 },
      screen: { ...originalWindow, width: 1000, height: 800 },
    });
    const store = await makeStore();
    store.setTextScale(2);
    await render(
      <AppStoreProvider store={store}>
        <AppPage title="Today" side={<Text>Accessible side</Text>}>
          <Text>Accessible main</Text>
        </AppPage>
      </AppStoreProvider>
    );
    expect(screen.getByText('Accessible main')).toBeTruthy();
    expect(screen.getByText('Accessible side')).toBeTruthy();
  });
  test('supports outlined action buttons', async () => {
    const onPress = jest.fn();
    await render(
      <ActionButton
        label="Outlined action"
        variant="outlined"
        onPress={onPress}
      />
    );
    fireEvent.press(screen.getByLabelText('Outlined action'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
  test('uses the default badge for unknown statuses', async () => {
    await render(<StatusBadge status="Unknown" />);
    expect(screen.getByText('Status: Unknown')).toBeTruthy();
  });
  test('shows an empty subtitle for an unknown page title', async () => {
    await render(
      <AppPage title="Custom page">
        <Text>Custom content</Text>
      </AppPage>
    );
    expect(screen.getByText('Custom content')).toBeTruthy();
    expect(screen.getByRole('header', { name: 'Custom page' })).toBeTruthy();
  });
});
