// src/screens/DetailScreen.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet , Modal, Image ,FlatList ,Dimensions ,TouchableOpacity 
  ,Linking ,ActivityIndicator,TextInput,KeyboardAvoidingView,Platform ,Alert,ScrollView , Button , BackHandler } from 'react-native';
import { RouteProp, useRoute  } from '@react-navigation/native';
import { baseURL } from '../config';

import {  GestureHandlerRootView, PinchGestureHandler, State } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withTiming,useAnimatedGestureHandler } from 'react-native-reanimated';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import DropDownPicker from 'react-native-dropdown-picker';
import Btn from '../commonUI/Btn'; 
import colors from '../commonUI/colors'; 
import { integer } from 'aws-sdk/clients/cloudfront';

import NetworkService from '../network/NetworkService';
import { useFocusEffect   } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
//import { TapGesture } from 'react-native-gesture-handler/lib/typescript/handlers/gestures/tapGesture';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;
const Tab = createMaterialTopTabNavigator(); 
type RootStackParamList = {
  ProductDetail: { item:   Item };
};


type Photos = {
  
  photo_path: string;
  
};

type Urls = {
  
  url: string;
  description: string;
};

type Mess = {
  id : integer;
  product_id : integer;
  from2: string;
  to2: string ;
  msg : string ;
  when : string;
  when2 : string;
  email2 : string;

}

type Item = {
  id: integer;
  name: string;
  description: string;
  d2: string;
  photo_path: string;
  price : string ;
  category_name : string;
  category_id : integer;
  year2: string;
  address: string;
  email: string;
  going: string;
};
  


const handleBuy = async () => {

}

type DetailScreenRouteProp = RouteProp<RootStackParamList, 'ProductDetail'>;

