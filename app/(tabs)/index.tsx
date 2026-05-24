import { useBasket } from '@/hooks/useBasket';
import { useNetwork } from '@/hooks/useNetwork';
import { useProductCache } from '@/hooks/useProductCache';
import { supabase } from '@/services/supabase';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

// 🔑 Replace these with YOUR values from Supabase
const ANTHROPIC_API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY || '';

const STORES = ['Tesco', 'Dunnes Stores', 'SuperValu', 'Lidl', 'Aldi'];

type PriceEntry = {
  id: number;
  store_name: string;
  price: number;
  created_at: string;
  confirms: number;
  flags: number;
};

export default function HomeScreen() {
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [error, setError] = useState('');
  const [price, setPrice] = useState('');
  const [selectedStore, setSelectedStore] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [priceEntries, setPriceEntries] = useState<PriceEntry[]>([]);
  const [dealQuantity, setDealQuantity] = useState(1);
  const [aiLoading, setAiLoading] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const { addItem, basket } = useBasket();
  const { getCachedProduct, cacheProduct, getCachedPrices, cachePrices, addPendingSubmission, getPendingSubmissions, removePendingSubmission } = useProductCache();
  const { isOnline } = useNetwork();
  const [dealTotal, setDealTotal] = useState<number | null>(null);

  const getDaysAgo = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'today';
    if (days === 1) return 'yesterday';
    return `${days} days ago`;
  };

  const deduplicateByStore = (prices: PriceEntry[]): PriceEntry[] => {
    const seen = new Set<string>();

    return prices
      .filter(price => {
        const key = `${price.store_name}-${price.price}`;
        if (seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      })
      .sort((a, b) => {
        // 1st — cheapest price
        if (a.price !== b.price) {
          return a.price - b.price;
        }

        // 2nd — most confirmed
        if (b.confirms !== a.confirms) {
          return b.confirms - a.confirms;
        }

        // 3rd — least flagged
        if (a.flags !== b.flags) {
          return a.flags - b.flags;
        }

        // 4th — most recent
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  };


  const lookUpProduct = async (barcode: string) => {
    setScanning(false);
    setLoading(true);
    setError('');
    setProduct(null);
    setPrice('');
    setSelectedStore('');
    setSubmitted(false);
    setDealQuantity(1);
    setPriceEntries([]);
    setDealTotal(null);

    // Check local cache first
    const cachedProduct = getCachedProduct(barcode);
    const cachedPrices = getCachedPrices(barcode) as PriceEntry[];

    if (cachedProduct) {
      setProduct({ ...cachedProduct, barcode });
    }

    if (cachedPrices.length > 0) {
      setPriceEntries(cachedPrices);
    }

    // If offline, use cache only
    if (!isOnline) {
      if (!cachedProduct) {
        setError('📡 You\'re offline. This product hasn\'t been scanned before so we don\'t have it cached yet.');
      } else {
        setError('📡 You\'re offline — showing cached data. Prices may not be up to date.');
      }
      setLoading(false);
      return;
    }

    // Online — fetch fresh data
    try {
      const foodResponse = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
        {
          headers: {
            'User-Agent': 'Tralai/1.0 (tralai.ie) - Irish grocery price comparison app',
          }
        }
      );

      const text = await foodResponse.text();

      let foodData;
      try {
        foodData = JSON.parse(text);
      } catch (parseError) {
        if (!cachedProduct) {
          setError('🔧 Product database is temporarily unavailable. Please try again later.');
        }
        setLoading(false);
        return;
      }

      if (foodData.status === 1) {
        const freshProduct = { ...foodData.product, barcode };
        setProduct(freshProduct);
        cacheProduct(barcode, foodData.product);
      } else if (!cachedProduct) {
        setError('Product not found in database');
      }

      // Fetch fresh prices from Supabase
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const priceResponse = await supabase
        .from('prices')
        .select('id, store_name, price, created_at, confirms, flags')
        .eq('barcode', barcode)
        .eq('status', 'active')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false });
      if (priceResponse.data && priceResponse.data.length > 0) {
        setPriceEntries(deduplicateByStore(priceResponse.data));
        cachePrices(barcode, priceResponse.data);
      }

    } catch (e: any) {
      if (!cachedProduct) {
        setError('🌐 Could not connect. Check your internet connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddToBasket = (entry: PriceEntry) => {

    const alreadyInBasket = basket.some(
      item => item.barcode === product.barcode && item.store_name === entry.store_name
    );
    if (alreadyInBasket) {
      Alert.alert('Already in basket', 'This item from this store is already in your basket.');
      return;
    }
    addItem({
      barcode: product.barcode,
      product_name: product.product_name || 'Unknown product',
      image_url: product.image_url || null,
      store_name: entry.store_name,
      price: entry.price,
      quantity: dealQuantity,
      dealTotal: dealTotal || undefined,
    } as any);

    const msg = dealQuantity > 1
      ? `${product.product_name} × ${dealQuantity} added (deal quantity)`
      : `${product.product_name} added to your basket.`;

    Alert.alert('Added! 🛒', msg);
    setDealQuantity(1); // reset after adding
  };

  const confirmPrice = async (entryId: number) => {
    // First get current confirms value
    const entry = priceEntries.find(e => e.id === entryId);
    if (!entry) return;

    const newConfirms = (entry.confirms || 0) + 1;

    const { error } = await supabase
      .from('prices')
      .update({ confirms: newConfirms })
      .eq('id', entryId);

    if (!error) {
      setPriceEntries(prev =>
        prev.map(e => e.id === entryId
          ? { ...e, confirms: newConfirms }
          : e
        )
      );
      Alert.alert('👍 Thanks!', 'You confirmed this price is correct.');
    } else {
      Alert.alert('Error', 'Could not confirm price. Please try again.');
    }
  };

  const flagPrice = async (entryId: number) => {
    Alert.alert(
      '🚩 Flag this price',
      'Is this price incorrect or suspicious?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, flag it',
          style: 'destructive',
          onPress: async () => {
            const entry = priceEntries.find(e => e.id === entryId);
            const newFlags = (entry?.flags || 0) + 1;

            const { error } = await supabase
              .from('prices')
              .update({
                flags: newFlags,
                status: newFlags >= 3 ? 'hidden' : 'active'
              })
              .eq('id', entryId);

            if (!error) {
              if (newFlags >= 3) {
                setPriceEntries(prev => prev.filter(e => e.id !== entryId));
                Alert.alert('✅ Reported', 'This price has been hidden pending review. Thank you!');
              } else {
                setPriceEntries(prev =>
                  prev.map(e => e.id === entryId ? { ...e, flags: newFlags } : e)
                );
                Alert.alert('✅ Reported', 'Thank you for helping keep our data accurate!');
              }
            }
          }
        }
      ]
    );
  };

  const submitPrice = async () => {

    if (!price || !selectedStore) {
      setError('Please enter a price and select a store');
      return;
    }

    const parsedPrice = parseFloat(price);

    // Basic validation
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setError('Please enter a valid price');
      return;
    }

    if (parsedPrice >= 500) {
      setError('Price seems too high — is this a grocery item?');
      return;
    }

    if (parsedPrice <= 0.01) {
      setError('Price seems too low — please check and try again');
      return;
    }

    // Outlier check against existing prices
    if (priceEntries.length > 2) {
      const avgPrice = priceEntries.reduce((sum, p) => sum + p.price, 0) / priceEntries.length;
      if (parsedPrice > avgPrice * 3 || parsedPrice < avgPrice / 3) {
        Alert.alert(
          '⚠️ Unusual price',
          `The average price for this product is €${avgPrice.toFixed(2)}. You entered €${parsedPrice.toFixed(2)}.\n\nAre you sure this is correct?`,
          [
            { text: 'Yes, submit anyway', onPress: () => proceedWithSubmit(parsedPrice) },
            { text: 'Let me check', style: 'cancel' }
          ]
        );
        return;
      }
    }

    // No outlier — proceed normally
    proceedWithSubmit(parsedPrice);
  };


  const proceedWithSubmit = async (parsedPrice: number) => {
    setSaving(true);
    setError('');

    // If offline — queue the submission
    if (!isOnline) {
      addPendingSubmission({
        barcode: product.barcode,
        product_name: product.product_name || 'Unknown',
        store_name: selectedStore,
        price: parsedPrice,
      });
      setSaving(false);
      setSubmitted(true);
      return;
    }

    // Online — submit immediately
    const { error: saveError } = await supabase
      .from('prices')
      .insert({
        barcode: product.barcode,
        product_name: product.product_name || 'Unknown',
        store_name: selectedStore,
        price: parsedPrice,
      });

    setSaving(false);

    if (saveError) {
      // Handle duplicate submission gracefully
      if (saveError.message.includes('Duplicate price submission')) {
        setError('You already submitted a price for this product in this store today. Thank you! 😊');
      } else {
        setError(saveError.message);
      }
    } else {
      setSubmitted(true);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data } = await supabase
        .from('prices')
        .select('id, store_name, price, created_at, confirms, flags')
        .eq('barcode', product.barcode)
        .eq('status', 'active')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false });
      if (data) {
        setPriceEntries(deduplicateByStore(data));
        cachePrices(product.barcode, data);
      }
    }
  };

  const extractDealQuantity = (dealText: string): number => {
    if (!dealText) return 1;

    // Match patterns like "3 for €5", "2 for €4", "Any 2 for €3"
    const match = dealText.match(/(\d+)\s+for/i);
    if (match) return parseInt(match[1]);

    // Match "Buy 2 get 1 free" = 3 items total
    const buyGetMatch = dealText.match(/buy\s+(\d+)\s+get\s+(\d+)/i);
    if (buyGetMatch) {
      return parseInt(buyGetMatch[1]) + parseInt(buyGetMatch[2]);
    }

    return 1;
  };

  
  const extractDealInfo = (dealText: string, dealPricePerItem: number, singlePrice: number): { quantity: number; totalPrice: number } => {
    if (!dealText) return { quantity: 1, totalPrice: singlePrice };
    
    // Match "3 for 2" — buy 3 pay for 2
    const forMatch = dealText.match(/(\d+)\s+for\s+(\d+)$/i);
    if (forMatch) {
      const buyQty = parseInt(forMatch[1]);
      const payQty = parseInt(forMatch[2]);

      // If payQty looks like a small number (not a price), treat as "pay for X items"
      if (payQty < 10 && !dealText.includes('€') && !dealText.includes('£') && !dealText.includes('$')) {
        return {
          quantity: buyQty,
          totalPrice: payQty * singlePrice  // pay for 2 items at single price
        };
      }

      // Otherwise treat payQty as a euro amount e.g. "3 for €5"
      return {
        quantity: buyQty,
        totalPrice: payQty
      };
    }

    // Match "3 for €5.00" explicitly
    const priceMatch = dealText.match(/(\d+)\s+for\s+[€£$]?\s*(\d+\.?\d*)/i);
    if (priceMatch) {
      return {
        quantity: parseInt(priceMatch[1]),
        totalPrice: parseFloat(priceMatch[2])
      };
    }

    // Buy 2 get 1 free = 3 items, pay for 2
    const buyGetMatch = dealText.match(/buy\s+(\d+)\s+get\s+(\d+)/i);
    if (buyGetMatch) {
      const paying = parseInt(buyGetMatch[1]);
      const free = parseInt(buyGetMatch[2]);
      return {
        quantity: paying + free,
        totalPrice: dealPricePerItem * paying
      };
    }

    return { quantity: 1, totalPrice: singlePrice };
  };

  const scanPriceTag = async () => {

    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Please allow camera access to scan price tags.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      base64: true,
      quality: 0.7,
    });

    //console.log('Image result canceled:', result.canceled);
    //console.log('Has base64:', !!result.assets?.[0]?.base64);

    if (result.canceled || !result.assets[0].base64) {
      //console.log('Returning early — no image');
      return;
    }

    //console.log('Sending to AI...');
    setAiLoading(true);
    setError('');

    try {
      //console.log('Calling Anthropic API...');
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-opus-4-5',
          max_tokens: 100,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image',
                  source: {
                    type: 'base64',
                    media_type: 'image/jpeg',
                    data: result.assets[0].base64,
                  },
                },
                {
                  type: 'text',
                  text: `You are scanning an Irish supermarket shelf price label. Extract the pricing information and respond in this exact JSON format:

                  {
                    "single_price": 1.99,
                    "deal": "3 for €5.00",
                    "deal_price_per_item": 1.67,
                    "has_deal": true
                  }

                  Rules:
                  - single_price: the normal price for one item (required, number only, no currency symbol)
                  - deal: the deal text exactly as shown e.g. "3 for €5", "Buy 2 get 1 free", "2 for €3" (null if no deal)
                  - deal_price_per_item: price per item if deal is taken up (null if no deal or cannot calculate)
                  - has_deal: true if there is a multi-buy deal, false if not
                  - If you cannot find any price at all, respond with: NONE
                  - Respond with JSON only, no other text`,
                },
              ],
            },
          ],
        }),
      });

      console.log('API response status:', response.status);
      const data = await response.json();

      console.log('AI raw response:', JSON.stringify(data).substring(0, 300));
      
      const rawResponse = data?.content?.[0]?.text?.trim();

      if (!rawResponse) {
        Alert.alert('Could not read price', 'Please try again or type the price manually.');
        return;
      }

      const cleaned = rawResponse
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      if (!cleaned || cleaned === 'NONE') {
        Alert.alert('Could not read price', 'Please try again or type the price manually.');
        return;
      } 
      
      try {
        const priceData = JSON.parse(cleaned);

        //console.log('AI raw response:', cleaned);

        // Fill in the single price
        setPrice(String(priceData.single_price));

        // Build alert message
        let message = `Single price: €${priceData.single_price}`;

        if (priceData.has_deal && priceData.deal) {
          message += `\n\n🏷️ Deal found: ${priceData.deal}`;
          if (priceData.deal_price_per_item) {
            message += `\n💰 Price per item with deal: €${priceData.deal_price_per_item.toFixed(2)}`;
          }
          message += `\n\nThe single price has been filled in. You can change it to the deal price per item if you prefer.`;
        } else {
          message += `\n\nDoes this look right? You can correct it before submitting.`;
        }

        Alert.alert('💰 Price detected!', message, [
          { text: 'Use single price', style: 'default' },
          priceData.deal_price_per_item
            ? {
                text: `Use deal price (€${priceData.deal_price_per_item.toFixed(2)})`,
                onPress: () => {
                  const { quantity, totalPrice } = extractDealInfo(
                    priceData.deal || '',
                    priceData.deal_price_per_item,
                    priceData.single_price
                  );
                  setPrice(String(priceData.deal_price_per_item.toFixed(2)));
                  setDealQuantity(quantity);
                  setDealTotal(totalPrice);
                  if (quantity > 1) {
                    Alert.alert(
                      '🛒 Deal quantity set!',
                      `Quantity set to ${quantity}.\nBasket total will show exactly €${totalPrice.toFixed(2)}`,
                      [{ text: 'Perfect!', style: 'default' }]
                    );
                  }
                }
              }
            : { text: 'OK', style: 'default' }
        ]);

      } catch (parseError) {
        // If JSON parse fails, try to use raw response as a plain price
        const plainPrice = rawResponse.replace(/[^0-9.]/g, '');
        if (plainPrice) {
          setPrice(plainPrice);
          Alert.alert('💰 Price detected!', `Found: €${plainPrice}\n\nDoes this look right?`,
            [{ text: 'Looks good!', style: 'default' }]
          );
        } else {
          Alert.alert('Could not read price', 'Please try again or type manually.');
        }
      }
    } catch (e: any) {
        console.log('API Error:', e.message);
        console.log('Full error:', JSON.stringify(e));
        Alert.alert('API Error', e.message || JSON.stringify(e));
    } finally {
      setAiLoading(false);
    }
  };

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.result}>We need camera permission to scan barcodes</Text>
        <Button title="Grant Permission" onPress={requestPermission} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container}>

        {scanning && (
          <CameraView
            style={styles.camera}
            onBarcodeScanned={({ data }) => lookUpProduct(data)}
            barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8'] }}
          />
        )}

        {!scanning && (
          <>
            <Text style={styles.title}>🛒 Tralaí</Text>

            {!isOnline && (
              <View style={styles.offlineBanner}>
                <Text style={styles.offlineBannerText}>
                  📡 You're offline — showing cached data
                </Text>
              </View>
            )}

            {loading && (
              <>
                <ActivityIndicator size="large" color="#2ecc71" />
                <Text style={styles.result}>Looking up product...</Text>
              </>
            )}

            {error ? <Text style={styles.error}>{error}</Text> : null}

            {/* Price comparison list */}
            {priceEntries.length > 0 && (
              <View style={styles.priceCard}>
                <Text style={styles.priceCardTitle}>💰 Price Comparison</Text>
                <Text style={styles.freshnessNote}>
                  Showing prices from the last 30 days only
                </Text>
                {priceEntries.map((entry, index) => (
                  <View key={entry.id} style={[
                    styles.priceRow,
                    index === 0 && styles.cheapestRow
                  ]}>
                    <View style={styles.priceRowLeft}>
                      {index === 0 && <Text style={styles.crownEmoji}>🏆 </Text>}
                      <Text style={[
                        styles.storeName,
                        index === 0 && styles.cheapestText
                      ]}>
                        {entry.store_name}
                      </Text>
                      <Text style={styles.daysAgo}>
                        {getDaysAgo(entry.created_at)}
                        {entry.confirms > 0 ? ` · ✅ ${entry.confirms} confirmed` : ''}
                        {entry.flags > 0 ? ` · 🚩 ${entry.flags} flagged` : ''}
                      </Text>
                    </View>
                    <View style={styles.priceRowRight}>
                      <Text style={[
                        styles.priceText,
                        index === 0 && styles.cheapestText
                      ]}>
                        €{entry.price.toFixed(2)}
                      </Text>
                      <Text style={styles.daysAgo}>
                        {getDaysAgo(entry.created_at)}
                      </Text>
                    </View>
                    <View style={styles.voteRow}>
                      <TouchableOpacity
                        style={styles.confirmButton}
                        onPress={() => confirmPrice(entry.id)}
                      >
                        <Text style={styles.voteButtonText}>👍</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.flagButton}
                        onPress={() => flagPrice(entry.id)}
                      >
                        <Text style={styles.voteButtonText}>🚩</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => handleAddToBasket(entry)}
                      >
                        <Text style={styles.addButtonText}>+ Basket</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {priceEntries.length === 0 && product && !loading && (
              <View style={styles.noPricesBox}>
                <Text style={styles.noPricesText}>
                  📭 No prices yet for this product — be the first!
                </Text>
              </View>
            )}

            {submitted && (
              <View style={styles.successBox}>
                <Text style={styles.successText}>
                  ✅ Price saved! Thank you for helping the community!
                </Text>
              </View>
            )}

            {product && !submitted && (
              <View style={styles.productCard}>
                {product.image_url && (
                  <Image
                    source={{ uri: product.image_url }}
                    style={styles.productImage}
                  />
                )}
                <Text style={styles.productName}>
                  {product.product_name || 'Unknown product'}
                </Text>
                <Text style={styles.productBrand}>
                  {product.brands || ''}
                </Text>
                <Text style={styles.productQuantity}>
                  {product.quantity || ''}
                </Text>

                <Text style={styles.sectionLabel}>What's the price? (€)</Text>
                <TextInput
                  style={styles.priceInput}
                  keyboardType="decimal-pad"
                  placeholder="e.g. 3.50"
                  value={price}
                  onChangeText={setPrice}
                />

                <TouchableOpacity
                  style={styles.scanPriceButton}
                  onPress={scanPriceTag}
                  disabled={aiLoading}
                >
                  {aiLoading
                    ? <>
                        <ActivityIndicator color="#fff" size="small" />
                        <Text style={styles.scanPriceButtonText}> AI reading price...</Text>
                      </>
                    : <Text style={styles.scanPriceButtonText}>📷 Scan Price Tag Instead</Text>
                  }
                </TouchableOpacity>

                <Text style={styles.sectionLabel}>Which store?</Text>
                <View style={styles.storeRow}>
                  {STORES.map(store => (
                    <TouchableOpacity
                      key={store}
                      style={[
                        styles.storeButton,
                        selectedStore === store && styles.storeButtonSelected
                      ]}
                      onPress={() => setSelectedStore(store)}
                    >
                      <Text style={[
                        styles.storeButtonText,
                        selectedStore === store && styles.storeButtonTextSelected
                      ]}>
                        {store}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={submitPrice}
                  disabled={saving}
                >
                  {saving
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.submitButtonText}>Submit Price 💾</Text>
                  }
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.buttonContainer}>
              <Button
                title={product ? 'Scan Another' : 'Scan a Product'}
                onPress={() => {
                  setProduct(null);
                  setError('');
                  setSubmitted(false);
                  setPriceEntries([]);
                  setScanning(true);
                }}
              />
            </View>
          </>
        )}

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, alignItems: 'center', padding: 20, backgroundColor: '#f9f9f9' },
  camera: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, height: 600 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, marginTop: 40 },
  result: { fontSize: 16, marginBottom: 30, color: '#444' },
  error: { fontSize: 14, color: 'red', marginBottom: 16, textAlign: 'center' },
  priceCard: { backgroundColor: '#fff', padding: 16, borderRadius: 12, width: '100%', marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  priceCardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12, color: '#333' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  cheapestRow: { backgroundColor: '#f0fff4', borderRadius: 8, paddingHorizontal: 8 },
  priceRowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  priceRowRight: { alignItems: 'flex-end' },
  crownEmoji: { fontSize: 16 },
  storeName: { fontSize: 15, color: '#444' },
  cheapestText: { color: '#27ae60', fontWeight: 'bold' },
  priceText: { fontSize: 16, fontWeight: '600', color: '#333' },
  daysAgo: { fontSize: 11, color: '#999', marginTop: 2 },
  addButton: { marginTop: 6, backgroundColor: '#3498db', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  addButtonText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  noPricesBox: { backgroundColor: '#fff8e1', padding: 14, borderRadius: 10, marginBottom: 16, width: '100%' },
  noPricesText: { color: '#856404', fontSize: 14, textAlign: 'center' },
  productCard: { backgroundColor: '#fff', padding: 20, borderRadius: 12, width: '100%', marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  productImage: { width: 150, height: 150, resizeMode: 'contain', marginBottom: 12, alignSelf: 'center' },
  productName: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 },
  productBrand: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 2 },
  productQuantity: { fontSize: 13, color: '#999', textAlign: 'center', marginBottom: 16 },
  sectionLabel: { fontSize: 15, fontWeight: '600', alignSelf: 'flex-start', marginBottom: 8, marginTop: 12 },
  priceInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 18, width: '100%', marginBottom: 8, backgroundColor: '#fafafa' },
  storeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  storeButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#ddd', backgroundColor: '#fff' },
  storeButtonSelected: { backgroundColor: '#2ecc71', borderColor: '#2ecc71' },
  storeButtonText: { fontSize: 13, color: '#444' },
  storeButtonTextSelected: { color: '#fff', fontWeight: '600' },
  submitButton: { backgroundColor: '#2ecc71', padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  successBox: { backgroundColor: '#d4edda', padding: 16, borderRadius: 10, marginBottom: 20, width: '100%' },
  successText: { color: '#155724', fontSize: 15, textAlign: 'center' },
  buttonContainer: { width: '100%', marginTop: 10 },
  scanPriceButton: { backgroundColor: '#9b59b6', padding: 12, borderRadius: 10, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', marginBottom: 8 },
  scanPriceButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  offlineBanner: { backgroundColor: '#f39c12', padding: 8, borderRadius: 8, width: '100%', marginBottom: 12 },
  offlineBannerText: { color: '#fff', textAlign: 'center', fontSize: 13, fontWeight: '600' },
  voteRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  confirmButton: { backgroundColor: '#d5f5e3', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  flagButton: { backgroundColor: '#fde8e8', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  voteButtonText: { fontSize: 12 },
  freshnessNote: { fontSize: 11, color: '#999', marginBottom: 8, fontStyle: 'italic' },
});