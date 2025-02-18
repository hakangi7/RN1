import { NativeEventEmitter, NativeModules } from 'react-native';

const { RNEventEmitter } = NativeModules;
const eventEmitter = new NativeEventEmitter(RNEventEmitter);

export const subscribeToFCMMessages = (callback) => {
    const subscription = eventEmitter.addListener('FCMMessageReceived', callback);
    return () => subscription.remove();
};
