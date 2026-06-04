import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../src/theme';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <Text style={styles.emoji}>🔍</Text>
        <Text style={styles.title}>Page not found</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Go to home screen →</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: colors.bg.primary,
  },
  emoji: { fontSize: 48, marginBottom: 16 },
  title: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 20,
    color: colors.text.primary,
    marginBottom: 16,
  },
  link: { marginTop: 16 },
  linkText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 16,
    color: colors.brand.cyan,
  },
});
