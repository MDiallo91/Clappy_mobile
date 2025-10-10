import { Text, View } from 'react-native';

export default function LogOutcreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center'  }}>
      <Text>Logout</Text>
      <View>
        <Text className="flex-1 items-center justify-center bg-black">Je suis la</Text>
      </View>
    </View>
  );
}
