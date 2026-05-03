import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { isAllWatched } from '../../src/services/watchStore';
import { Colors } from '../../src/theme/colors';
import VeracityBadge from '../../src/components/VeracityBadge';
import ProgressBar from '../../src/components/ProgressBar';
import SpectrumChart from '../../src/components/SpectrumChart';
import { api, TopicDetail, VoteDistribution } from '../../src/services/api';

const EMPTY_HISTOGRAM = Array(20).fill(0);

function ActionRow({ icon, label, onPress }: { icon: any; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.actionRow} activeOpacity={0.7} onPress={onPress}>
      <MaterialCommunityIcons name={icon} size={18} color={Colors.RISO} />
      <Text style={styles.actionLabel}>{label}</Text>
      <View style={{ flex: 1 }} />
      <MaterialCommunityIcons name="chevron-right" size={18} color={Colors.INK_4} />
    </TouchableOpacity>
  );
}

export default function TopicDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [topic, setTopic] = useState<TopicDetail | null>(null);
  const [distribution, setDistribution] = useState<VoteDistribution | null>(null);
  const [loading, setLoading] = useState(true);
  const [votePosition, setVotePosition] = useState<number | null>(null);
  const [voting, setVoting] = useState(false);
  const [allWatched, setAllWatched] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      api.getTopic(id),
      api.getVoteDistribution(id),
    ]).then(([t, d]) => {
      setTopic(t);
      setDistribution(d);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      if (id) setAllWatched(isAllWatched(id));
    }, [id])
  );

  async function castVote(position: number) {
    if (!id || voting) return;
    setVoting(true);
    setVotePosition(position);
    try {
      const updated = await api.submitVote(id, position);
      setDistribution(updated);
    } catch {
      // Keep optimistic position shown
    } finally {
      setVoting(false);
    }
  }

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
          <Text style={styles.errorText}>Topic not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const histogram = distribution?.histogram ?? EMPTY_HISTOGRAM;
  const total = distribution?.total ?? 0;
  const mean = distribution?.mean ?? null;
  const pipelineComplete = topic.pipeline_status?.video === 'complete';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={Colors.INK} />
        </TouchableOpacity>
        <Text style={styles.wordmark}>GroundTruth</Text>
        <View style={{ width: 30 }} />
      </View>
      <ProgressBar percent={pipelineComplete ? 100 : 50} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.badgeRow}>
          <VeracityBadge label="Veracity Confirmed" />
          {topic.briefing && (
            <Text style={styles.category}>• Debate Analysis</Text>
          )}
        </View>

        <Text style={styles.topicTitle}>{topic.topic}</Text>

        {/* Bento: vote count + your vote */}
        <View style={styles.bentoRow}>
          <View style={[styles.card, styles.cardPrimary]}>
            <Text style={styles.bigNumber}>{total.toLocaleString()}</Text>
            <Text style={styles.bigNumberLabel}>votes cast</Text>
            {mean !== null && (
              <Text style={styles.bigNumberMeta}>
                Mean position: {(mean * 100).toFixed(0)}% toward {topic.pole_b}
              </Text>
            )}
          </View>
          <View style={[styles.card, styles.cardSecondary]}>
            <Text style={styles.totalLabel}>Your Vote</Text>
            {votePosition !== null ? (
              <Text style={styles.totalNumber}>
                {(votePosition * 100).toFixed(0)}%
              </Text>
            ) : (
              <Text style={styles.voteHint}>Tap spectrum below</Text>
            )}
          </View>
        </View>

        {/* Vote spectrum — gated until all 6 videos watched */}
        {allWatched ? (
          <View style={[styles.card, styles.cardFull]}>
            <View style={styles.spectrumHeader}>
              <View>
                <Text style={styles.sectionTitle}>Cast Your Vote</Text>
                <Text style={styles.sectionSubtitle}>
                  Where do you stand? Tap the spectrum to vote.
                </Text>
              </View>
              <View style={styles.legend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: Colors.RISO }]} />
                  <Text style={styles.legendLabel}>Your vote</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: Colors.PAPER_3 }]} />
                  <Text style={styles.legendLabel}>Global</Text>
                </View>
              </View>
            </View>
            <SpectrumChart
              histogram={histogram}
              userPosition={votePosition}
              poleA={topic.pole_a}
              poleB={topic.pole_b}
            />
            <View style={styles.voteRow}>
              <Text style={styles.poleLabel} numberOfLines={1}>{topic.pole_a}</Text>
              <View style={styles.voteSliderTrack}>
                {Array.from({ length: 10 }, (_, i) => {
                  const position = (i + 0.5) / 10;
                  const isSelected = votePosition !== null && Math.abs(votePosition - position) < 0.06;
                  return (
                    <Pressable
                      key={i}
                      style={[styles.voteSegment, isSelected && styles.voteSegmentSelected]}
                      onPress={() => castVote(position)}
                      disabled={voting}
                    />
                  );
                })}
              </View>
              <Text style={styles.poleLabel} numberOfLines={1}>{topic.pole_b}</Text>
            </View>
            {voting && <ActivityIndicator color={Colors.RISO} style={{ marginTop: 8 }} />}
          </View>
        ) : (
          <View style={[styles.card, styles.voteLockCard]}>
            <MaterialCommunityIcons name="lock-outline" size={28} color={Colors.INK_4} />
            <Text style={styles.voteLockTitle}>Voting Locked</Text>
            <Text style={styles.voteLockSubtitle}>
              Watch all 6 parts of the video series to unlock voting.
            </Text>
            <TouchableOpacity
              style={styles.watchSeriesBtn}
              activeOpacity={0.85}
              onPress={() => router.push(`/series/${id}`)}
            >
              <MaterialCommunityIcons name="play-circle-outline" size={16} color={Colors.INK} />
              <Text style={styles.watchSeriesText}>Watch Series</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Briefing summary */}
        {topic.briefing && (
          <View style={styles.editorialCard}>
            <Text style={styles.editorialTag}>Research Summary</Text>
            <Text style={styles.editorialQuote}>{topic.briefing.current_state}</Text>
          </View>
        )}

        {/* Debate summary */}
        {topic.debate_summary && (
          <View style={styles.card}>
            <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>Debate Summary</Text>
            <Text style={styles.sideLabel}>{topic.pole_a}</Text>
            {topic.debate_summary.side_a_points.map((pt, i) => (
              <Text key={i} style={styles.bulletPoint}>• {pt}</Text>
            ))}
            <View style={styles.actionDivider} />
            <Text style={styles.sideLabel}>{topic.pole_b}</Text>
            {topic.debate_summary.side_b_points.map((pt, i) => (
              <Text key={i} style={styles.bulletPoint}>• {pt}</Text>
            ))}
          </View>
        )}

        {/* Action rows */}
        <View style={styles.actionsCard}>
          <ActionRow
            icon="play-circle"
            label="Watch Full Series"
            onPress={() => router.push(`/series/${id}`)}
          />
          <View style={styles.actionDivider} />
          <ActionRow
            icon="flask-outline"
            label="View Research"
            onPress={() => router.push(`/deep-dive/${id}`)}
          />
        </View>
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
  scrollContent: { padding: 20, paddingBottom: 120, gap: 20 },

  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  category: {
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

  bentoRow: { flexDirection: 'row', gap: 12 },
  card: {
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
  },
  cardPrimary: { flex: 2 },
  cardSecondary: { flex: 1, backgroundColor: Colors.PAPER_2 },
  cardFull: { gap: 16 },

  bigNumber: {
    fontFamily: 'Fraunces_800ExtraBold',
    fontSize: 40,
    lineHeight: 44,
    color: Colors.RISO,
    letterSpacing: -1,
  },
  bigNumberLabel: {
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: 14,
    lineHeight: 20,
    color: Colors.INK,
    marginTop: 4,
  },
  bigNumberMeta: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 10,
    lineHeight: 16,
    color: Colors.INK_4,
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  totalLabel: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 9,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: Colors.INK_4,
  },
  totalNumber: {
    fontFamily: 'Fraunces_800ExtraBold',
    fontSize: 28,
    lineHeight: 34,
    color: Colors.INK,
    letterSpacing: -0.5,
    marginTop: 4,
  },
  voteHint: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 10,
    color: Colors.INK_4,
    marginTop: 8,
    lineHeight: 16,
  },

  spectrumHeader: { gap: 12 },
  sectionTitle: {
    fontFamily: 'Fraunces_800ExtraBold',
    fontSize: 18,
    color: Colors.INK,
    letterSpacing: -0.45,
  },
  sectionSubtitle: {
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 11,
    lineHeight: 16,
    color: Colors.INK_4,
    marginTop: 2,
  },
  legend: { flexDirection: 'row', gap: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 0,
    borderWidth: 1.5,
    borderColor: Colors.INK,
  },
  legendLabel: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 10,
    color: Colors.INK_4,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },

  voteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  poleLabel: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 9,
    color: Colors.INK,
    maxWidth: 60,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  voteSliderTrack: {
    flex: 1,
    flexDirection: 'row',
    height: 36,
    borderRadius: 0,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: Colors.INK,
    gap: 1,
  },
  voteSegment: {
    flex: 1,
    backgroundColor: Colors.PAPER_3,
  },
  voteSegmentSelected: {
    backgroundColor: Colors.RISO,
  },

  voteLockCard: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 28,
  },
  voteLockTitle: {
    fontFamily: 'Fraunces_800ExtraBold',
    fontSize: 20,
    color: Colors.INK,
    letterSpacing: -0.5,
  },
  voteLockSubtitle: {
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 13,
    lineHeight: 19,
    color: Colors.INK_4,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  watchSeriesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    backgroundColor: Colors.RISO,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 0,
    borderWidth: 1.5,
    borderColor: Colors.INK,
    shadowColor: Colors.INK,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  watchSeriesText: {
    fontFamily: 'JetBrainsMono_700Bold',
    fontSize: 11,
    color: Colors.INK,
    letterSpacing: 1.54,
    textTransform: 'uppercase',
  },

  editorialCard: {
    backgroundColor: Colors.PAPER_2,
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
  editorialTag: {
    fontFamily: 'JetBrainsMono_700Bold',
    fontSize: 10,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: Colors.RISO,
  },
  editorialQuote: {
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 15,
    lineHeight: 24,
    color: Colors.INK_3,
    fontStyle: 'italic',
  },

  sideLabel: {
    fontFamily: 'JetBrainsMono_700Bold',
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: Colors.RISO,
    marginBottom: 6,
  },
  bulletPoint: {
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 14,
    lineHeight: 22,
    color: Colors.INK_3,
    marginBottom: 4,
  },

  actionsCard: {
    backgroundColor: Colors.CARD,
    borderRadius: 0,
    borderWidth: 1.5,
    borderColor: Colors.INK,
    overflow: 'hidden',
    shadowColor: Colors.INK,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  actionLabel: {
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: 13,
    color: Colors.INK,
  },
  actionDivider: {
    height: 1.5,
    backgroundColor: Colors.INK,
    opacity: 0.15,
    marginHorizontal: 20,
  },
});
