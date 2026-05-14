import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert, TextInput } from 'react-native';
import { authenticate, checkBiometrics } from '../utils/biometrics';
import Logo from '../assets/logo';
import { startShakeDetection, stopShakeDetection, getRequiredShakesForToday } from '../utils/accelerometer';

const PIN_CODE = '1234';

export default function LockScreen({ onUnlock }) {
  const [hasBiometrics, setHasBiometrics] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState('');

  useEffect(() => {
    checkBiometrics().then(({ available }) => setHasBiometrics(available));
    tryBiometricUnlock();
  }, []);

  useEffect(() => {
    const requiredShakes = getRequiredShakesForToday();
    
    // MODIFICATION : Sensibilité abaissée de 16 à 13 pour détecter les secousses plus facilement
    const unsubscribe = startShakeDetection(() => {
      Alert.alert('🔓 Succès', 'Déverrouillé par secousse mathématique !');
      onUnlock();
    }, 13); 

    return () => {
      unsubscribe();
      stopShakeDetection();
    };
  }, []);

  const tryBiometricUnlock = async () => {
    const { success } = await authenticate('Déverrouiller BiométrieLock');
    if (success) onUnlock();
  };

  const checkPin = () => {
    if (pin === PIN_CODE) {
      onUnlock();
    } else {
      Alert.alert('Erreur', 'Code PIN incorrect');
      setPin('');
    }
  };

  return (
    <View style={styles.container}>
      <Logo size={120} />
      <Text style={styles.title}>BiométrieLock</Text>
      
      {hasBiometrics && !showPin && (
        <>
          <TouchableOpacity style={styles.btnPrimary} onPress={tryBiometricUnlock}>
            <Text style={styles.btnText}>🔓 Empreinte / Face ID</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.btnSecondary} onPress={() => setShowPin(true)}>
            <Text style={styles.btnTextSecondary}>🔢 Code PIN</Text>
          </TouchableOpacity>
        </>
      )}
      
      {showPin && (
        <View style={styles.pinContainer}>
          <TextInput
            style={styles.input}
            secureTextEntry
            keyboardType="numeric"
            maxLength={4}
            placeholder="Entrez le PIN"
            value={pin}
            onChangeText={setPin}
          />
          <TouchableOpacity style={styles.btnPrimary} onPress={checkPin}>
            <Text style={styles.btnText}>Déverrouiller</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowPin(false)}>
            <Text style={styles.link}>Retour</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a2e' },
  logo: { width: 120, height: 120, marginBottom: 20 },
  title: { fontSize: 28, color: '#fff', fontWeight: 'bold', marginBottom: 10 }, // Marge réduite pour intégrer le texte
  // AJOUT : Style pour le texte de débogage
  debugText: { color: '#a0a0b8', fontSize: 14, marginBottom: 30, fontWeight: '500' },
  btnPrimary: { backgroundColor: '#e94560', padding: 15, borderRadius: 10, width: 250, alignItems: 'center', marginVertical: 10 },
  btnSecondary: { backgroundColor: '#16213e', padding: 15, borderRadius: 10, width: 250, alignItems: 'center', marginVertical: 10, borderWidth: 1, borderColor: '#e94560' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  btnTextSecondary: { color: '#e94560', fontSize: 16, fontWeight: 'bold' },
  pinContainer: { alignItems: 'center' },
  input: { backgroundColor: '#fff', width: 200, padding: 15, borderRadius: 10, textAlign: 'center', fontSize: 20, marginBottom: 20 },
  link: { color: '#e94560', marginTop: 15 }
});

