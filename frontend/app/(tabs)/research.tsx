import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../src/theme/colors';
import VeracityBadge from '../../src/components/VeracityBadge';
import ProgressBar from '../../src/components/ProgressBar';
import HalftoneDecoration from '../../src/components/HalftoneDecoration';
import { api, Topic, PipelineStatus } from '../../src/services/api';

const STAGE_LABELS: { key: keyof PipelineStatus; label: string }[] = [
  { key: 'research', label: 'Deep research and source cross-referencing…' },
  { key: 'debate', label: 'Adversarial debate between AI agents…' },
  { key: 'summary', label: 'Synthesizing debate into key findings…' },
  { key: 'scripts', label: 'Writing 6-part video scripts…' },
  { key: 'audio', label: 'Generating narration audio…' },
  { key: 'video', label: 'Assembling final video series…' },
];

const PART_ROLES = [
  { num: '01', title: 'Origin', key: 'research' },
  { num: '02', title: 'Key Players', key: 'research' },
  { num: '03', title: 'The Case For', key: 'scripts' },
  { num: '04', title: 'The Case Against', key: 'scripts' },
  { num: '05', title: 'Consequences', key: 'audio' },
  { num: '06', title: 'Where We Stand', key: 'video' },
];

function PulsingDot() {
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.3, duration: 600, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0.85, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return <Animated.View style={[styles.pulseDot, { transform: [{ scale }] }]} />;
}

function SpinnerIcon() {
  const rotation = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(rotation, { toValue: 1, duration: 1000, useNativeDriver: true })
    ).start();
  }, []);
  const spin = rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return (
    <Animated.View style={{ transform: [{ rotate: spin }] }}>
      <MaterialCommunityIcons name="loading" size={20} color={Colors.RISO} />
    </Animated.View>
  );
}

function stageState(status: PipelineStatus | null, key: keyof PipelineStatus): 'done' | 'active' | 'pending' {
  if (!status) return 'pending';
  const v = status[key];
  if (v === 'complete') return 'done';
  if (v === 'running') return 'active';
  return 'pending';
}

function partState(status: PipelineStatus | null, stageKey: string): 'done' | 'active' | 'locked' {
  if (!status) return 'locked';
  const v = (status as any)[stageKey];
  if (v === 'complete') return 'done';
  if (v === 'running') return 'active';
  return 'locked';
}

function StatusStep({ label, state }: { label: string; state: 'done' | 'active' | 'pending' }) {
  return (
    <View style={styles.step}>
      {state === 'done' && (
        <View style={styles.stepDone}>
          <MaterialCommunityIcons name="check" size={13} color={Colors.PAPER} />
        </View>
      )}
      {state === 'active' && <PulsingDot />}
      {state === 'pending' && <View style={styles.stepPending} />}
      <Text style={[styles.stepLabel, state === 'active' && styles.stepLabelActive, state === 'pending' && styles.stepLabelPending]}>
        {label}
      </Text>
    </View>
  );
}

