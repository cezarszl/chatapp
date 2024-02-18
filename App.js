// import the screens
import Start from './components/Start';
import Chat from './components/Chat';
// import react Navigation
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// initilize Firebase and Firestore
import { initializeApp } from "firebase/app";
import { getFirestore, disableNetwork, enableNetwork } from "firebase/firestore";
// preventing log message
import { LogBox, Alert } from 'react-native';
LogBox.ignoreLogs(["AsyncStorage has been extracted from"]);
// netinfo
import { useNetInfo }from '@react-native-community/netinfo';
import { useEffect } from "react";

const Stack = createNativeStackNavigator();

const App = () => {

const connectionStatus = useNetInfo();

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC2dCso6BNdxJyrDFkmwJkRUTDfTnzvdmc",
  authDomain: "chatapp-d1ec1.firebaseapp.com",
  projectId: "chatapp-d1ec1",
  storageBucket: "chatapp-d1ec1.appspot.com",
  messagingSenderId: "940954090109",
  appId: "1:940954090109:web:d5e08d5ba09efc064a4f14"
};

useEffect(() => {
  if (connectionStatus.isConnected === false) {
    Alert.alert("Connection Lost!!");
    disableNetwork(db);
  } else if (connectionStatus.isConnected === true) {
    enableNetwork(db);
  }
}, [connectionStatus.isConnected]);

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Start"
      >
        <Stack.Screen
          name="Start"
          component={Start}
        />
        <Stack.Screen
          name="Chat"
        >
          {props => <Chat isConnected={connectionStatus.isConnected} db={db} {...props} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;