import React, { useState } from 'react';
import { StatusBar } from 'react-native';
import LockScreen from './src/components/LockScreen';
import HomeScreen from './src/components/HomeScreen';

export default function App() {
  const [isLocked, setIsLocked] = useState(true);

  return (
    <>
      <StatusBar barStyle="light-content" />
      {isLocked ? (
        <LockScreen onUnlock={() => setIsLocked(false)} />
      ) : (
        <HomeScreen onLock={() => setIsLocked(true)} />
      )}
    </>
  );
}