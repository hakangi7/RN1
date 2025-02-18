import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList , SafeAreaView , Alert  , Linking } from 'react-native';
import NetworkService from '../network/NetworkService'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import Btn from '../commonUI/Btn';
import { useNavigation } from '@react-navigation/native';
type uploaded = {
  id: number;
  name: string;
  going: string;
  year2: string;
  cname: string;
  date2: string;
};

const COMPANY_NAME = 'LogicMaker Company';
const COMPANY_EMAIL = 'logicmaker@naver.com';
const APP_VERSION = require('../package.json').version; 

const MyInfo: React.FC = () => {
  const [email, setEmail] = useState('');
  const [uploadedList, setUploaded] = useState<uploaded[]>([]);
  const renderButtonShape = (status: string) => {
    if (!status) return 'square'; // Default shape for undefined status
    switch (status.trim().toLowerCase()) { // Normalize string input
      case 'selling':
        return 'circular';
      case 'going':
        return 'triangle';
      case 'end':
        return 'square';
      default:
        return 'square';
    }
  };

  const openBrowser = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(`Unable to open the link: ${url}`);
      }
    } catch (error) {
      Alert.alert('An error occurred while trying to open the link.');
    }
  };

  const navigation = useNavigation();


  const handleDelPress = async ({     }) => {
    try {
      console.log('Del button pressed!');
      const afterDel = async () => {
     
        console.log('after del ');
        await AsyncStorage.removeItem('email');
        await AsyncStorage.clear();
        navigation.navigate('Login');
      };
      const responseData = await NetworkService.post('delAccount', { email });
      console.log('Full Response:', responseData);
      console.log( 'status::' ,  responseData?.status  );
      // Ensure the status and data exist
      if (responseData && responseData?.status === 200) {
        console.log('Full Response: 200');
        //const message = responseData?.data?.message || 'Account deletion verified.';
        Alert.alert(
          'Delete Account', // Title of the alert
          'Your Account is deleted', // Message
          [ 
            {
              text: 'OK',
              onPress: () => afterDel(), // Call your delete function here
            },
          ],
          { cancelable: true } 
        );
  
        //console.log('Response Message:', message);
      } else {
        // Fallback if status is not 200
        Toast.show({
          type: 'error',
          text1: 'Unexpected Response',
          text2: `Received status: ${responseData?.status || 'unknown'}`,
        });
  
        console.error('Unexpected response:', responseData);
      }
    } catch (error) {
      console.error('Error in delAccount:', error);
  
      // Handle any errors (e.g., network errors)
      Toast.show({
        type: 'error',
        text1: 'Fetch Error',
        text2: error.message || 'An error occurred while deleting the account.',
      });
    }
  };

  useEffect(() => {

    //let isMounted = true;
    const loadEmail = async () => {
      try {
        const em = await AsyncStorage.getItem('email');
       // if (isMounted) {
        setEmail(em ?? '');
        //fetchData();
       // }
      } catch (error) {
        console.log('Error loading email:', error);
      }
    };
    loadEmail();
  }, []);

  useEffect(() => {
    if (email) {
      fetchData();
    }
  }, [email]);

  const fetchData = async () => {
    try {
      const responseData = await NetworkService.post('myInfo', { email });
      console.log('Full Response:', responseData);

      const myUploaded = responseData?.data?.myUploaded || [];
      if (!myUploaded) {
        Toast.show({
          type: 'info',
          text1: 'No Data',
          text2: 'No upload data found.',
        });
      } else if (!Array.isArray(myUploaded)) {
        // Normalize to array if the API returns a single object
        const normalizedUploaded = [myUploaded];
        setUploaded(normalizedUploaded);
        console.log('Single item normalized to array:', normalizedUploaded);
      } else {
        // Handle array response
        setUploaded(myUploaded);
       // console.log('Array response:', myUploaded.length, myUploaded);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Fetch Error',
        text2:   'An error occurred while fetching data.',
      });
      console.error('Fetch Data Error:', error);
    }
  };

  return (
     
    <View style={styles.container}>
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{email || 'No email provided'}</Text>
      </View>

      

      <Text style={styles.title}>My Uploaded Items</Text>
      <FlatList
        data={uploadedList}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          console.log(`Rendering item with status: ${item.going}`);
          return (
            <View style={styles.listItem}>
               <Btn
    title=''
    onPress={() => console.log(`Button for ${item.name} clicked`)}
    shape={renderButtonShape(item.going)}
    style={styles.smallBtn} // Apply a smaller button style
  />
  <View style={styles.itemDetails}>
    <Text style={styles.itemName}>{item.name}</Text>
    <Text style={styles.itemCname}>
      {item.cname} {item.date2}
    </Text>
  </View>
            
            </View>
          );
        }}
        ListEmptyComponent={<Text style={styles.emptyMessage}>No uploads yet.</Text>}
      />

<Text style={styles.title}>App Information</Text>
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Version:</Text>
        <Text style={styles.value}>{APP_VERSION}</Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Company:</Text>
        <Text style={styles.value}>{COMPANY_NAME}</Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Contact Email:</Text>
        <Text style={styles.value}>{COMPANY_EMAIL}</Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.label}></Text>
        <Text  
         style={styles.link}
         onPress={() => openBrowser('https://www.appleappdev.com/sub/OrangeUsed.jsp')}
        >AppTermsOfSevice</Text>
      </View>

      <TouchableOpacity style={styles.editButton} onPress={handleDelPress}>
        <Text style={styles.editButtonText}>DeleteAccount</Text>
      </TouchableOpacity>
      <Toast />
    </View>
    
        
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#FFF',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  value: {
    fontSize: 16,
    fontWeight: '400',
  },
  link: {
    color: 'blue',
    textDecorationLine: 'underline',
    fontSize: 16,
    
  },
  editButton: {
    marginTop: 20,
    backgroundColor: '#FF5722',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#FFF',
    borderRadius: 8,
    elevation: 2,
  },
  smallBtn: {
    width: 40, // Adjusted size
    height: 40, // Adjusted size
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemDetails: {
    flex: 1, // Ensures this view takes up remaining space
    marginLeft: 10, // Spacing between Btn and details
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'left',
  },
  itemCname: {
    fontSize: 14,
    color: '#888',
    textAlign: 'left',
  },
  uploadDate: {
    fontSize: 14,
    color: '#888',
  },
  emptyMessage: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
    marginTop: 20,
  }, 
  
});

export default MyInfo;
