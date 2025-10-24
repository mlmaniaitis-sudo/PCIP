import React from 'react';
import { StyleSheet, View, FlatList, ScrollView } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Card, Text, List, Divider, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useTranslation } from '@/context/LanguageContext'; // 1. Import hook
import { MOCK_WALLET } from '@/constants/mockData'; // 2. Import mock data
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
            year: 'numeric', month: 'short', day: 'numeric'
        });
    } catch (e) {
        return isoString;
    }
};

export default function WalletScreen() {
  const { t } = useTranslation(); // 3. Use the hook
  const [loading, setLoading] = React.useState(false); // Can simulate loading
  const wallet = MOCK_WALLET; // 4. Use mock data

  const renderTransactionItem = ({ item }: { item: CreditTransaction }) => {
    const isEarned = item.status !== 'redeemed';
    const color = isEarned ? '#4CAF50' : '#F44336'; // Green for earned/pending, Red for redeemed
    const icon = isEarned ? 'arrow-up-circle-outline' : 'arrow-down-circle-outline';
    const title = isEarned ? t('wallet.earned') : t('wallet.redeemed');
    const dateLabel = isEarned ? t('wallet.awardedOn') : t('wallet.redeemedOn');
    const date = isEarned ? item.awarded_on : item.redeemed_on;

    return (
       <React.Fragment>
            <List.Item
                title={`${title}: ₹${item.amount.toFixed(2)}`}
                description={`${t('wallet.status')}: ${getTranslatedStatus(item.status, t)}\n${dateLabel}: ${formatDate(date)}`}
                descriptionNumberOfLines={2}
                left={(props) => <List.Icon {...props} icon={icon} color={color} />}
                right={(props) => <Text {...props} variant="titleMedium" style={{color, alignSelf: 'center', marginRight: 10}}>
                                    {isEarned ? '+' : '-'}₹{item.amount.toFixed(2)}
                                </Text>}
            />
            <Divider />
       </React.Fragment>
    );
  };

  if (loading) {
    return (
        <ThemedView style={styles.centerContainer}>
            <ActivityIndicator size="large" />
        </ThemedView>
    );
  }

  return (
    <ScrollView style={styles.scrollView}>
        <ThemedView style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
            <ThemedText type="title" style={styles.title}>{t('wallet.title')}</ThemedText>
        </View>

        {/* Balance Card */}
        <Card style={styles.balanceCard}>
            <Card.Content>
                <Text style={styles.balanceLabel}>{t('wallet.balance')}</Text>
                <Text style={styles.balanceAmount}>₹{wallet.available_balance.toFixed(2)}</Text>
                
                <Divider style={styles.cardDivider} />

                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <MaterialCommunityIcons name="arrow-up-bold-box" size={20} color="#4CAF50" />
                        <Text style={styles.statLabel}>{t('wallet.totalEarned')}:</Text>
                        <Text style={styles.statValue}>₹{wallet.total_earned.toFixed(2)}</Text>
                    </View>
                    <View style={styles.statItem}>
                        <MaterialCommunityIcons name="arrow-down-bold-box" size={20} color="#F44336" />
                        <Text style={styles.statLabel}>{t('wallet.totalRedeemed')}:</Text>
                        <Text style={styles.statValue}>₹{wallet.total_redeemed.toFixed(2)}</Text>
                    </View>
                </View>
            </Card.Content>
        </Card>

        {/* History Section */}
        <List.Section style={styles.historySection}>
            <List.Subheader style={styles.historyTitle}>{t('wallet.history')}</List.Subheader>
            {wallet.recent_history.length > 0 ? (
                <FlatList
                    data={wallet.recent_history}
                    renderItem={renderTransactionItem}
                    keyExtractor={(item) => item.credit_id}
                    scrollEnabled={false} // Disable scrolling inside ScrollView
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <MaterialCommunityIcons name="history" size={64} color="#cccccc" />
                    <Text style={styles.emptyText}>{t('wallet.noHistory')}</Text>
                </View>
            )}
        </List.Section>

        </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#f5f5f5', // Light grey background
  },
  container: {
    flex: 1,
    paddingBottom: 30,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
      paddingHorizontal: 16,
      paddingTop: 50, // Status bar
      paddingBottom: 10,
  },
  title: {
      fontWeight: 'bold',
  },
  balanceCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    elevation: 4,
    backgroundColor: '#6750A4', // Theme primary
  },
  balanceLabel: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    opacity: 0.8,
  },
  balanceAmount: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginVertical: 10,
  },
  cardDivider: {
      backgroundColor: '#ffffff',
      opacity: 0.3,
      marginVertical: 15,
  },
  statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 10,
  },
  statItem: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  statLabel: {
      color: '#ffffff',
      opacity: 0.9,
      marginLeft: 5,
      marginRight: 5,
  },
  statValue: {
      color: '#ffffff',
      fontWeight: 'bold',
  },
  historySection: {
    marginHorizontal: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 1,
  },
  historyTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      paddingLeft: 16,
      paddingTop: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#888888',
    textAlign: 'center',
  },
});