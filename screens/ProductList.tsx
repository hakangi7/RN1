import React, { useEffect, useState, useCallback } from 'react';
//import messaging from '@react-native-firebase/messaging';
import {
  SafeAreaView,
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  Button,
  ScrollView,
  Platform,Dimensions,ImageBackground ,Alert,PermissionsAndroid,Linking
} from 'react-native';

import Geolocation from 'react-native-geolocation-service';
import { check ,request,openSettings, PERMISSIONS, RESULTS } from 'react-native-permissions';

import Toast from 'react-native-toast-message';
import NetworkService from '../network/NetworkService';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { baseURL } from '../config';
import Btn from '../commonUI/Btn';
import colors from '../commonUI/colors';
import { integer } from 'aws-sdk/clients/cloudfront';
import AsyncStorage from '@react-native-async-storage/async-storage';
type Item = {
  id: integer;
  email: string;
  name: string;
  description: string;
  d2: string;
  photo_path: string;
  price: string;
  category_name: string;
  category_id: integer;
  year2:string;
  address:string;
  going:string;
};

type RootStackParamList = {
  ProductList: undefined;
  ProductDetail: undefined;
  ProductUpload: undefined;
  Tezt: undefined;
};
const screenWidth = Dimensions.get('window').width;
type ProductListProps = NativeStackScreenProps<RootStackParamList, 'ProductList'>;
const itemHorizontalMargin = 0; // Horizontal margin between items

