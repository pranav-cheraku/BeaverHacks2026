import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../src/theme/colors';
import VeracityBadge from '../../src/components/VeracityBadge';
import ProgressBar from '../../src/components/ProgressBar';
import { api, TopicDetail, PipelineStatus } from '../../src/services/api';

type Section = { label: string; content: string };

function BriefingSection({ label, content }: Section) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <Text style={styles.sectionBody}>{content}</Text>
    </View>
  );
}

function pipelinePercent(status: PipelineStatus): number {
  const stages = ['research', 'debate', 'summary', 'scripts', 'audio', 'video'] as const;
  const done = stages.filter((s) => status[s] === 'complete').length;
  return Math.round((done / stages.length) * 100);
}

export default function DeepDiveScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [topic, setTopic] = useState<TopicDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!id) return;
    api.getTopic(id).then((t) => {
      setTopic(t);
      if (t.pipeline_status?.video !== 'complete') {
        pollRef.current = setInterval(async () => {
          try {
            const updated = await api.getPipelineStatus(id);
            setTopic((prev) => prev ? { ...prev, pipeline_status: updated } : prev);
            if (updated.video === 'complete') {
              clearInterval(pollRef.current!);
            }
          } catch {}
        }, 5000);
      }
    }).catch(() => {}).finally(() => setLoading(false));

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [id]);

  const percent = topic ? pipelinePercent(topic.pipeline_status) : 0;
  const pipelineComplete = topic?.pipeline_status?.video === 'complete';

  const sections: Section[] = topic?.briefing
    ? [
        { label: 'Origin', content: topic.briefing.origin },
        { label: 'Key Players', content: topic.briefing.key_players },
        { label: `The Case For ${topic.pole_a}`, content: topic.briefing.case_for_a },
        { label: `The Case Against ${topic.pole_a}`, content: topic.briefing.case_for_b },
        { label: 'Consequences', content: topic.briefing.consequences },
        { label: 'Where We Stand', content: topic.briefing.current_state },
      ]
    : [];

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={22} color={Colors.INK} />
          </TouchableOpacity>
          <Text style={styles.wordmark}>GroundTruth</Text>
          <View style={{ width: 30 }} />
        </View>
        <View style={styles.loader}>
          <ActivityIndicator color={Colors.RISO} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!topic) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={22} color={Colors.INK} />
          </TouchableOpacity>
          <Text style={styles.wordmark}>GroundTruth</Text>
          <View style={{ width: 30 }} />
        </View>
        <View style={styles.loader}>
          <Text style={styles.errorText}>Research not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={Colors.INK} />
        </TouchableOpacity>
        <Text style={styles.wordmark}>GroundTruth</Text>
        <View style={{ width: 30 }} />
      </View>
      <ProgressBar percent={percent} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.badgeRow}>
          <VeracityBadge label="Deep Research" />
          {!pipelineComplete && (
            <Text style={styles.processingTag}>• Processing</Text>
          )}
        </View>

        <Text style={styles.topicTitle}>{topic.topic}</Text>

        {!pipelineComplete && (
          <View style={styles.pendingCard}>
            <ActivityIndicator color={Colors.RISO} size="small" />
            <Text style={styles.pendingText}>
              Research pipeline is still running. Check back soon.
            </Text>
          </View>
        )}

        {sections.length > 0 ? (
          sections.map((s) => (
            <BriefingSection key={s.label} label={s.label} content={s.content} />
          ))
        ) : (
          pipelineComplete && (
            <View style={styles.pendingCard}>
              <Text style={styles.pendingText}>No briefing available yet.</Text>
            </View>
          )
        )}

        {topic.debate_summary && (
          <View style={styles.debateCard}>
            <Text style={styles.debateTitle}>Debate Summary</Text>
            <Text style={styles.sideLabel}>{topic.pole_a}</Text>
            {topic.debate_summary.side_a_points.map((pt, i) => (
              <Text key={i} style={styles.bulletPoint}>• {pt}</Text>
            ))}
            <View style={styles.divider} />
            <Text style={styles.sideLabel}>{topic.pole_b}</Text>
            {topic.debate_summary.side_b_points.map((pt, i) => (
              <Text key={i} style={styles.bulletPoint}>• {pt}</Text>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={styles.voteButton}
          activeOpacity={0.85}
          onPress={() => router.push(`/topic/${id}`)}
        >
          <MaterialCommunityIcons name="vote" size={18} color={Colors.INK} />
          <Text style={styles.voteButtonText}>Go Vote</Text>
        </TouchableOpacity>
      </ScrollView>
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
    paddingHorizontal: 20,
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
  backBtn: { padding: 4 },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.PAPER },
  errorText: {
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 16,
    color: Colors.INK_4,
  },
  scroll: { flex: 1, backgroundColor: Colors.PAPER_2 },
  scrollContent: { padding: 20, paddingBottom: 48, gap: 20 },

  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  processingTag: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 10,
    color: Colors.INK_4,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  topicTitle: {
    fontFamily: 'Fraunces_800ExtraBold',
    fontSize: 24,
    lineHeight: 30,
    color: Colors.INK,
    letterSpacing: -0.6,
  },

  pendingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.PAPER_2,
    borderRadius: 0,
    padding: 16,
    borderWidth: 1.5,
    borderColor: Colors.INK,
  },
  pendingText: {
    flex: 1,
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 13,
    color: Colors.INK_4,
    lineHeight: 18,
  },

  section: {
    backgroundColor: Colors.CARD,
    borderRadius: 0,
    padding: 20,
    borderWidth: 1.5,
    borderColor: Colors.INK,
    gap: 10,
    shadowColor: Colors.INK,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  sectionLabel: {
    fontFamily: 'JetBrainsMono_700Bold',
    fontSize: 10,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: Colors.RISO,
  },
  sectionBody: {
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 15,
    lineHeight: 24,
    color: Colors.INK_3,
  },

  debateCard: {
    backgroundColor: Colors.CARD,
    borderRadius: 0,
    padding: 20,
    borderWidth: 1.5,
    borderColor: Colors.INK,
    gap: 8,
    shadowColor: Colors.INK,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  debateTitle: {
    fontFamily: 'Fraunces_800ExtraBold',
    fontSize: 18,
    color: Colors.INK,
    letterSpacing: -0.45,
    marginBottom: 4,
  },
  sideLabel: {
    fontFamily: 'JetBrainsMono_700Bold',
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: Colors.RISO,
    marginTop: 4,
  },
  bulletPoint: {
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 14,
    lineHeight: 22,
    color: Colors.INK_3,
    marginBottom: 2,
  },
  divider: {
    height: 1.5,
    backgroundColor: Colors.INK,
    opacity: 0.15,
    marginVertical: 8,
  },

  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.RISO,
    paddingVertical: 14,
    borderRadius: 0,
    marginTop: 4,
    borderWidth: 1.5,
    borderColor: Colors.INK,
    shadowColor: Colors.INK,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  voteButtonText: {
    fontFamily: 'JetBrainsMono_700Bold',
    fontSize: 11,
    color: Colors.INK,
    letterSpacing: 1.54,
    textTransform: 'uppercase',
  },
});
