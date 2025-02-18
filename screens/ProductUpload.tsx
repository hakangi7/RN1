import React, { useEffect, useState } from 'react';
import {
  Linking,Text,
  Button,
  Image,
  View,
  TextInput,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,  Modal,
  ActivityIndicator,Dimensions,
  PermissionsAndroid, Platform  ,KeyboardAvoidingView ,
  AppState, AppStateStatus
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import NetworkService from '../network/NetworkService';
import { useNavigation } from '@react-navigation/native';
import DropDownPicker from 'react-native-dropdown-picker';
import Btn from '../commonUI/Btn'; 
import colors from '../commonUI/colors'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from 'react-native-geolocation-service';

import { check ,request,openSettings, PERMISSIONS, RESULTS } from 'react-native-permissions';


const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;
const ProductUpload = () => {
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);
  const currentYear = new Date().getFullYear();
  const [photos, setPhotos] = useState<any[]>([]);
  const [url , setUrl] = useState<string>('');
  const [address , setAddress ] = useState<string>('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [email , setEmail] = useState<string>('');
  const [productName, setProductName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [titlePhotoIndex, setTitlePhotoIndex] = useState<number | null>(null);
  const [items, setItems] = useState([]);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const [open1, setOpen1] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [isClicked , setIsClicked] = useState(true);
  const [maxPhoto, setMaxPhoto] = useState<number>(6);
  const [categories, setCategories] = useState<CatagoryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CatagoryItem | null>(null);
  

  type CatagoryItem = {
    label: string;
    value: number;
  };




  const requestCameraPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'This app needs camera access to take photos.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Camera permission granted');
      } else {
        console.log('Camera permission denied');
        Alert.alert('Camera permission is required to take photos.');
      }
    } catch (err) {
      console.warn(err);
    }
  };




  if (Platform.OS === 'android') {
    requestCameraPermission();
    }
  useEffect(() => {
    
  // const subscription = AppState.addEventListener("change", handleAppStateChange);

  //   // Clean up the listener on component unmount
  // return () => {
  //     subscription.remove();
  // };





    const yearArray = [];
    for (let i = currentYear; i >= 1971; i--) {
      yearArray.push({ label: i.toString(), value: i });
    }
    setYears(yearArray);

    const getAddressFromCoordinates = async (latitude, longitude) => {
      try {

        const getAddr = 'https://maps.googleapis.com/maps/api/geocode/json?language=ko&region=KR&latlng=' 
        + latitude + ',' + longitude 
        + '&key=';
        console.log( 'adr : ' , getAddr  );
        const response = await fetch(
            getAddr
        );
        const data = await response.json();
        console.log( data  );
        if (data.results.length > 0) {
          const address = data.results[0].formatted_address;
          console.log( address  );

          setAddress(address.slice(0, -5));

          return address;
        }
      } catch (error) {
        console.error(error);
      }
    };
   
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
          setLatitude( position.coords.latitude );  
          setLongitude( position.coords.longitude  );  
          getAddressFromCoordinates( position.coords.latitude  ,position.coords.longitude )
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

    getLocation();
    const loadEmail = async () => {
      try {
          const em = await AsyncStorage.getItem('email');
          setEmail(em ?? ''); // If 'em' is null, set empty string as default
      } catch (error) {
          console.error('Error loading email:', error);
      } finally {
        //  setIsLoading(false); // Set loading to false once the async operation is done
      }
    }


    const fetchCategories = async () => {
      try {
        const response = await NetworkService.post('categories');

        console.log( 'res:: ', response );


        if ( response && response.data &&  response.data.result && Array.isArray(response.data.result)) {
          setItems(response.data.result);
          const formattedItems = response.data.result.map((item) => ({
            label: item.name,
            value: item.id,
          }));
          setCategories (formattedItems);
        } else {
          console.error('Unexpected response format:', response.data.result);
          setCategories([]);
        }
      } catch (error) {

        console.error('Error object:', JSON.stringify(error, null, 2));
        console.error('Error stack:', error.stack);


        console.error('Failed to fetch categories:', error);
        Alert.alert('Error', 'Failed to fetch categories');
      } finally {
        setLoading(false);
      }
    };
    loadEmail();
    fetchCategories();
  }, []);

  const handleDeletePhoto = (index) => { 
    const updatedPhotos = photos.filter((_, i) => i !== index);
    setPhotos(updatedPhotos);
  };

  const handleChoosePhoto = async() => {
    console.log(" handleChoosePhoto 2 " );

    if (photos.length >= maxPhoto ) {
      Alert.alert('You have exceeded the limit of ' + maxPhoto + ' photos', 'Please delete some photos first.');
    } else {

    console.log(" handleChoosePhoto 2 " + Platform.OS );
      
    const permission = Platform.OS === 'ios'
      ? PERMISSIONS.IOS.PHOTO_LIBRARY
      : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
 
    //const result = await request(permission);

    const result = await check(permission );
    if (result === RESULTS.GRANTED ) {
      Alert.alert(
        'Photo Access Required',
        'We currently have limited access to your photo library. To proceed, please provide full access to your photos.',
        [
          {text: 'Not Now', style: 'cancel'},
          {
            text: 'Open Settings',
            onPress: () => {
              openSettings().catch(() => {
                console.error('Failed to open settings');
              });
            },
          },
        ],
      );
     
    }else {
      console.log('Permission already granted');
      console.log("Photo library access granted");
      launchImageLibrary({ mediaType: 'photo', selectionLimit: maxPhoto - photos.length }, (response) => {
        if (response.assets) {
        

          setPhotos([...photos, ...response.assets]);
          if( photos.length ==  0 ){
            setTitlePhotoIndex(0);
          }
        }
      });
    }
 
  //  switch (result) {
   //   case RESULTS.GRANTED:
       
  //      break;
  //    case RESULTS.DENIED:
      //   console.log("Photo library access denied");
      //   Alert.alert("Permission Denied", "You need to grant photo library access to use this feature.");
      //   break;
      // case RESULTS.BLOCKED:
      //   Alert.alert(
      //     "Permission Blocked",
      //     "Photo library access is blocked. Please enable it in settings.",
      //     [{ text: "Open Settings", onPress: () => Linking.openSettings() }]
      //   );
      //   break;
      // case RESULTS.LIMITED:
      //   console.log("Photo library access is limited (iOS 14+)");
      //   break;
  //  }
  }
  };




      
 

  const handleTakePhoto = () => {
    if (photos.length >= maxPhoto ) {
      Alert.alert('You have exceeded the limit of ' + maxPhoto + ' photos', 'Please delete some photos first.');
    } else {
      launchCamera({ mediaType: 'photo' }, (response) => {
        if (response.assets) {
         
          setPhotos([...photos, ...response.assets]);
          if( photos.length ==  0 ){
            setTitlePhotoIndex(0);
          }
        }
      });
    }
  };

  const handleUpload = async () => {

  //if(  isClicked ) { 
    
   // setIsClicked( false );
    if (!photos.length || !productName || !description || !price || !selectedCategory) {
      Alert.alert('Error', 'Please fill all fields and select at least one photo.');
      return;
    }

    if (photos.length === 1) {
      setTitlePhotoIndex(0);
    } else if (titlePhotoIndex === null) {
      Alert.alert('Error', 'Please select a title photo.');
      return;
    }

    const validTitlePhotoIndex = titlePhotoIndex !== null ? titlePhotoIndex : 0;

    const data = {
      email,
      productName,
      description,
      price,
      categoryId: selectedCategory.value ,
      titlePhotoIndex: validTitlePhotoIndex,
      url ,
      year2: selectedYear ,
      address,
      latitude,
      longitude
    };
    setLoading(true);
    try {
      const formData = new FormData();

      photos.forEach((photo, index) => {
        formData.append('photos', {
          uri: photo.uri,
          name: photo.fileName || `photo${index}.jpg`,
          type: photo.type || 'image/jpeg',
        });
      });

      Object.keys(data).forEach((key) => {
        formData.append(key, data[key]);
      });

      const response = await NetworkService.upload('upload', formData);

      if (response && response.status === 200) {
        setLoading(false);
        Alert.alert('Upload Success', 'Your product has been uploaded!', [
          {
            text: 'OK',
            onPress: () => navigation.navigate('ProductList', { refresh: true }),
          },
        ]);
      } else {
        setLoading(false);
        Alert.alert('Upload Failed', `Failed to upload product. Status: ${response?.status}`);
      }
    } catch (error) {
      setLoading(false);
      console.log( "upload error :: " , error );
      Alert.alert('Error', 'An error occurred while uploading the product.');
    }
  //}
  };

  const handleSelectTitlePhoto = (index: number) => {
    Keyboard.dismiss();
    setTimeout(() => {
      setTitlePhotoIndex(index);
    }, 100);
  };


  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    // Detect app state change
    if (appState.match(/inactive|background/) && nextAppState === 'active') {
      console.log('App has come to the foreground!');

      //getLocation();
      // Perform any necessary actions when the app comes back from the background (like refreshing data)
    }

    // Update the current app state
    setAppState(nextAppState);
  };




  return (

    <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
>

    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <View style={styles.container}>
        
        
          <ScrollView contentInset={{bottom: 150}} contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
            <View style={styles.photoContainer}>
              {photos.map((photo, index) => (
                <View key={index} style={styles.photoWrapper}>
                  <TouchableOpacity key={index} onPress={() => handleSelectTitlePhoto(index)}>
                    <Image
                      source={{ uri: photo.uri }}
                      style={[
                        styles.photo,
                        titlePhotoIndex === index && styles.selectedPhoto,
                      ]}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeletePhoto(index)}>
                    <Text style={styles.deleteButtonText}>X</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </ScrollView>
  
          {/* Input Container - fixed at the bottom */}
      <View style={styles.inputContainer}>
          <Text style={styles.infoText}>
           {maxPhoto}imgs - <Text style={styles.addressText}>{address }</Text>
          </Text>
      
      <View style={styles.dropContainer}>
         
     
      <TouchableOpacity style={styles.button} onPress={() => setOpen1(true)}>
        <Text>{selectedCategory?.label || 'Category'} </Text>
      </TouchableOpacity>
      <Modal
        visible={open1}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setOpen1(false)} // Close the modal when back button is pressed
      >
        <View style={styles.modalContainer}>
          <View style={styles.centeredDropdown}>
          <DropDownPicker
    open={open1}
    value={selectedCategory?.value}
    items={categories}
    setOpen={setOpen1}
    onSelectItem={(item) => {
      console.log("Selected item:", item);
      setSelectedCategory(item); // Update selectedCategory with the selected item
  }}
    placeholder="Category"
    style={styles.picker}
    dropDownContainerStyle={styles.dropDownContainer}
/>

          </View>
        </View>
      </Modal>
      
      <TouchableOpacity style={[styles.button, { marginLeft: 10 }]}  onPress={() => setOpen2(true)}>
        <Text   >{selectedYear || 'Year'}</Text>
      </TouchableOpacity>
      <Modal
        visible={open2}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setOpen2(false)} // Close the modal when back button is pressed
      >
        <View style={styles.modalContainer}>
          <View style={styles.centeredDropdown}>
            <DropDownPicker
              open={open2}
              value={selectedYear}
              items={years}
              setOpen={setOpen2}
              setValue={setSelectedYear}
              setItems={setYears}
              placeholder="Year"
              style={styles.picker}
             // dropDownContainerStyle={styles.dropDownContainer}
            />
          
          </View>
        </View>
        </Modal>
 
            </View>
            <TextInput
              placeholder="Title"
              value={productName}
              onChangeText={setProductName}
              style={styles.input}
            />
            <TextInput
              placeholder="Description"
              value={description}
              onChangeText={setDescription}
              style={styles.textArea}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            
            <View style={styles.infoContainer}> 

            <TextInput
              placeholder="Price"
              value={price}
              onChangeText={(text) => setPrice(text.replace(/[^0-9.]/g, ''))}
              keyboardType="numeric"
              style={styles.input2}
            />


            <TextInput
              placeholder="Option:ProductInfoUrl"
              value={url}
              onChangeText={setUrl }
              style={[styles.input2, { marginLeft: 10 }]}
            />

              </View>

            <View style={styles.buttonContainer}>
              <Btn title="SelectPhotos" onPress={handleChoosePhoto} style={{ flex: 1, backgroundColor: colors.vividCyan, marginRight: 5 }} />
              <Btn title="TakePhoto" onPress={handleTakePhoto} style={{ flex: 1, backgroundColor: colors.vividCyan, marginLeft: 5 }} />
            </View>
            <Btn title="UploadProduct" onPress={handleUpload} textStyle={styles.uploadButtonText} style={styles.uploadButton} />
          </View>
        
          {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      )}
      
    </View>
  </TouchableWithoutFeedback>
  </KeyboardAvoidingView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,  // Take up the full height of the screen
  },
  loadingOverlay: {
    position: 'absolute', // Overlay the ActivityIndicator
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center', // Center the ActivityIndicator vertically
    alignItems: 'center', // Center the ActivityIndicator horizontally
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  addressText: {
    color: 'blue', // Change this to any color you prefer for the address
    fontSize: 12, // Smaller font for the address
    fontWeight: 'bold', // Optional bold style
    flexWrap: 'wrap', // Allow the text to wrap to multiple lines
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 150,  // Ensure there's space for the input container at the bottom
  },
  photoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    padding: 10,
  },
  photoWrapper: {
    position: 'relative',
    margin: 5,
  },
  photo: {
    width: 100,
    height: 100,
    borderColor: 'gray',
    borderWidth: 2,
  },
  selectedPhoto: {
    borderColor: 'blue',
    borderWidth: 2,
  },
  deleteButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'rgba(255, 0, 0, 0.7)',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  input: {
    flex: 1,        
    borderRadius: 5,
    height: 35,
    borderWidth: 1,
    marginBottom: 10,
    padding: 5,
  },
  input2: {
    flex: 1,        
    borderRadius: 5,
    height: 35,
    borderWidth: 1,
   
    padding: 5,
  },
  textArea: {
    height: 80,
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    textAlignVertical: 'top',
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 10,
  }, 
  button: {
    padding: 5,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center', 
    borderRadius: 5,
    borderWidth: 1,        // Adds the border thickness
    borderColor: '#000', 
    height: 30,
  },
  dropContainer: {
    flexDirection: 'row',   
    //justifyContent: 'space-between',
   // padding: 20,
    paddingBottom: 10,
  },
  pickerWrapper: {
    width: (screenWidth - 30) / 2 ,  // Ensures each picker takes half the width
  },
  picker: {
    height: 35,
    width: (screenWidth - 30) / 2 ,
    borderRadius: 5,
    //marginHorizontal: 5,
    marginRight: 5,
    zIndex: 5000,  // High zIndex for the picker
    elevation: 5000,   
    backgroundColor: '#fff',
  },
  picker2: {
    height: 35,
    width: (screenWidth - 30) / 2,
    borderRadius: 5,
   // marginHorizontal: 5,
    marginLeft: 10,
    zIndex: 5000,  // High zIndex for the picker
    elevation: 5000,   
    backgroundColor: '#000',
  },
   
  modalStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Dim background when modal is active
    flex: 1,
  },
   
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Transparent background
  },
  centeredDropdown: {
    flexDirection: 'row',
    width: screenWidth * 0.8, // Adjust width of dropdown (80% of the screen width)
    //backgroundColor: 'red',
    borderRadius: 10,
    padding: 20,
  },
 
  dropDownContainer: {
    backgroundColor: '#fff',  // Dropdown container background color
  },
  closeButton: {
    marginTop: 10,
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'red',
    borderRadius: 5,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },



  uploadButton: {
    backgroundColor: colors.vividOrange,
    borderColor: '#218838',
    borderWidth: 1,
     
    borderRadius: 5,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  infoText: {
    fontSize: 20,
    color: 'red',
    marginBottom: 10,
  },
});

export default ProductUpload;
