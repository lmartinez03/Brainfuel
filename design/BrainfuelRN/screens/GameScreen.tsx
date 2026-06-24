// screens/GameScreen.tsx
// Playable 3-question trivia. Get 2+ right to bank screen time.
import React, { useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Mascot from '../components/Mascot';
import Sticker from '../components/Sticker';
import Button from '../components/Button';
import Chip from '../components/Chip';
import Confetti from '../components/Confetti';
import { colors, radius as R, sticker, fonts, spacing } from '../theme';
import { TRIVIA, Question } from '../data';

type Props = {
  reward?: number;
  doubleBoost?: boolean;
  onWin: (earned: number, correct: number) => void;
  onExit: () => void;
};

function pick3(): Question[] {
  const pool = [...TRIVIA];
  const out: Question[] = [];
  for (let i = 0; i < 3; i++) out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  return out;
}

export default function GameScreen({ reward = 15, doubleBoost = false, onWin, onExit }: Props) {
  const insets = useSafeAreaInsets();
  const qs = useRef<Question[]>(pick3()).current;
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [results, setResults] = useState<boolean[]>([]);
  const [phase, setPhase] = useState<'play' | 'result'>('play');

  const q = qs[idx];
  const expr = picked == null ? 'thinking' : picked === q.c ? 'excited' : 'sad';

  function choose(i: number) {
    if (picked != null) return;
    setPicked(i);
    const ok = i === q.c;
    setTimeout(() => {
      const r = [...results, ok];
      setResults(r);
      if (idx + 1 < qs.length) {
        setIdx(idx + 1);
        setPicked(null);
      } else {
        setPhase('result');
      }
    }, 950);
  }

  if (phase === 'result') {
    const correct = results.filter(Boolean).length;
    const won = correct >= 2;
    const earned = won ? (doubleBoost ? reward * 2 : reward) : 0;
    return (
      <Result
        correct={correct}
        total={qs.length}
        won={won}
        earned={earned}
        doubleBoost={doubleBoost}
        onClaim={() => onWin(earned, correct)}
        onExit={onExit}
      />
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 10 }]}
      >
        {/* header */}
        <View style={styles.header}>
          <Chip onPress={onExit}>
            <Ionicons name="close" size={16} color={colors.ink} />
          </Chip>
          <View style={styles.pips}>
            {qs.map((_, i) => {
              const done = i < results.length;
              const bg = done ? (results[i] ? colors.teal : colors.pink) : i === idx ? colors.yellow : 'rgba(0,0,0,0.18)';
              return <View key={i} style={[styles.pip, { backgroundColor: bg }]} />;
            })}
          </View>
          <Chip bg={colors.yellow}>
            <Ionicons name="time" size={15} color={colors.ink} />
            <Text style={styles.chipText}>+{doubleBoost ? reward * 2 : reward}</Text>
          </Chip>
        </View>

        {/* mascot */}
        <View style={{ alignItems: 'center', gap: 8, marginTop: 6 }}>
          <Mascot size={84} expr={expr} />
          <Text style={styles.status}>
            {picked == null
              ? `Question ${idx + 1} of ${qs.length}`
              : picked === q.c
              ? 'Nice one! 🎉'
              : 'Oof, not quite 😅'}
          </Text>
        </View>

        {/* question */}
        <Sticker radius={R.xl} innerStyle={{ padding: 20 }}>
          <Text style={styles.qText}>{q.q}</Text>
        </Sticker>

        {/* options */}
        <View style={{ gap: 11 }}>
          {q.a.map((opt, i) => {
            let optBg = colors.white;
            let fg = colors.ink;
            let keyBg = colors.yellow;
            let dim = false;
            if (picked != null) {
              if (i === q.c) {
                optBg = colors.teal;
                fg = colors.white;
                keyBg = colors.white;
              } else if (i === picked) {
                optBg = colors.pink;
                fg = colors.white;
                keyBg = colors.white;
              } else {
                dim = true;
              }
            }
            return (
              <Pressable key={i} disabled={picked != null} onPress={() => choose(i)} style={{ opacity: dim ? 0.5 : 1 }}>
                <Sticker bg={optBg} radius={R.md} offset={sticker.shadow.sm} innerStyle={styles.opt}>
                  <View style={[styles.optKey, { backgroundColor: keyBg }]}>
                    <Text style={styles.optKeyText}>{String.fromCharCode(65 + i)}</Text>
                  </View>
                  <Text style={[styles.optText, { color: fg }]}>{opt}</Text>
                </Sticker>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

function Result({
  correct,
  total,
  won,
  earned,
  doubleBoost,
  onClaim,
  onExit,
}: {
  correct: number;
  total: number;
  won: boolean;
  earned: number;
  doubleBoost?: boolean;
  onClaim: () => void;
  onExit: () => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.screen, { backgroundColor: won ? colors.teal : colors.bg }]}>
      {won && <Confetti />}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.resultContent, { paddingTop: insets.top + 40 }]}
      >
        <Mascot size={130} expr={won ? 'excited' : 'sad'} />
        <Text style={[styles.resultTitle, { color: won ? colors.white : colors.ink }]}>
          {won ? 'You did it!' : 'So close!'}
        </Text>
        <Text style={[styles.resultSub, { color: won ? colors.white : colors.ink }]}>
          You got {correct} of {total} right
        </Text>

        {won ? (
          <Sticker radius={R.xl} innerStyle={styles.earnCard}>
            <Text style={styles.earnLabel}>SCREEN TIME EARNED</Text>
            <Text style={styles.earnBig}>
              +{earned}
              <Text style={styles.earnUnit}> min</Text>
            </Text>
            {doubleBoost && (
              <Chip bg={colors.teal} style={{ marginTop: 4 }}>
                <Ionicons name="flash" size={14} color={colors.white} />
                <Text style={[styles.chipText, { color: colors.white }]}>2× boost applied!</Text>
              </Chip>
            )}
          </Sticker>
        ) : (
          <Text style={styles.missNote}>
            Get at least 2 right to earn your minutes. Give it another go!
          </Text>
        )}

        <Button
          variant={won ? 'purple' : 'coral'}
          lg
          block
          label={won ? `Claim +${earned} min 🎉` : 'Try again'}
          onPress={won ? onClaim : onExit}
          style={{ marginTop: 6 }}
        />
        {won && (
          <Chip bg={colors.white} onPress={onExit}>
            <Text style={styles.chipText}>Back home</Text>
          </Chip>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 18, paddingBottom: 40, gap: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  pips: { flex: 1, flexDirection: 'row', gap: 6 },
  pip: { flex: 1, height: 9, borderRadius: R.pill, borderWidth: 2, borderColor: colors.ink },
  chipText: { fontWeight: fonts.weight.headingHeavy, fontSize: 14, color: colors.ink },
  status: { fontWeight: fonts.weight.heading, fontSize: 14, color: colors.ink, opacity: 0.7 },
  qText: { fontWeight: fonts.weight.heading, fontSize: 23, color: colors.ink, lineHeight: 27 },
  opt: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 15, paddingVertical: 15 },
  optKey: { width: 30, height: 30, borderRadius: 9, borderWidth: 2.5, borderColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  optKeyText: { fontWeight: fonts.weight.heading, fontSize: 14, color: colors.ink },
  optText: { fontWeight: fonts.weight.bodyHeavy, fontSize: 16, flex: 1 },
  // result
  resultContent: { paddingHorizontal: 18, paddingBottom: 50, alignItems: 'center', gap: 16 },
  resultTitle: { fontWeight: fonts.weight.heading, fontSize: 34, textAlign: 'center' },
  resultSub: { fontWeight: fonts.weight.bodyHeavy, fontSize: 16, opacity: 0.9 },
  earnCard: { paddingVertical: 20, paddingHorizontal: 26, alignItems: 'center' },
  earnLabel: { fontWeight: fonts.weight.bodyHeavy, fontSize: 13, letterSpacing: 0.5, color: colors.ink, opacity: 0.6 },
  earnBig: { fontWeight: fonts.weight.heading, fontSize: 52, color: colors.coral, marginVertical: 4 },
  earnUnit: { fontSize: 24 },
  missNote: { fontWeight: fonts.weight.bodyHeavy, fontSize: 14, color: colors.ink, opacity: 0.85, textAlign: 'center', maxWidth: 250 },
});
