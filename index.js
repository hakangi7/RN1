/**
 * @format
 */
import 'react-native-gesture-handler';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

global.featureFlags = {
    fuseboxEnabledRelease: true,  // Set to true if required
  };


AppRegistry.registerComponent(appName, () => App);
