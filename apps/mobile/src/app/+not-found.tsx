import { Link } from 'expo-router';
import { Text, View } from '@quilt/ui';
export default function NotFound() {
  return (
    <View className="flex-1 items-center justify-center p-6 gap-4 bg-background">
      <Text variant="heading">This page has wandered off.</Text>
      <Link href="/">
        <Text className="text-primary">Back to your overview →</Text>
      </Link>
    </View>
  );
}
