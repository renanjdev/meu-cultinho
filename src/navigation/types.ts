/**
 * navigation/types.ts — the single native-stack route map.
 *
 * The web prototype navigated by a route string + a manual back stack
 * (go(route, params) / back). React Navigation's native stack gives us the
 * same model with real Android transitions and a real back stack.
 */
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  AdminHome: undefined;
  AuxHome: undefined;
  YouthList: undefined;
  YouthForm: { id?: string } | undefined;
  YouthDetail: { id: string };
  AuxList: undefined;
  AuxForm: undefined;
  GroupList: undefined;
  GroupForm: undefined;
  Attendance: { group?: string } | undefined;
  History: undefined;
  Reports: undefined;
  Settings: undefined;
};

export type RouteName = keyof RootStackParamList;

export type ScreenProps<T extends RouteName> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

// Makes useNavigation() fully typed everywhere without per-call generics.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