const ProductDetail = ({ navigation, route }): JSX.Element => {
   
  //const navigation = useNavigation();
  const { item } = route.params; // Extract item passed from HomeScreen

  const handleBackWithData = () => {
    console.log('iamback');
    navigation.navigate('ProductList', {
      data: { message: 'Product purchased successfully!' },
    });
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (e.data.action.type === 'GO_BACK') {
        // Prevent default navigation and call custom back handler
        e.preventDefault();
        handleBackWithData();
      }
    });

    return unsubscribe;
  }, [navigation]);


  const [loading, setLoading] = useState<boolean>(false);
  //const [loading2, setLoading2] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(true);
  const [photos, setPhotos] = useState<Photos[]>([]);
  const [urls, setUrls] = useState<Urls[]>([]);
  const [msg, setMsg] = useState<string>('');
  const [email, setEmail] = useState('');

  const [mess, setMess] = useState<Mess[]>([]);

  const [openG, setOpenG] = useState(false);
  const [valueG, setValueG] = useState(null); // Set initial value from parameter
  const [itemsG, setItemsG] = useState([
    { label: 'Selling', value: 'Selling' },
    { label: 'Going', value: 'Going' },
    { label: 'Close', value: 'Close' },
  ]);


  const updateGoing = async (vv : string) => { 
    try {
      console.log('id::', item.id , vv );
     
      const response = await NetworkService.post('updateGoing', {  productId: item.id ,state2 :  vv  });

      if (response && response.status === 200) {
         
        Alert.alert('ProductState', 'Changed', [
          { text: 'OK', onPress: () => 
            {
              console.log('OK Pressed')
               
            }
           },
        ]);
      } else {
        
        Alert.alert('updateGoing', `Failed to updateGoing . Status: ${response?.status}`);
      }
    

    } catch (error) {
      setLoading(false);
       
    } finally {
      setLoading(false);
      
    }
  }


  const sendMsg = async () => { 
    try {
      console.log('id::', item.id );
     
      const response = await NetworkService.post('sendMsg', { categoryId: item.category_id , productID: item.id , from : email    , to : item.email , msg: msg });

      if (response && response.status === 200) {
         
        Alert.alert('SendMsessage', 'toSeller', [
          { text: 'OK', onPress: () => 
            {
              console.log('OK Pressed')
              setIsSending(true); 
            }
           },
        ]);
      } else {
        
        Alert.alert('SendMessageFailed', `Failed to send Message. Status: ${response?.status}`);
      }
    

    } catch (error) {
      setLoading(false);
       
    } finally {
      setLoading(false);
      
    }
  }

  const handleTextChange = (text: string) => {
    // Update the message state
    setMsg(text);

    // Check the length
    const length = text.length;
    console.log('Message length:', length);

    // Optional: Perform additional checks or update UI based on length
    if (length > 1500) {
      console.warn('Message exceeds max length for Message!');
    }
  };

  const loadEmail = async () => {
    try {
        const em = await AsyncStorage.getItem('email');
        setEmail(em ?? ''); // If 'em' is null, set empty string as default
    } catch (error) {
        console.error('Error loading email:', error);
    } finally {
        //setIsLoading(false); // Set loading to false once the async operation is done
    }
  };
  useEffect(() => {

    loadEmail(); 

  }, [navigation]);

  

  const fetchData = async (isRefresh = false) => {
    if (loading ) return;
if (email) { 
    setValueG( item.going  );
    setLoading(true);

    try {
      console.log('id::', item.id );

      var isSame = "no";
      if (item.email == email){
        isSame = "ok";
      }

      const responseData = await NetworkService.post('detail', { id: item.id , category_id : item.category_id ,email:email , isSame: isSame });
      
      console.log('Full Response photo Data :', responseData?.data.photos );
      

      const photos = responseData?.data.photos[0].map((photo) => ({
        photo_path: photo.photo_path 
        
      }));

      setPhotos(photos);

      console.log( 'photos::' ,  photos );

      const urlData: Urls[] = responseData?.data?.urls[0] || [];

      setUrls( urlData );

      console.log('Full Response Data urls from :', urlData );

      const msgData: Mess[] = responseData?.data?.msgs[0] || [];

      setMess( msgData );

      console.log('Full Response Data msgs from :', msgData );



      if (Array.isArray(responseData?.data.photos)) {
        if (responseData?.data.photos.length > 0) {
          
        } else {
          
        }
      } else {
        setLoading(false);
         
        Toast.show({
          type: 'info',
          text1: 'No Data',
          text2: 'Unexpected response structure.',
        });
      }
 

    } catch (error) {
      setLoading(false);
       
    } finally {
      setLoading(false);
      
    }
  }
  };

  useFocusEffect(
    useCallback(() => {
     
      fetchData(true);
    }, [email])
  );

  const PhotosUI = ({ item }: { item: Photos }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [loading2, setLoading2] = useState(false); // State to track image loading in the modal
    const scale = useSharedValue(1); // Shared value for scaling the image
  
    const imageWidth = screenWidth / 2; // One third of screen width
    const imageHeight = imageWidth * (2 / 4); // Adjust this ratio to match the aspect ratio of your images
  
    // Gesture handler for pinch gestures
    const pinchGestureHandler = useAnimatedGestureHandler({
      onActive: (event) => {
        scale.value = event.scale; // Update scale based on pinch gesture
      },
      onEnd: () => {
        scale.value = withTiming(1, { duration: 300 }); // Reset scale after pinch ends
      },
    });
  
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));
  
    const imageUri = `${baseURL}uploadAppleThumnail/thum_${item.photo_path}`;
  
    console.log('img url  :', imageUri );


    return (
      <View style={styles.itemContainer}>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Image
            source={{ uri: imageUri }}
            style={{ width: imageWidth, height: imageHeight }}
          />
        </TouchableOpacity>
  
        {/* Modal for full-screen image */}
        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <GestureHandlerRootView style={styles.modalBackground}>
            {/* Close button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
  
            {/* Pinch to zoom handler */}
            <PinchGestureHandler onGestureEvent={pinchGestureHandler}>
              <Animated.View style={[styles.animatedContainer, animatedStyle]}>
                <Image
                  source={{ uri: `${baseURL}uploadApple/${item.photo_path}` }}
                  style={styles.fullScreenImage}
                  resizeMode="contain"
                  onLoadStart={() => setLoading2(true)} // Start loading
                  onLoadEnd={() => setLoading2(false)} // End loading
                />
                {loading2 && (
                  <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#ffffff" />
                  </View>
                )}
              </Animated.View>
            </PinchGestureHandler>
          </GestureHandlerRootView>
        </Modal>
      </View>
    );
  };

