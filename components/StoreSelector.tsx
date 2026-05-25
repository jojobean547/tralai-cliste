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

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  stores: string[];
  selectedStore: string;
  onSelect: (store: string) => void;
};

export default function StoreSelector({ stores, selectedStore, onSelect }: Props) {
  return (
    <>
      <Text style={styles.label}>Which store?</Text>
      <View style={styles.row}>
        {stores.map(store => (
          <TouchableOpacity
            key={store}
            style={[styles.button, selectedStore === store && styles.buttonSelected]}
            onPress={() => onSelect(store)}
          >
            <Text style={[styles.buttonText, selectedStore === store && styles.buttonTextSelected]}>
              {store}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 15,
    fontWeight: '600',
    alignSelf: 'flex-start',
    marginBottom: 8,
    marginTop: 12,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  buttonSelected: {
    backgroundColor: '#2ecc71',
    borderColor: '#2ecc71',
  },
  buttonText: {
    fontSize: 13,
    color: '#444',
  },
  buttonTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
});
