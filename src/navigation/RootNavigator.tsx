import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

import { useTheme } from '../theme/ThemeContext';

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

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function TabIcon({
  emoji, label, focused, color,
}: { emoji: string; label: string; focused: boolean; color: string }) {
  return (
    <View style={[styles.tabIcon, focused && styles.tabIconFocused]}>
      <Text style={{ fontSize: focused ? 22 : 20 }}>{emoji}</Text>
      <Text
        style={[
          styles.tabLabel,
          {
            color: focused ? color : '#B0A8A4',
            fontSize: 10,
            fontWeight: focused ? '600' : '400',
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

function HomeStack() {
  const { theme } = useTheme();
  return (
    <Stack.Navigator id="HomeStack" screenOptions={{ headerShown: false, cardStyle: { backgroundColor: theme.colors.bg } }}>
      <Stack.Screen name="Home" component={HomeScreen} />
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
  const { theme } = useTheme();
  return (
    <Stack.Navigator id="PeopleStack" screenOptions={{ headerShown: false, cardStyle: { backgroundColor: theme.colors.bg } }}>
      <Stack.Screen name="People" component={PeopleScreen} />
      <Stack.Screen name="PersonProfile" component={PersonProfileScreen} />
      <Stack.Screen name="Insights" component={InsightsScreen} />
      <Stack.Screen name="AddPerson" component={AddPersonScreen} options={{ presentation: 'modal' }} />
    </Stack.Navigator>
  );
}

function CreateStack() {
  const { theme } = useTheme();
  return (
    <Stack.Navigator id="CreateStack" screenOptions={{ headerShown: false, cardStyle: { backgroundColor: theme.colors.bg } }}>
      <Stack.Screen name="CreateNudge" component={CreateNudgeScreen} />
      <Stack.Screen name="Routines" component={RoutinesScreen} />
    </Stack.Navigator>
  );
}

function HistoryStack() {
  const { theme } = useTheme();
  return (
    <Stack.Navigator id="HistoryStack" screenOptions={{ headerShown: false, cardStyle: { backgroundColor: theme.colors.bg } }}>
      <Stack.Screen name="History" component={HistoryScreen} />
      <Stack.Screen name="Insights" component={InsightsScreen} />
      <Stack.Screen name="NudgeDetail" component={NudgeDetailScreen} />
    </Stack.Navigator>
  );
}

function MeStack() {
  const { theme } = useTheme();
  return (
    <Stack.Navigator id="MeStack" screenOptions={{ headerShown: false, cardStyle: { backgroundColor: theme.colors.bg } }}>
      <Stack.Screen name="Me" component={MeScreen} />
      <Stack.Screen name="Insights" component={InsightsScreen} />
      <Stack.Screen name="Routines" component={RoutinesScreen} />
      <Stack.Screen name="AllNudges" component={AllNudgesScreen} />
      <Stack.Screen name="NudgeDetail" component={NudgeDetailScreen} />
    </Stack.Navigator>
  );
}

export function RootNavigator() {
  const { theme } = useTheme();
  const { colors, shadows } = theme;

  const navTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: colors.bg,
      card: colors.surface,
      text: colors.text,
      border: colors.divider,
      primary: colors.accent,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Tab.Navigator
        id="MainTabs"
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.divider,
            borderTopWidth: 0,
            height: Platform.OS === 'ios' ? 90 : 68,
            paddingBottom: Platform.OS === 'ios' ? 24 : 10,
            elevation: 0,
            shadowColor: '#2D3139',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.04,
            shadowRadius: 12,
          },
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.textTertiary,
          tabBarShowLabel: false,
        }}
      >
        <Tab.Screen
          name="HomeTab"
          component={HomeStack}
          options={{
            tabBarIcon: ({ focused, color }) => (
              <TabIcon emoji="🏡" label="Home" focused={focused} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="PeopleTab"
          component={PeopleStack}
          options={{
            tabBarIcon: ({ focused, color }) => (
              <TabIcon emoji="💛" label="People" focused={focused} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="CreateTab"
          component={CreateStack}
          options={{
            tabBarIcon: () => (
              <View
                style={[
                  styles.createBtn,
                  {
                    backgroundColor: colors.accent,
                    borderRadius: 999,
                    ...shadows.accent,
                  },
                ]}
              >
                <Text style={{ fontSize: 22, color: '#fff' }}>+</Text>
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="HistoryTab"
          component={HistoryStack}
          options={{
            tabBarIcon: ({ focused, color }) => (
              <TabIcon emoji="📖" label="History" focused={focused} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="MeTab"
          component={MeStack}
          options={{
            tabBarIcon: ({ focused, color }) => (
              <TabIcon emoji="🌿" label="Me" focused={focused} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    alignItems: 'center',
    gap: 3,
    paddingTop: 6,
    opacity: 0.7,
  },
  tabIconFocused: {
    opacity: 1,
  },
  tabLabel: { letterSpacing: 0.1 },
  createBtn: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Platform.OS === 'ios' ? 0 : 4,
  },
});