const ProductList: React.FC<ProductListProps> = ({ navigation , route  }) => {
  
  
  const [email, setEmail] = useState('');
  const { refresh } = route.params || {};
  const [data, setData] = useState<Item[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [allDataLoaded, setAllDataLoaded] = useState<boolean>(false);
  const [initialLoad, setInitialLoad] = useState<boolean>(true); // Prevents reload on returning from ProductDetail
  const [fcmToken, setFcmToken] = useState('');
  const isDarkMode = useColorScheme() === 'dark';

  const [lati, setLati] = useState<number | null>(null);
  const [long2, setLong2] = useState<string | null>(null);



  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#333' : '#fff',
  };

  useFocusEffect(

   
    useCallback(() => {
    const handleFocusEffect = async () => {
      const email2 = await loadEmail();
      console.log( 'pl iam back' );
      if (refresh) {
        // Reset data and fetch again
        setData([]);
        setPage(1);
        setAllDataLoaded(false);
        fetchData(true); // Fetch new data
        navigation.setParams({ refresh: false });
      }
    };

    handleFocusEffect(); //
    }, [refresh])
  );

  const fetchData = async (isRefresh = false) => {
    if (lati !== null && long2 !== null) {
    if (loading || allDataLoaded) return;
  
    setLoading(true);
    if (isRefresh) {
      setRefreshing(true); // Set refreshing to true for pull-down
      setPage(1);          // Reset page to initial
      setAllDataLoaded(false); // Reset to allow further data loading
    }
     try {
      const responseData = await NetworkService.post('products', { page: isRefresh ? 1 : page, limit: 10, long2 , lati });
      console.log('products :: ' , responseData  );

      if (Array.isArray(responseData?.data?.result)) {
        if (responseData?.data?.result?.length > 0) {
          setData((prevData) =>
            isRefresh ? responseData?.data?.result : [...prevData, ...responseData?.data?.result]
          );
          setPage((prevPage) => (isRefresh ? 2 : prevPage + 1)); // Reset or increment page as needed
        } else {
          setAllDataLoaded(true);
          Toast.show({
            type: 'info',
            text1: 'All Data Loaded',
            text2: 'There is no more data to load.',
          });
        }
      } else {
        setAllDataLoaded(true);
        Toast.show({
          type: 'info',
          text1: 'No Data',
          text2: 'Unexpected response structure.',
        });
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
      setRefreshing(false); // Ensure refreshing is stopped
      
    }
  }
  };

  const fetchFcmToken = async () => {
    if (fcmToken === '') {
      try {
        // First register the device for remote messages
        //await messaging().registerDeviceForRemoteMessages();
        //console.log('Device registered for remote messages');
        
        // Now get the FCM token
        const token = await messaging().getToken();

        if (Platform.OS === 'ios') {
          const apnsToken = await messaging().getAPNSToken();
          console.log('Fetched APNs Token:', apnsToken);
        }

        console.log('Fetched FCM Token:', token); // Debug: Print the fetched FCM token
        if (token) {
          setFcmToken(token);
          
          return token;
        }
      } catch (error) {
        console.log('Failed to get FCM token:', error);
        return '';
      }
    }
    return fcmToken; // Return current token if already exists
  };
  
  const loadEmail = async () => {
    if (email === '') {
      try {
        const em = await AsyncStorage.getItem('email');
        setEmail(em ?? ''); // If 'em' is null, set empty string as default
        console.log('email:', em);
        return em;
      } catch (error) {
        console.error('Error loading email:', error);
        return '';
      }
    }
  };
  
  const updateFcm = async () => {
    const fcmToken2 = await fetchFcmToken(); // fetchFcmToken returns the token
    const email2 = await loadEmail(); // loadEmail returns the email
  
    console.log(`Email: ${email2}, FCM Token: ${fcmToken2}`);
  
    if (email2 && fcmToken2) {
      console.log(`Email: ${email2}, FCM Token: ${fcmToken2}`);
      const responseData = await NetworkService.post('updateFCM', {
        email: email2,
        token: fcmToken2,
      });
    } else {
      console.log('Email or FCM token is empty');
    }
  };


  useEffect(() => {
    if (route.params?.data) {
      console.log('Received data from ProductDetail:', route.params.data);
      // Handle the received data
    }
  }, [route.params?.data]);



  useEffect(() => {
 
    
    if (initialLoad) {
      loadEmail();
     
      setInitialLoad(false); // Set flag to false so data isn't fetched again unnecessarily
      getLocation();
      
      
    }
 

  }, [initialLoad  ]  );


useEffect(() => {
  fetchData(true); // Fetch data only on the initial load

}, [ initialLoad , lati , long2 ] );



   const getLocation = async () => {
        if (Platform.OS === 'android') {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: 'Location Access Required',
              message: 'This app needs to access your location.',
              buttonPositive: 'OK',
            }
          );
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            console.log('Location permission denied');
            return;
          }
        }
    
        Geolocation.getCurrentPosition(
          (position) => {
            console.log('Position:', position.coords);

            console.log('State updated:', {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
          });

            setLati( position.coords.latitude );  
            setLong2( position.coords.longitude.toString()  );  
            
          },
          (error) => {
            if (error.code === 1) {
              // Code 1: Permission denied
              Alert.alert(
                'Permission Required',
                'Please enable location permissions in the app settings.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Open Settings', onPress: () => Linking.openURL('app-settings:') },
                ]
              );
            } else if (error.code === 2) {
              // Code 2: Position unavailable
              Alert.alert('Error', 'Location services are not available.');
            } else if (error.code === 3) {
              // Code 3: Timeout
              Alert.alert('Error', 'Request to get location timed out.');
            } else {
              Alert.alert('Error', error.message);
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 10000,
          }
        );
      };
  
     


  const handleEndReached = () => {
    if (!loading && !allDataLoaded) {
      fetchData();
    }
  };

  const renderItem = ({ item }: { item: Item }) => { 

    const imageUri = `${baseURL}uploadAppleThumnail/thum_${item.photo_path}`;
  
    // Log the URI
    console.log('ImageBackground URI:', imageUri);

    return( 
    <View style={styles.itemContainer}>
      <TouchableOpacity style={styles.itemTouchable} onPress={() => navigation.navigate('ProductDetail', { item })}>
        

        <ImageBackground
        source={{ uri: imageUri }}
        style={styles.backgroundImage}
        resizeMode="cover" // Adjust based on your preference (e.g., "contain", "stretch")
      >

        <View style={styles.itemTextContainer}>
          <Text style={styles.itemText}>{item.category_name}-{item.year2}  </Text>
          <Text style={styles.itemText}>{Number(item.price).toLocaleString()}</Text>
        </View>
        </ImageBackground>
      </TouchableOpacity>
    </View>
    );
  };

  const handleButtonPress = () => {
    navigation.navigate('ProductUpload');
    console.log('Circular Button Pressed');
  };

  return (
    <SafeAreaView style={[backgroundStyle, styles.container]}>
       
      <View style={styles.listContainer}>
        {error ? (
          <Text style={styles.errorText}>Error: {error}</Text>
        ) : (
          <FlatList
    data={data}
    renderItem={renderItem}
    keyExtractor={(item, index) => index.toString()}
    onEndReached={handleEndReached}
    onEndReachedThreshold={0.5}
    refreshing={refreshing}
    onRefresh={() => fetchData(true)} // Pass `true` to fetchData for refreshing
    numColumns={2}
    columnWrapperStyle={{ justifyContent: 'space-between' }}
    contentContainerStyle={{ paddingHorizontal: 2 }}
  />

        )}
        <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'flex-end', paddingRight: 20 }}>

          <Btn title="+" onPress={handleButtonPress}  shape="circular" 
           style={{ backgroundColor: colors.vividOrange ,  }} 
           textStyle={{fontSize: 32, fontWeight: 'bold'}} 
           />
          <Btn title="Ev" onPress={() => {
              console.log('Triangle')
              navigation.navigate('Event2') 
            }
          } shape="triangle" 
            style={{ borderLeftColor: 'transparent',
                     borderRightColor: 'transparent',backgroundColor: 'transparent'  ,borderBottomColor: colors.triBtn
                       }}
            textStyle={{fontSize: 17, fontWeight: 'bold',
              color: 'black', // Ensure the text color is visible
              textAlign: 'center',

              }}             />

        
          
          <Btn title="My" onPress={() => {
            if (email === ''){
              Alert.alert(
                'Info',
                'To use after login',
                [
                  {
                    text: 'OK',
                    onPress: () => navigation.navigate('Login'), // Navigate on OK click
                  },
                ],
                { cancelable: false } // Prevent dismissal by tapping outside the alert
              );
            }else {
              navigation.navigate('MyInfo') 
            }
            } } shape="square" 
            style={{ backgroundColor: '#4CAF50' , }}
            textStyle={{ fontSize: 25, fontWeight: 'bold' }} 
             />

 

        </View>
      </View>
      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  listContainer: {
    flex: 1,
    padding: 4,
    backgroundColor: '#fff',
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: (screenWidth / 2) - (itemHorizontalMargin * 2) - 12, // Adjust width to account for padding and margin
    height:(screenWidth / 2) - (itemHorizontalMargin * 2) - 12,
  },
  itemContainer: {
    flex: 1,
    overflow: 'hidden',
    
    marginBottom: 8,
   // marginRight:4 ,
    backgroundColor: '#fff' ,
    borderRadius: 8,
    //padding: 10,
    //borderColor: '#ddd',
    //borderWidth: 1,
  },
  itemTouchable: {
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1, 
  },
  itemImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  itemTextContainer: {
    position: 'absolute', // Position relative to the parent container
  bottom: 10, // Distance from the bottom edge
  left: 10, // Distance from the left edge
  backgroundColor: 'rgba(0, 0, 0, 0.5)', // Optional: Add a semi-transparent background
  padding: 5, // Optional: Add padding for text inside
  borderRadius: 5, // Optional: Add rounded corners
  },
  itemText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.pastelOrange ,
    textAlign: 'left',
  },
  text: {
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 18,
    textAlign: 'center',
  },
});

export default ProductList;
