import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
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
      <Text style={styles.header}>Tableau de bord</Text>
      
      <TouchableOpacity style={[styles.btn, styles.btnCamera]} onPress={openCamera}>
        <Text style={styles.btnIcon}>📷</Text>
        <Text style={styles.btnText}>Caméra</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.btn, styles.btnBio]} onPress={testBiometrics}>
        <Text style={styles.btnIcon}>👆</Text>
        <Text style={styles.btnText}>Empreinte Digitale</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.btn, shakeEnabled ? styles.btnActive : styles.btnShake]} onPress={toggleShake}>
        <Text style={styles.btnIcon}>📳</Text>
        <Text style={styles.btnText}>{shakeEnabled ? 'Secousse: ON' : 'Secousse: OFF'}</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.lockBtn} onPress={onLock}>
        <Text style={styles.lockText}>🔒 Verrouiller</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5', padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 40, color: '#333' },
  btn: { width: 250, padding: 20, borderRadius: 15, alignItems: 'center', marginVertical: 10, elevation: 3 },
  btnCamera: { backgroundColor: '#4CAF50' },
  btnBio: { backgroundColor: '#2196F3' },
  btnShake: { backgroundColor: '#FF9800' },
  btnActive: { backgroundColor: '#f44336' },
  btnIcon: { fontSize: 32, marginBottom: 5 },
  btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  captureBtn: { position: 'absolute', bottom: 40, alignSelf: 'center', width: 70, height: 70, borderRadius: 35, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  captureInner: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#fff', borderWidth: 2, borderColor: '#333' },
  closeBtn: { position: 'absolute', top: 40, right: 20, backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 20 },
  closeText: { color: '#fff', fontSize: 20 },
  lockBtn: { position: 'absolute', bottom: 30, backgroundColor: '#333', padding: 15, borderRadius: 10, width: 250, alignItems: 'center' },
  lockText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});