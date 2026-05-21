import { useBasket } from '@/hooks/useBasket';
import { Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function BasketScreen() {
  const { basket, removeItem, updateQuantity, clearBasket, total, itemCount } = useBasket();

  if (basket.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>🛒</Text>
        <Text style={styles.emptyTitle}>Your basket is empty</Text>
        <Text style={styles.emptySubtitle}>
          Scan a product and tap "+ Basket" to add items
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🛒 My Basket</Text>
      <FlatList
        data={basket}
        keyExtractor={item => `${item.barcode}-${item.store_name}`}
        renderItem={({ item }) => (
          <View style={styles.itemCard}>
            <View style={styles.itemLeft}>
              {item.image_url
                ? <Image source={{ uri: item.image_url }} style={styles.itemImage} />
                : <View style={styles.itemImagePlaceholder}>
                    <Text style={styles.placeholderEmoji}>📦</Text>
                  </View>
              }
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {item.product_name}
                </Text>
                <Text style={styles.itemStore}>{item.store_name}</Text>
                <Text style={styles.itemPrice}>
                  €{item.dealTotal ? item.dealTotal.toFixed(2) : (item.price * item.quantity).toFixed(2)}
                </Text>
              </View>
            </View>
            <View style={styles.itemRight}>
              <View style={styles.quantityRow}>
                <TouchableOpacity
                  style={styles.qtyButton}
                  onPress={() => updateQuantity(item.barcode, item.store_name, item.quantity - 1)}
                >
                  <Text style={styles.qtyButtonText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.qtyText}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.qtyButton}
                  onPress={() => updateQuantity(item.barcode, item.store_name, item.quantity + 1)}
                >
                  <Text style={styles.qtyButtonText}>+</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeItem(item.barcode, item.store_name)}
              >
                <Text style={styles.removeButtonText}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        style={styles.list}
      />
      <View style={styles.totalCard}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>{itemCount} item{itemCount !== 1 ? 's' : ''}</Text>
          <Text style={styles.totalAmount}>€{total.toFixed(2)}</Text>
        </View>
        <TouchableOpacity
          style={styles.clearButton}
          onPress={() => Alert.alert(
            'Clear basket?',
            'This will remove all items.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Clear', style: 'destructive', onPress: clearBasket }
            ]
          )}
        >
          <Text style={styles.clearButtonText}>Clear Basket 🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, backgroundColor: '#f9f9f9' },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 8, color: '#333' },
  emptySubtitle: { fontSize: 15, color: '#888', textAlign: 'center', lineHeight: 22 },
  title: { fontSize: 26, fontWeight: 'bold', padding: 20, paddingBottom: 10 },
  list: { flex: 1 },
  itemCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 16, marginVertical: 6, padding: 12, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  itemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  itemImage: { width: 56, height: 56, resizeMode: 'contain', borderRadius: 8, marginRight: 12 },
  itemImagePlaceholder: { width: 56, height: 56, backgroundColor: '#f0f0f0', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  placeholderEmoji: { fontSize: 24 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 2 },
  itemStore: { fontSize: 12, color: '#888', marginBottom: 2 },
  itemPrice: { fontSize: 15, fontWeight: 'bold', color: '#2ecc71' },
  itemRight: { alignItems: 'flex-end', marginLeft: 8 },
  quantityRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  qtyButton: { width: 28, height: 28, backgroundColor: '#f0f0f0', borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  qtyButtonText: { fontSize: 18, color: '#333', fontWeight: 'bold' },
  qtyText: { fontSize: 16, fontWeight: '600', marginHorizontal: 10, minWidth: 20, textAlign: 'center' },
  removeButton: { paddingHorizontal: 10, paddingVertical: 4, backgroundColor: '#ffe0e0', borderRadius: 10 },
  removeButtonText: { fontSize: 12, color: '#e74c3c', fontWeight: '600' },
  totalCard: { backgroundColor: '#fff', margin: 16, padding: 20, borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  totalLabel: { fontSize: 16, color: '#666' },
  totalAmount: { fontSize: 28, fontWeight: 'bold', color: '#2ecc71' },
  clearButton: { backgroundColor: '#fff0f0', padding: 12, borderRadius: 10, alignItems: 'center' },
  clearButtonText: { color: '#e74c3c', fontWeight: '600', fontSize: 15 },
});