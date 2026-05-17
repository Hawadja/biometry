import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Dimensions } from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import { requestCameraPermissions, takePhoto } from '../utils/camera';
import { authenticate } from '../utils/biometrics';
import { startShakeDetection, stopShakeDetection } from '../utils/accelerometer';

export default function HomeScreen({ onLock }) {
  const [cameraOpen, setCameraOpen] = useState(false);
  const [shakeEnabled, setShakeEnabled] = useState(false);
  const cameraRef = useRef(null);
  const devices = useCameraDevices();
  const device = devices.back;

  useEffect(() => {
    return () => stopShakeDetection();
  }, []);

  const openCamera = async () => {
    const granted = await requestCameraPermissions();
    if (granted) {
      setCameraOpen(true);
    } else {
      Alert.alert('Permission refusée', 'Accès caméra nécessaire');
    }
  };

  const capturePhoto = async () => {
    const photo = await takePhoto(cameraRef);
    if (photo) {
      Alert.alert('Succès', `Photo sauvegardée: ${photo.path}`);
      setCameraOpen(false);
    }
  };

  const testBiometrics = async () => {
    const { success } = await authenticate('Test authentification');
    Alert.alert(success ? '✅ Authentifié' : '❌ Échoué');
  };

  const toggleShake = () => {
    if (!shakeEnabled) {
      startShakeDetection(() => {
        Alert.alert('📸 Secousse détectée !', 'Ouverture caméra...');
        openCamera();
      }, 15);
      setShakeEnabled(true);
      Alert.alert('Activé', 'Secouez pour prendre une photo');
    } else {
      stopShakeDetection();
      setShakeEnabled(false);
    }
  };

  if (cameraOpen && device) {
    return (
      <View style={{ flex: 1 }}>
        <Camera ref={cameraRef} style={StyleSheet.absoluteFill} device={device} isActive={true} photo={true} />
        <TouchableOpacity style={styles.captureBtn} onPress={capturePhoto}>
          <View style={styles.captureInner} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.closeBtn} onPress={() => setCameraOpen(false)}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* STRUCTURE DU BLOC INFO OCCUPANT TOUT L'ÉCRAN */}
      <View style={styles.infoSection}>
        <Text style={styles.uniTitle}>UNIVERSITÉ DE YAOUNDÉ 1</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Département :</Text>
          <Text style={styles.infoValue}>Informatique</Text>
        </View>

        {/* AJOUT DE L'EXTENSION DÉTAILLÉE ICT4D */}
        <View style={[styles.infoRow, styles.filiereRow]}>
          <View style={styles.filiereHeader}>
            <Text style={styles.infoLabel}>Filière :</Text>
            <Text style={styles.infoValue}>ICT4D</Text>
          </View>
          <Text style={styles.filiereSubtext}>Information Communication Technologies for Development</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Code Unité :</Text>
          <Text style={styles.infoValue}>ICT202</Text>
        </View>
      </View>

      {/* AJOUT DU BOUTON DE VERROUILLAGE TOUT EN BAS */}
      <TouchableOpacity style={styles.lockBtn} onPress={onLock}>
        <Text style={styles.lockText}>🔒 Verrouiller</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 20 },
  
  // Section Informations ajustée avec un espacement régulier distribué (space-evenly) sur l'écran libre
  infoSection: { flex: 1, justifyContent: 'space-evenly', width: '100%', paddingVertical: 15, marginBottom: 20 },
  uniTitle: { fontSize: 24, fontWeight: 'bold', color: '#1a1a2e', textAlign: 'center', letterSpacing: 0.5, marginBottom: 10 },
  
  // Cartes d'informations agrandies et stylisées pour un meilleur visuel
  infoRow: { backgroundColor: '#fff', padding: 20, borderRadius: 12, borderWidth: 1, borderColor: '#eef0f2', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, flexDirection: 'row', alignItems: 'center' },
  infoLabel: { fontSize: 16, fontWeight: 'bold', color: '#555', flex: 1 },
  infoValue: { fontSize: 16, fontWeight: '700', color: '#1a1a2e', textAlign: 'right' },
  
  // Styles spécifiques pour l'affichage de l'extension de la filière
  filiereRow: { flexDirection: 'column', alignItems: 'stretch' },
  filiereHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  filiereSubtext: { fontSize: 13, color: '#666', fontStyle: 'italic', textAlign: 'center', borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 8, marginTop: 2, fontWeight: '500' },

  // Nouveau style pour le bouton de verrouillage en bas
  lockBtn: { backgroundColor: '#333', padding: 16, borderRadius: 12, width: '100%', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, marginBottom: 10 },
  lockText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  captureBtn: { position: 'absolute', bottom: 40, alignSelf: 'center', width: 70, height: 70, borderRadius: 35, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  captureInner: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#fff', borderWidth: 2, borderColor: '#333' },
  closeBtn: { position: 'absolute', top: 40, right: 20, backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 20 },
  closeText: { color: '#fff', fontSize: 20 }
});