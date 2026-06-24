import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, spacing, Mascot, Button } from '../src/ui';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not Found' }} />
      <View style={styles.container}>
        <Mascot size={120} expr="sad" />
        <Text style={styles.heading}>Page not found</Text>
        <Text style={styles.sub}>This page does not exist.</Text>
        <Link href="/" asChild>
          <Button variant="coral" lg block label="Go home" />
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
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.bg,
    gap: 16,
  },
  heading: {
    fontFamily: fonts.heading,
    fontSize: 28,
    color: colors.ink,
    textAlign: 'center',
  },
  sub: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.ink,
    opacity: 0.65,
    textAlign: 'center',
    marginTop: -6,
  },
});
