import 'react-native-gesture-handler'; // deve ser a PRIMEIRA linha

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
