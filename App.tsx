import React, { useEffect, useState } from 'react';
import {
  Alert, ActivityIndicator, View, Text , NativeModules , NativeEventEmitter 
} from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
console.log(NativeModules);
const { FromReactModule } = NativeModules;
import { subscribeToFCMMessages } from './utils/FCMHandler';
import {  NavigationContainer   } from '@react-navigation/native';
import Toast from 'react-native-toast-message';


const { RNEventEmitter } = NativeModules;
if (!RNEventEmitter) {
    console.log('RNEventEmitter module not found.');
}

if (RNEventEmitter) {
  const eventEmitter = new NativeEventEmitter(RNEventEmitter);

  // 안드로이드 노티 타고 들어오는 경우 
  eventEmitter.addListener('FCMMessageReceived', (message) => {
      console.log('FCM Message2:', message , message.to2 );

      const to2 = message.to2;
      const from2 = message.from2;
      const body2 = message.body;
      const tit = message.title
      const productID = message.productID

      console.log(`Message to: ${to2}, from: ${from2}`);


     // showAlert( 'kk ${to2}'  , from2 , body2 , tit )


  });
} else {
  console.log('2Unable to find RNEventEmitter module.');
}

import { integer } from 'aws-sdk/clients/cloudfront'; 
import ProductList from './screens/ProductList';
import ProductDetail from './screens/ProductDetail';
import ProductUpload from './screens/ProductUpload';
import Event2 from './screens/Event2';
import MyInfo from './screens/MyInfo';
import Tezt from './screens/Tezt';
import Login from './screens/Login';
import { autoLogin } from './utils/auth';  // Only import autoLogin for auto-login functionality
import AsyncStorage from '@react-native-async-storage/async-storage';
 

type Item = {
  id: integer;
  name: string;
  description: string;
  photo_path: string;
  price : string ;
  category_name : string;
  category_id : integer;
  year2: string;
  address: string;
  email: string;
};
 
const Stack = createStackNavigator();

const App =  ({ navigation }) : JSX.Element  => {
  //const navigation = useNavigation();
  const [user, setUser] = useState(null);  // Handle authenticated user state
  const [isLoading, setIsLoading] = useState(true);  // Handle loading state

  const showAlert = (to2, from2, body2 , tit,productID,categoryId ) => {
    Alert.alert(
      tit ,
      body2 ,
      [
       //{ text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
        { text: 'OK', onPress: () => 
          {
            console.log('OK Pressed')  
            const item: Item = {
              id: productID ,
              name: "",
              description: "",
              photo_path: "",
              price: "100.00",
              category_name: "",
              category_id: categoryId ,
              year2: "",
              address: "",
              email: "",
            };
            navigation.navigate('ProductDetail', { item }) //
          }
         },
      ],
      { cancelable: false }
    );
  };
  

  // Function to handle login success (manual login)
  const handleLoginSuccess = (loggedInUser: any) => {
    setUser(loggedInUser);  // Update the user state on successful login
  };

  if (typeof global.featureFlags === 'undefined') {
    global.featureFlags = {
      fuseboxEnabledRelease: true, // Default to false
    };
  }


  // Auto-login functionality to check token on app start
  const attemptAutoLogin = async () => {
    try {
      const autoLoginResult = await autoLogin();  // Perform auto-login

      if (autoLoginResult && autoLoginResult.user) {
        setUser(autoLoginResult.user);  // If auto-login successful, update user
       await AsyncStorage.setItem( 'email', autoLoginResult.user.email   ) //getItem('email');
       FromReactModule.receiveDataFromReact( autoLoginResult.user.email  );
      } else {
        console.log('No user found or token expired');
      }
    } catch (error) {
      console.error('Auto-login failed:', error);
    } finally {
      setIsLoading(false);  // Loading is done whether success or failure
    }
  };

  useEffect(() => {
    attemptAutoLogin();  // Trigger auto-login when the app starts
    const unsubscribe = subscribeToFCMMessages((message) => {
      console.log('Received FCM message:', message);

      const to2 = message.to2;
      const from2 = message.from2;
      const body2 = message.body;
      const tit = message.title
      const productID = message.productID
      const categoryId = message.categoryId

      console.log(`Message to: ${to2}, from: ${from2}`);

      if (to2 && from2 ) {
      showAlert( to2 , from2 , body2 , tit , productID , categoryId  )
      // Handle the message data here
      }
  });

  return () => unsubscribe();
  }, []);

  if (isLoading) {
    // Show loading screen while checking auto-login status
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={user ? "ProductList" : "Login"}>
        {!user ? (
          <>
          <Stack.Screen 
            name="Login" 
            options={{ headerShown: false }}  // Hide header for login screen
          >
            {props => <Login onLoginSuccess={handleLoginSuccess} {...props} />}
          </Stack.Screen>
          <Stack.Screen 
          name="ProductList" 
         component={ ProductList } 
         options={{ headerShown: false }}  // Hide header for this screen
         />
        <Stack.Screen 
              name="ProductDetail" 
              component={ProductDetail} 
              options={{ 
                headerBackTitleVisible: false,  // Hide the parent screen name
                title: 'to Buy', 
               }}  // Hide header for this screen
            />
          <Stack.Screen
              name="MyInfo"
              component={MyInfo}
              options={{
                headerBackTitleVisible: false,  // Hide the parent screen name
                title: 'MyInfo',  // Set a custom title for the current screen
              }}
            />

          <Stack.Screen
              name="Event2"
              component={Event2}
              options={{
                headerBackTitleVisible: false,  // Hide the parent screen name
                title: 'Event',  // Set a custom title for the current screen
              }}
            />    




          </>
        ) : (
          <>
          <Stack.Screen 
            name="Login" 
           component={Login} 
           options={{ headerShown: false }} 
            />
          
            <Stack.Screen 
              name="ProductList" 
              component={ ProductList } 
              options={{ headerShown: false }}  // Hide header for this screen
            />
            <Stack.Screen 
              name="ProductDetail" 
              component={ProductDetail} 
              options={{ 
                headerBackTitleVisible: false,  // Hide the parent screen name
                title: 'to Buy', 
               }}  // Hide header for this screen
            />
            <Stack.Screen
              name="ProductUpload"
              component={ProductUpload}
              options={{
                headerBackTitleVisible: false,  // Hide the parent screen name
                title: 'Upload Product',  // Set a custom title for the current screen
              }}
            />
          
           

          <Stack.Screen
              name="MyInfo"
              component={MyInfo}
              options={{
                headerBackTitleVisible: false,  // Hide the parent screen name
                title: 'MyInfo',  // Set a custom title for the current screen
              }}
            />

          <Stack.Screen
              name="Event2"
              component={Event2}
              options={{
                headerBackTitleVisible: false,  // Hide the parent screen name
                title: 'Event',  // Set a custom title for the current screen
              }}
            />    





          </>
        )}
      </Stack.Navigator>
       <Toast />
    </NavigationContainer>
  );
};

export default App;
