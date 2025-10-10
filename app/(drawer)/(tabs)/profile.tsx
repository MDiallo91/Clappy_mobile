import { Text, View } from 'react-native';

export default function ProfileScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center'  }}>
      <Text>Profil</Text>
      <View>
        <Text className="flex-1 items-center justify-center bg-black">Je suis la</Text>
      </View>
    </View>
  );
}