export default function ResearchScreen() {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const CARD_WIDTH = (SCREEN_WIDTH - 40 - 24) / 3;

  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getTopics().then((data) => {
      setTopics(data);
      if (data.length > 0) setSelectedTopic(data[0]);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedTopic) return;
    const status = selectedTopic.pipeline_status;
    const allDone = status && Object.values(status).every((v) => v === 'complete');
    if (allDone) return;
    const interval = setInterval(async () => {
      try {
        const updated = await api.getPipelineStatus(selectedTopic.id);
        setSelectedTopic((prev) => prev ? { ...prev, pipeline_status: updated } : prev);
      } catch {}
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedTopic?.id, selectedTopic?.pipeline_status]);

  const status = selectedTopic?.pipeline_status ?? null;
  const videoComplete = status?.video === 'complete';
  const doneCount = status ? Object.values(status).filter((v) => v === 'complete').length : 0;
  const progressPercent = Math.round((doneCount / 6) * 100);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.wordmark}>GroundTruth</Text>
        <View style={styles.headerIcon}>
          <MaterialCommunityIcons name="account-circle" size={28} color={Colors.INK_4} />
        </View>
      </View>
      <ProgressBar percent={progressPercent} />

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={Colors.RISO} size="large" />
        </View>
      ) : !selectedTopic ? (
        <View style={styles.loader}>
          <Text style={styles.emptyText}>No topics available.</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Topic picker */}
          {topics.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.pickerRow}
            >
              {topics.map((t) => (
                <TouchableOpacity
                  key={t.id}
                  style={[styles.pickerChip, selectedTopic.id === t.id && styles.pickerChipActive]}
                  onPress={() => setSelectedTopic(t)}
                >
                  <Text style={[styles.pickerChipText, selectedTopic.id === t.id && styles.pickerChipTextActive]} numberOfLines={1}>
                    {t.topic}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          <View style={styles.heroSection}>
            <VeracityBadge label={videoComplete ? 'Research Complete' : 'Deep Research Protocol Active'} />
            <Text style={styles.heroTitle}>{selectedTopic.topic}</Text>
            <Text style={styles.heroDesc}>
              Our synthesis engine is cross-referencing sources, mapping stakeholder positions, and building the evidence base for both sides of this debate.
            </Text>
            <View style={{ position: 'absolute', right: 0, bottom: 0 }}>
              <HalftoneDecoration color={Colors.RISO} opacity={0.2} />
            </View>
          </View>

          {/* Status Feed */}
          <View style={styles.statusCard}>
            <Text style={styles.cardSectionTitle}>Research Status</Text>
            <View style={styles.stepsList}>
              {STAGE_LABELS.map(({ key, label }) => (
                <StatusStep key={key} label={label} state={stageState(status, key)} />
              ))}
            </View>
          </View>

          {/* 6-Part Investigation Grid */}
          <View>
            <View style={styles.gridHeader}>
              <Text style={styles.gridTitle}>6-Part Investigation</Text>
              {!videoComplete && (
                <View style={styles.liveBadge}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>Live</Text>
                </View>
              )}
            </View>
            <View style={styles.invGrid}>
              {PART_ROLES.map((part) => {
                const state = partState(status, part.key);
                return (
                  <View
                    key={part.num}
                    style={[
                      styles.invCard,
                      { width: CARD_WIDTH },
                      state === 'active' && styles.invCardActive,
                      state === 'locked' && styles.invCardLocked,
                    ]}
                  >
                    {state === 'done' && (
                      <MaterialCommunityIcons name="check-circle" size={18} color={Colors.RISO} />
                    )}
                    {state === 'active' && <SpinnerIcon />}
                    {state === 'locked' && (
                      <MaterialCommunityIcons name="lock" size={18} color={Colors.INK_4} />
                    )}
                    <Text style={[styles.invNum, state === 'locked' && styles.invTextFaded]}>
                      Part {part.num}
                    </Text>
                    <Text style={[styles.invTitle, state === 'locked' && styles.invTextFaded]} numberOfLines={2}>
                      {part.title}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.PAPER },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: 16,
    backgroundColor: Colors.PAPER,
    borderBottomWidth: 1.5,
    borderBottomColor: Colors.INK,
  },
  wordmark: {
    fontFamily: 'Fraunces_800ExtraBold',
    fontSize: 20,
    color: Colors.INK,
    letterSpacing: -0.5,
  },
  headerIcon: { padding: 2 },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.PAPER },
  emptyText: {
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 16,
    color: Colors.INK_4,
  },
  scroll: { flex: 1, backgroundColor: Colors.PAPER_2 },
  scrollContent: { padding: 20, paddingBottom: 120, gap: 24 },

  pickerRow: { gap: 8, paddingBottom: 4 },
  pickerChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 0,
    backgroundColor: Colors.PAPER_2,
    borderWidth: 1.5,
    borderColor: Colors.INK,
    maxWidth: 200,
  },
  pickerChipActive: {
    backgroundColor: Colors.RISO,
    borderColor: Colors.INK,
  },
  pickerChipText: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 10,
    color: Colors.INK,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  pickerChipTextActive: { color: Colors.INK },

  heroSection: { alignItems: 'center', gap: 12, paddingTop: 8, paddingBottom: 8, overflow: 'hidden' },
  heroTitle: {
    fontFamily: 'Fraunces_800ExtraBold',
    fontSize: 28,
    lineHeight: 34,
    color: Colors.INK,
    textAlign: 'center',
    letterSpacing: -0.7,
  },
  heroDesc: {
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 14,
    lineHeight: 22,
    color: Colors.INK_3,
    textAlign: 'center',
  },

  statusCard: {
    backgroundColor: Colors.CARD,
    borderRadius: 0,
    padding: 20,
    borderWidth: 1.5,
    borderColor: Colors.INK,
    shadowColor: Colors.INK,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    gap: 16,
  },
  cardSectionTitle: {
    fontFamily: 'JetBrainsMono_700Bold',
    fontSize: 10,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: Colors.INK_3,
  },
  stepsList: { gap: 14 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepDone: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.RISO,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.RISO_SOFT,
    borderWidth: 3,
    borderColor: Colors.RISO,
  },
  stepPending: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.PAPER_3,
    backgroundColor: 'transparent',
  },
  stepLabel: {
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 13,
    color: Colors.INK,
    flex: 1,
  },
  stepLabelActive: { fontFamily: 'SpaceGrotesk_700Bold', color: Colors.RISO },
  stepLabelPending: { color: Colors.INK_4, opacity: 0.6 },

  gridHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  gridTitle: {
    fontFamily: 'Fraunces_800ExtraBold',
    fontSize: 20,
    color: Colors.INK,
    letterSpacing: -0.5,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.RISO_SOFT,
    borderRadius: 0,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1.5,
    borderColor: Colors.INK,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.RISO },
  liveText: {
    fontFamily: 'JetBrainsMono_700Bold',
    fontSize: 10,
    color: Colors.RISO,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },

  invGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  invCard: {
    backgroundColor: Colors.CARD,
    borderRadius: 0,
    borderWidth: 1.5,
    borderColor: Colors.INK,
    padding: 12,
    gap: 6,
    shadowColor: Colors.INK,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  invCardActive: { borderColor: Colors.RISO, borderWidth: 2 },
  invCardLocked: { backgroundColor: Colors.PAPER_2, opacity: 0.65 },
  invNum: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 9,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: Colors.INK_4,
    marginTop: 2,
  },
  invTitle: {
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: 13,
    lineHeight: 17,
    color: Colors.INK,
  },
  invTextFaded: { color: Colors.INK_4 },
});
