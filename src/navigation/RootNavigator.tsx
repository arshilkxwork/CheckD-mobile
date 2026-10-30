import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { navigationRef } from './navigationRef';

import { useTheme } from '../theme/ThemeContext';
import { GlassTabBar } from '../ui/GlassTabBar';

import { HomeScreen } from '../screens/HomeScreen';
import { PeopleScreen } from '../screens/PeopleScreen';
import { CreateNudgeScreen } from '../screens/CreateNudgeScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { MeScreen } from '../screens/MeScreen';
import { PersonProfileScreen } from '../screens/PersonProfileScreen';
import { NudgeDetailScreen } from '../screens/NudgeDetailScreen';
import { ReceiverNudgeScreen } from '../screens/ReceiverNudgeScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { AddPersonScreen } from '../screens/AddPersonScreen';
import { AllNudgesScreen } from '../screens/AllNudgesScreen';
import { InsightsScreen } from '../screens/InsightsScreen';
import { RoutinesScreen } from '../screens/RoutinesScreen';
import { MedicationsScreen } from '../screens/MedicationsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function useStackOptions() {
  const { theme } = useTheme();
  return { headerShown: false, cardStyle: { flex: 1, backgroundColor: theme.c.bg } };
}

function HomeStack() {
  return (
    <Stack.Navigator id="HomeStack" screenOptions={useStackOptions()}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Medications" component={MedicationsScreen} />
      <Stack.Screen name="Insights" component={InsightsScreen} />
      <Stack.Screen name="Routines" component={RoutinesScreen} />
      <Stack.Screen name="AllNudges" component={AllNudgesScreen} />
      <Stack.Screen name="NudgeDetail" component={NudgeDetailScreen} />
      <Stack.Screen name="ReceiverNudge" component={ReceiverNudgeScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
    </Stack.Navigator>
  );
}

function PeopleStack() {
  return (
    <Stack.Navigator id="PeopleStack" screenOptions={useStackOptions()}>
      <Stack.Screen name="People" component={PeopleScreen} />
      <Stack.Screen name="PersonProfile" component={PersonProfileScreen} />
      <Stack.Screen name="NudgeDetail" component={NudgeDetailScreen} />
      <Stack.Screen name="Medications" component={MedicationsScreen} />
      <Stack.Screen name="Insights" component={InsightsScreen} />
      <Stack.Screen name="AddPerson" component={AddPersonScreen} options={{ presentation: 'modal' }} />
    </Stack.Navigator>
  );
}

function CreateStack() {
  return (
    <Stack.Navigator id="CreateStack" screenOptions={useStackOptions()}>
      <Stack.Screen name="CreateNudge" component={CreateNudgeScreen} />
      <Stack.Screen name="Medications" component={MedicationsScreen} />
      <Stack.Screen name="Routines" component={RoutinesScreen} />
    </Stack.Navigator>
  );
}

function HistoryStack() {
  return (
    <Stack.Navigator id="HistoryStack" screenOptions={useStackOptions()}>
      <Stack.Screen name="History" component={HistoryScreen} />
      <Stack.Screen name="Medications" component={MedicationsScreen} />
      <Stack.Screen name="Insights" component={InsightsScreen} />
      <Stack.Screen name="NudgeDetail" component={NudgeDetailScreen} />
    </Stack.Navigator>
  );
}

function MeStack() {
  return (
    <Stack.Navigator id="MeStack" screenOptions={useStackOptions()}>
      <Stack.Screen name="Me" component={MeScreen} />
      <Stack.Screen name="Medications" component={MedicationsScreen} />
      <Stack.Screen name="Insights" component={InsightsScreen} />
      <Stack.Screen name="Routines" component={RoutinesScreen} />
      <Stack.Screen name="AllNudges" component={AllNudgesScreen} />
      <Stack.Screen name="NudgeDetail" component={NudgeDetailScreen} />
    </Stack.Navigator>
  );
}

export function RootNavigator() {
  const { theme } = useTheme();
  const { c } = theme;
  const base = c.isDark ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...base,
    colors: {
      ...base.colors,
      background: c.bg,
      card: c.bg,
      text: c.text,
      border: c.hairline,
      primary: c.accent,
    },
  };

  return (
    <NavigationContainer ref={navigationRef} theme={navTheme}>
      <Tab.Navigator
        id="MainTabs"
        tabBar={(props) => <GlassTabBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tab.Screen name="HomeTab" component={HomeStack} />
        <Tab.Screen name="PeopleTab" component={PeopleStack} />
        <Tab.Screen name="CreateTab" component={CreateStack} />
        <Tab.Screen name="HistoryTab" component={HistoryStack} />
        <Tab.Screen name="MeTab" component={MeStack} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