const UrlsUI = ({ item }: { item: Urls }) => { 

  const openUrl = (url: string) => {
    Linking.openURL(url).catch((err) => {
      console.error("Failed to open URL: ", err);
    });
  };

  return (
    <View style={styles.itemContainer}>
      <TouchableOpacity onPress={() => openUrl(item.url)}>
        <Text style={styles.linkText}> {item.url} </Text>
      </TouchableOpacity>
    </View>
  );
};

const ids: number[]  = [];

const delMsg = async(key) => {

  const response = await NetworkService.post('delMsg', { msgId: key });
  if (response && response.status === 200) {
    ids.push( parseInt(  key , 10 ));

    setMess((prevMessages) => prevMessages.filter((item) => !ids.includes(item.id)));
  } else {
    
    Alert.alert('MessageDeleteFailed', `Failed to delete the Message. Status: ${response?.status}`);
  }   

};

const MsgsUI = ({ item }: { item: Mess }) => { 
 
  return (
    
    <View style={styles.outerContainer}>
    <View style={styles.msgContainer}>
      
        <Text style={styles.linkText}> {item.msg} </Text>
       
        <View style={styles.rowContainer}>
        <Text style={styles.linkText}> {item.from2 } </Text>
        <Text style={styles.linkText}> {item.when2 } </Text>
        </View>
    
    </View>

    <View style={styles.buttonContainer}>

    <Button title="X" onPress={ () => delMsg( item.id )} />

    </View>


    </View>
     
  );
};









  return (
<KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 105}
>
<ScrollView contentContainerStyle={styles.scrollContent} >
  
    <View style={styles.container}>
       
      

      <FlatList 
            data={photos}
            renderItem={({ item }) => <PhotosUI item={item} />}
            numColumns={2} // Set the number of columns to 2
            columnWrapperStyle={{ justifyContent: 'space-between' }} 
            scrollEnabled={false}
          />


      <Text style={styles.itemTitle}>{item.category_name}-{ item.year2 }</Text>
      <Text style={styles.itemTitle}>{item.name}</Text>
      <Text style={styles.itemTitle}>{item.description}</Text>
      <Text style={styles.itemTitle}>{item.d2}</Text>
      <Text style={styles.itemPrice}>{Number(item.price).toLocaleString()}Won</Text>
      { console.log( 'if :: ' , valueG , item.going  )  }
      {item.email === email && ( valueG === "Selling" ||   valueG === "Going"  )  && (item.going === "Selling" || item.going === "Going"  )   && (
      <View style={styles.container}>
      
      <DropDownPicker
        open={openG}
        value={valueG}
        items={itemsG}
        setOpen={setOpenG}
        setValue={(val) => {
          console.log('gg2::' , val() );
           
          if (val() === "Close"){
            console.log('gg1');
            updateGoing( val() );
          }

          item.going = val();
          setValueG(val);
          console.log('gg3::' , val() );
          //onValueChange(val); // Notify parent about the selection change
        }}
        setItems={setItemsG}
        placeholder="Select a Status"
        onChangeValue={(val) => {
          console.log('Selected value:', val); // Handle change event
          // Add your custom logic here, e.g., notify parent or update state
          item.going = val;
          setValueG(val);
          console.log('gg');
          //setEmail(val);
          //setValueG(val);
          updateGoing(val);
        }}
        listMode="SCROLLVIEW"
      />
    </View>
    )} 


      <Text style={styles.itemTitle}>{item.address }</Text>
      <FlatList
            data={urls}
            renderItem={({ item }) => <UrlsUI item={item} />}
            scrollEnabled={false}
            
          />
{  console.log('email 33 ::' , email ) }

  { 

  email && email.trim() !== '' && (
        <><TextInput
              placeholder="MessageToSeller"
              value={msg}
              onChangeText={handleTextChange}
              style={styles.textArea}
              multiline
              numberOfLines={4}
              textAlignVertical="top" />
              <Btn title={`SendMessage ${msg.length}/1500`} onPress={() => {
                if (isSending) {
                  setIsSending(false);
                  sendMsg();
                }
              } }
                textStyle={styles.buyButtonText}
                style={[styles.buyButton, , { backgroundColor: colors.vividOrange }]} /></>
      )}   
 

        <FlatList
            data={mess}
            renderItem={({ item }) => <MsgsUI item={item} />}
            contentContainerStyle={styles.flatListContainer}
            style={styles.flatList} 
            scrollEnabled={false}
          />
    

    </View>
    </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({

  toSetGoing :{
   padding: 16,
  },
  scrollContent: {
    flexGrow: 1, // Allows ScrollView to expand and scroll as needed
  },
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 16,
  },itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },msgContainer: {
    flex: 1, // Takes up remaining space on the left
    flexDirection: 'column',
    alignItems: 'flex-start',
    paddingRight: 10,
   
  },
  flatList: {
    flex: 1,
    width: '100%', // Ensures the FlatList itself is full width
   // backgroundColor: '#f033f0',
  },

  flatListContainer: {
    
    flexGrow: 1, // Ensures the FlatList content stretches
   // backgroundColor: '#1133f0',
  },
  outerContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Spaces out msgContainer and button
    padding: 10,
    
  },
  remainingSpace: {
    flex: 1,            // Takes up remaining vertical space
    padding: 20,        // Add desired padding
    //backgroundColor: '#f0f0f0',
  },
  rowContainer: {
    flexDirection: 'row', // Puts email2 and when2 in the same row
    alignItems: 'flex-start',
    marginBottom: 16,
  },buttonContainer: {
    alignSelf: 'flex-start', // Aligns the button container at the start of its flex line
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  itemTitle: {
    fontSize: 18,
  },
  itemPrice: {
    fontSize: 18,
    color: colors.vividBlue ,
  },
  image: {
    width: 200,  // Set the width of the image
    height: 200, // Set the height of the image
    borderRadius: 8, // Optional: make the image rounded
    marginTop: 16,
  }, 
  buyButtonText: {
    color: '#ffffff', // White text color
    fontSize: 16,
    fontWeight: 'bold',
  },
  buyButton: {
    height: 45, // Adjust the height of the button
    width: '100%',
    paddingHorizontal: 20, // Add horizontal padding for width
    justifyContent: 'center', // Center the text vertically
    borderRadius: 8, // Optional: rounding button corners
    marginTop: 10, // Add space above the button
    marginBottom: 20,
  },
  linkText: {
    color: 'blue', // Make the text look like a link
    textDecorationLine: 'underline',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)', // Transparent dark background
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 10,
    borderRadius: 20,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  animatedContainer: {
    width: screenWidth,
    height: screenHeight,
  } ,loadingOverlay: {
    position: 'absolute', // Overlay the ActivityIndicator
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center', // Center the ActivityIndicator vertically
    alignItems: 'center', // Center the ActivityIndicator horizontally
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },textArea: {
    width: '100%',
    height: 80,
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    textAlignVertical: 'top',
    marginBottom: 10,
  },
});

export default ProductDetail;
