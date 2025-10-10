import { Text, View } from 'react-native';

export default function SettingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center'  }}>
      <Text>Seting</Text>
      <View>
        <Text className="flex-1 items-center justify-center bg-primary-500">Je suis le paramettre</Text>
      </View>
    </View>
  );
}
