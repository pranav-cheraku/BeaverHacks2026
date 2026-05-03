import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../src/theme/colors';

function TabIcon({ name, focusedName, focused }: { name: any; focusedName: any; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center', gap: 3 }}>
      <View style={{
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: focused ? Colors.RISO : 'transparent',
      }} />
      <MaterialCommunityIcons
        name={focused ? focusedName : name}
        size={22}
        color={focused ? Colors.INK : Colors.INK_4}
      />
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.INK,
        tabBarInactiveTintColor: Colors.INK_4,
        tabBarStyle: {
          backgroundColor: Colors.PAPER,
          borderTopWidth: 1.5,
          borderTopColor: Colors.INK,
          height: 64,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontFamily: 'JetBrainsMono_400Regular',
          fontSize: 9.5,
          textTransform: 'uppercase',
          letterSpacing: 1.14,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Feed',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="play-circle-outline" focusedName="play-circle" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="topics"
        options={{
          title: 'Topics',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="home-variant-outline" focusedName="home-variant" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen name="research" options={{ href: null }} />
      <Tabs.Screen name="videos" options={{ href: null }} />
      <Tabs.Screen name="search" options={{ href: null }} />
    </Tabs>
  );
}
