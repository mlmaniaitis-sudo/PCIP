// frontend/farmer-mobile-app/app/(tabs)/wallet.tsx
import React from 'react';
import { StyleSheet, View, FlatList, ScrollView, Pressable } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { Text, ActivityIndicator, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from '@/context/LanguageContext';
import { MOCK_WALLET } from '@/constants/mockData';
import { CreditStatus, CreditTransaction } from '@/types';

// Helper function to get translated status text
const getTranslatedStatus = (status: CreditStatus, t: Function): string => {
  switch (status) {
    case 'available': return t('wallet.available');
    case 'redeemed': return t('wallet.redeemed');
    case 'pending': return t('wallet.pending');
    default: return status;
  }
}

// Helper function to format dates nicely
const formatDate = (isoString?: string): string => {
  if (!isoString) return '';
  try {
    return new Date(isoString).toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch (e) {
    return isoString;
  }
};

export default function WalletScreen() {
  const { t } = useTranslation();
  const [loading, setLoading] = React.useState(false);
  const wallet = MOCK_WALLET;

  const renderTransactionItem = ({ item }: { item: CreditTransaction }) => {
    const isEarned = item.status !== 'redeemed';
    const color = isEarned ? '#4CAF50' : '#F57C00';
    const icon = isEarned ? 'arrow-top-right' : 'arrow-bottom-left';
    const title = isEarned ? t('wallet.earned') : t('wallet.redeemed');
    const date = isEarned ? item.awarded_on : item.redeemed_on;

    return (
      <Pressable style={styles.transactionItem}>
        <View style={[styles.transactionIcon, { backgroundColor: isEarned ? '#E8F5E9' : '#FFF3E0' }]}>
          <MaterialCommunityIcons name={icon} size={24} color={color} />
        </View>
        
        <View style={styles.transactionContent}>
          <Text style={styles.transactionTitle}>{title} {t('wallet.credits')}</Text>
          <Text style={styles.transactionDate}>{formatDate(date)}</Text>
          <View style={[styles.statusBadge, { backgroundColor: isEarned ? '#E8F5E9' : '#FFF3E0' }]}>
            <Text style={[styles.statusText, { color }]}>{getTranslatedStatus(item.status, t)}</Text>
          </View>
        </View>
        
        <Text style={[styles.transactionAmount, { color }]}>
          {isEarned ? '+' : '-'}₹{item.amount.toFixed(0)}
        </Text>
      </Pressable>
    );
  };

  if (loading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>{t('wallet.loading')}</Text>
      </ThemedView>
    );
  }

  return (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <ThemedView style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerGreeting}>{t('wallet.your')}</Text>
              <Text style={styles.headerTitle}>{t('wallet.title')}</Text>
            </View>
            <View style={styles.walletIcon}>
              <MaterialCommunityIcons name="wallet" size={32} color="#2E7D32" />
            </View>
          </View>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceCardBackground} />
          <View style={styles.balanceContent}>
            <MaterialCommunityIcons name="star-circle" size={48} color="#FFD700" />
            <Text style={styles.balanceLabel}>{t('wallet.balance')}</Text>
            <Text style={styles.balanceAmount}>₹{wallet.available_balance.toFixed(0)}</Text>
            
            <View style={styles.balanceStats}>
              <View style={styles.balanceStatItem}>
                <MaterialCommunityIcons name="arrow-up-circle" size={20} color="#E8F5E9" />
                <Text style={styles.balanceStatLabel}>{t('wallet.totalEarned')}</Text>
                <Text style={styles.balanceStatValue}>₹{wallet.total_earned.toFixed(0)}</Text>
              </View>
              
              <View style={styles.balanceStatDivider} />
              
              <View style={styles.balanceStatItem}>
                <MaterialCommunityIcons name="arrow-down-circle" size={20} color="#E8F5E9" />
                <Text style={styles.balanceStatLabel}>{t('wallet.totalRedeemed')}</Text>
                <Text style={styles.balanceStatValue}>₹{wallet.total_redeemed.toFixed(0)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Transaction History */}
        <View style={styles.historyCard}>
          <View style={styles.historyHeader}>
            <MaterialCommunityIcons name="history" size={24} color="#2E7D32" />
            <Text style={styles.historyTitle}>{t('wallet.history')}</Text>
          </View>
          
          {wallet.recent_history.length > 0 ? (
            <FlatList
              data={wallet.recent_history}
              renderItem={renderTransactionItem}
              keyExtractor={(item) => item.credit_id}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <Divider style={styles.divider} />}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIcon}>
                <MaterialCommunityIcons name="history" size={64} color="#BDBDBD" />
              </View>
              <Text style={styles.emptyTitle}>{t('wallet.noHistory')}</Text>
              <Text style={styles.emptyText}>{t('wallet.noHistoryDesc')}</Text>
            </View>
          )}
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <MaterialCommunityIcons name="information-outline" size={24} color="#2E7D32" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>{t('wallet.aboutCredits')}</Text>
            <Text style={styles.infoText}>
              {t('wallet.aboutCreditsDesc')}
            </Text>
          </View>
        </View>

      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  container: {
    flex: 1,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerGreeting: {
    fontSize: 14,
    color: '#757575',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2E7D32',
    letterSpacing: 0.5,
  },
  walletIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceCard: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    height: 220,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  balanceCardBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#2E7D32',
  },
  balanceContent: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#E8F5E9',
    marginTop: 8,
    fontWeight: '500',
  },
  balanceAmount: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
    marginVertical: 8,
  },
  balanceStats: {
    flexDirection: 'row',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    width: '100%',
    justifyContent: 'space-around',
  },
  balanceStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  balanceStatLabel: {
    fontSize: 12,
    color: '#E8F5E9',
    marginLeft: 6,
    marginRight: 4,
  },
  balanceStatValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
    marginLeft: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionContent: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 4,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: '700',
  },
  divider: {
    backgroundColor: '#F5F5F5',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#E8F5E9',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2E7D32',
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: '#1B5E20',
    lineHeight: 18,
  },
});
