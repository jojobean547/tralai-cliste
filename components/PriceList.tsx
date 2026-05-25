// SPDX-License-Identifier: AGPL-3.0-or-later
//
// Tralaí Cliste — Irish community grocery price comparison app
// Copyright (C) 2026 Tralaí Cliste Contributors
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program. If not, see <https://www.gnu.org/licenses/>.

import { PriceEntry } from '@/types/index';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

function getDaysAgo(dateString: string): string {
  const days = Math.floor((Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24));
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  return `${days} days ago`;
}

type Props = {
  entries: PriceEntry[];
  onConfirm: (id: number) => void;
  onFlag: (id: number) => void;
  onAddToBasket: (entry: PriceEntry) => void;
};

export default function PriceList({ entries, onConfirm, onFlag, onAddToBasket }: Props) {
  if (entries.length === 0) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>💰 Price Comparison</Text>
      <Text style={styles.freshnessNote}>Showing prices from the last 30 days only</Text>

      {entries.map((entry, index) => {
        const cheapest = index === 0;
        const daysAgo = getDaysAgo(entry.created_at);

        return (
          <View
            key={entry.id}
            style={[styles.row, cheapest && styles.cheapestRow]}
          >
            <View style={styles.rowLeft}>
              {cheapest && <Text style={styles.crown}>🏆 </Text>}
              <View>
                <Text style={[styles.storeName, cheapest && styles.cheapestText]}>
                  {entry.store_name}
                </Text>
                <Text style={styles.meta}>
                  {entry.confirms > 0 ? `✅ ${entry.confirms} confirmed` : ''}
                  {entry.flags > 0 ? ` · 🚩 ${entry.flags} flagged` : ''}
                </Text>
              </View>
            </View>

            <View style={styles.rowRight}>
              <Text style={[styles.price, cheapest && styles.cheapestText]}>
                €{entry.price.toFixed(2)}
              </Text>
              <Text style={styles.meta}>{daysAgo}</Text>
            </View>

            <View style={styles.voteRow}>
              <TouchableOpacity style={styles.confirmButton} onPress={() => onConfirm(entry.id)}>
                <Text style={styles.voteButtonText}>👍</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.flagButton} onPress={() => onFlag(entry.id)}>
                <Text style={styles.voteButtonText}>🚩</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.addButton} onPress={() => onAddToBasket(entry)}>
                <Text style={styles.addButtonText}>+ Basket</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    width: '100%',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 12, color: '#333' },
  freshnessNote: { fontSize: 11, color: '#999', marginBottom: 8, fontStyle: 'italic' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  cheapestRow: { backgroundColor: '#f0fff4', borderRadius: 8, paddingHorizontal: 8 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  rowRight: { alignItems: 'flex-end' },
  crown: { fontSize: 16 },
  storeName: { fontSize: 15, color: '#444' },
  cheapestText: { color: '#27ae60', fontWeight: 'bold' },
  price: { fontSize: 16, fontWeight: '600', color: '#333' },
  meta: { fontSize: 11, color: '#999', marginTop: 2 },
  voteRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  confirmButton: { backgroundColor: '#d5f5e3', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  flagButton: { backgroundColor: '#fde8e8', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  voteButtonText: { fontSize: 12 },
  addButton: { marginTop: 6, backgroundColor: '#3498db', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  addButtonText: { color: '#fff', fontSize: 12, fontWeight: '600' },
});
