import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../src/theme/colors';
import VeracityBadge from '../../src/components/VeracityBadge';
import ProgressBar from '../../src/components/ProgressBar';
import ConsensusPulseRow from '../../src/components/ConsensusPulseRow';
import HalftoneDecoration from '../../src/components/HalftoneDecoration';
import { api, Topic, VoteDistribution } from '../../src/services/api';

function consensusStatus(mean: number | null): { percent: number; status: string } {
  if (mean === null) return { percent: 50, status: 'No votes yet' };
  const percent = Math.round(mean * 100);
  if (percent < 30) return { percent, status: 'Polarized' };
  if (percent < 60) return { percent, status: 'Divergent' };
  return { percent, status: 'Converging' };
}

type TopicWithVotes = Topic & { distribution?: VoteDistribution };

function TopicCard({ topic, onPress }: { topic: TopicWithVotes; onPress: () => void }) {
  const { percent, status } = consensusStatus(topic.distribution?.mean ?? null);
  const isReady = topic.pipeline_status?.video === 'complete';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.cardImageContainer}>
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: Colors.PAPER_3 }]} />
        <LinearGradient
          colors={['transparent', 'rgba(17,17,17,0.88)']}
          style={StyleSheet.absoluteFillObject}
          pointerEvents="none"
        />
        <View style={styles.cardImageContent}>
          <Text style={styles.cardCategory}>
            {isReady ? 'READY TO WATCH' : 'IN PROGRESS'}
          </Text>
          <Text style={styles.cardTitle} numberOfLines={2}>{topic.topic}</Text>
        </View>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardSummary} numberOfLines={3}>
          {topic.pole_a} vs. {topic.pole_b}
        </Text>
        <ConsensusPulseRow label="Consensus Pulse" percent={percent} status={status} />
      </View>
    </TouchableOpacity>
  );
}

export default function TopicsScreen() {
  const router = useRouter();
  const [topics, setTopics] = useState<TopicWithVotes[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getTopics().then(async (data) => {
      const withVotes = await Promise.all(
        data.map(async (t) => {
          try {
            const distribution = await api.getVoteDistribution(t.id);
            return { ...t, distribution };
          } catch {
            return t;
          }
        })
      );
      setTopics(withVotes);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.wordmark}>GroundTruth</Text>
        <TouchableOpacity style={styles.headerIcon}>
          <MaterialCommunityIcons name="magnify" size={22} color={Colors.INK} />
        </TouchableOpacity>
      </View>
      <ProgressBar percent={loading ? 0 : Math.min(topics.length * 10, 100)} />

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={Colors.RISO} size="large" />
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <VeracityBadge label="Veracity Guaranteed" />
            <Text style={styles.heroTitle}>What the world is debating</Text>
            <Text style={styles.heroSubtitle}>
              Every topic is researched by AI, debated by AI, and voted on by you. Real consensus. Real stakes.
            </Text>
            <View style={{ position: 'absolute', right: 24, bottom: 24 }}>
              <HalftoneDecoration />
            </View>
          </View>

          <View style={styles.topicsList}>
            {topics.map((topic) => (
              <TopicCard
                key={topic.id}
                topic={topic}
                onPress={() => router.push(`/topic/${topic.id}`)}
              />
            ))}
            {topics.length === 0 && (
              <Text style={styles.emptyText}>No topics available yet.</Text>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.PAPER,
  },
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
  headerIcon: { padding: 4 },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.PAPER,
  },
  scroll: {
    flex: 1,
    backgroundColor: Colors.PAPER_2,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  hero: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
    gap: 12,
    backgroundColor: Colors.PAPER,
    borderBottomWidth: 1.5,
    borderBottomColor: Colors.INK,
    overflow: 'hidden',
  },
  heroTitle: {
    fontFamily: 'Fraunces_800ExtraBold',
    fontSize: 36,
    lineHeight: 42,
    color: Colors.INK,
    letterSpacing: -0.9,
    marginTop: 4,
  },
  heroSubtitle: {
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 15,
    lineHeight: 24,
    color: Colors.INK_3,
  },
  topicsList: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 24,
  },
  card: {
    backgroundColor: Colors.CARD,
    borderRadius: 0,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: Colors.INK,
    shadowColor: Colors.INK,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  cardImageContainer: {
    height: 200,
    position: 'relative',
  },
  cardImageContent: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    gap: 6,
  },
  cardCategory: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 10,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.75)',
  },
  cardTitle: {
    fontFamily: 'Fraunces_800ExtraBold',
    fontSize: 22,
    lineHeight: 28,
    color: '#ffffff',
  },
  cardBody: {
    padding: 20,
  },
  cardSummary: {
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 15,
    lineHeight: 24,
    color: Colors.INK_3,
  },
  emptyText: {
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 16,
    color: Colors.INK_4,
    textAlign: 'center',
    paddingVertical: 40,
  },
});
