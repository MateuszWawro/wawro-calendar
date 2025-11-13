import React from 'react';
import LoginScreen from './LoginScreen';

// Register screen uses the same component as Login
// (tabs are handled within LoginScreen)
export default function RegisterScreen(props) {
  return <LoginScreen {...props} />;
}