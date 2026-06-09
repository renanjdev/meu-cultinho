/**
 * navigation/useNav.ts — mirrors the prototype's go(route, params) / back.
 *
 * navigate() (rather than push) means tapping a bottom-nav destination that's
 * already in the stack returns to it instead of piling duplicates, which keeps
 * the tab-like sections behaving sensibly.
 */
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, RouteName } from './types';

export function useNav() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const go = (name: RouteName, params?: Record<string, unknown>) =>
    (navigation.navigate as (n: RouteName, p?: Record<string, unknown>) => void)(name, params);

  const back = navigation.canGoBack() ? () => navigation.goBack() : undefined;

  return { go, back, navigation };
}
