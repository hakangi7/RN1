import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button , Alert, ActivityIndicator, ScrollView,
     KeyboardAvoidingView, Platform ,Keyboard,TouchableWithoutFeedback , NativeModules ,TouchableOpacity } from 'react-native';
import { signIn, autoLogin, signup } from '../utils/auth';
import { SafeAreaView, StyleSheet } from 'react-native';
import colors from '../commonUI/colors';
import Btn from '../commonUI/Btn';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
const { FromReactModule } = NativeModules;

const Login = ({ onLoginSuccess }: { onLoginSuccess: (user: any) => void }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const navigation = useNavigation();

    const handlePassPress = () => {
        navigation.navigate('ProductList');
      };


    useEffect(() => {
        const loadEmail = async () => {
            try {
                const em = await AsyncStorage.getItem('email');
                setEmail(em ?? ''); // If 'em' is null, set empty string as default
            } catch (error) {
                console.log('Error loading email:', error);
            } finally {
                setIsLoading(false); // Set loading to false once the async operation is done
            }
        };
        loadEmail(); 
    }, []);

    const handleSignIn = async () => {
        setIsLoading(true);
        console.log("handleSignIn called with:", email, password);
        if ( email && password ) {
            try {
                const result = await signIn(email, password);
              
                if (result.status === 200) {
                  setIsLoading(false);
                  //onLoginSuccess(result.data.user);
                
              
                  try {
                    FromReactModule.receiveDataFromReact(email);
                  } catch (nativeError) {
                    console.error('Native module error:', nativeError);
                  }
                  await AsyncStorage.setItem( 'email',  email   ) 

                  handlePassPress();
                } else if (result.status === 401) {
                  setIsLoading(false);
                  Alert.alert('Sign-In Error', 'Invalid email or password. Please try again.');
                } else {
                  console.error('Unexpected result:', result);
                  setIsLoading(false);
                  Alert.alert('Error', 'An unexpected error occurred. Please try again later.');
                }
              } catch (error) {
                console.error('Request error:', error);
                setIsLoading(false);
              
                if (error.response?.status === 401) {
                  Alert.alert('Sign-In Error', 'Invalid email or password. Please try again.');
                } else {
                  Alert.alert('Error', 'An unexpected error occurred. Please try again later.');
                }
              }
            }
    };

 
    const handleSignUp = async () => {

        console.log("handleSignUp  ");
        
        setIsLoading(true);
        const result = await signup(email, password);
        if (result && result?.status === 200) {
            Alert.alert(
                result?.data?.message,
                undefined,
                [
                  {
                    text: 'OK',
                    onPress: () => console.log('OK Pressed'),
                  },
                ]
              );
            setIsLoading(false);
        } else {
            Alert.alert('Error during signup', `  `);
            setIsLoading(false);
        }
    };

    return (
        <TouchableWithoutFeedback
        onPress={() => {
          // Dismiss keyboard only when pressing outside inputs or buttons
          Keyboard.dismiss();
        }}
      >
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
        >
            <SafeAreaView style={styles.container}>
                <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps='handled'>
                    <Text style={styles.welcomeText}>Welcome</Text>
                    <View style={styles.inputBox}>
                        <TextInput
                            placeholder="Email"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            style={styles.input}
                        />
                        <TextInput
                            placeholder="Password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            autoCapitalize="none"
                            style={styles.input}
                        />
                        <View style={styles.actionBtn}>
                            <Btn title="Join" onPress={handleSignUp} 
                                style={styles.largeBtn}
                                textStyle={styles.loginButtonText} 
                                shape="circular"   
                                width={60} // Custom width
                                height={60}
                            />
                          
                          <TouchableOpacity   onPress={handleSignIn}>
                            <View style={styles.triangleContainer}   >
                                <Btn title=""
                                shape="triangle" 
                                style={styles.triangleButton} 
                                width={60} // Custom width
                                height={60} // Custom height
                                />
                                <Text style={styles.triangleText}>Login</Text>
                            </View>
                            </TouchableOpacity>

                            <Btn
                                title="Pass"
                                onPress={handlePassPress }
                                textStyle={styles.loginButtonText} 
                                shape="square"
                                width={60}
                                height={60}
                                backgroundColor={colors.vividGreen }
                            />


                        </View>
                        {isLoading && (
                            <View style={styles.loadingOverlay}>
                                <ActivityIndicator size="large" color="#0000ff" />
                            </View>
                        )}
                    </View>
                </ScrollView>
            </SafeAreaView>
        </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    welcomeText: {
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 40,
    },
    inputBox: {
        width: '100%',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    input: {
        borderBottomWidth: 1,
        marginBottom: 20,
        width: '100%',
        fontSize: 20,
    },
    actionBtn: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    loginBtn: {
         
     //   marginRight: 5,
     //   marginLeft: 5,
    },
    loginButtonText: {
        color: '#ffffff',
        fontSize: 22,
        fontWeight: 'bold',
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    largeBtn: {
        //width: 100, // Increased width
        //height: 100, // Increased height
       // borderRadius: 60, // Adjust radius for circular buttons
      },
      largeButtonText: {
        fontSize: 20, // Increased font size
        fontWeight: 'bold',
      },
      bottomAlignText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
        position: 'absolute', // Make the text position absolute
        bottom: 5, // Adjust distance from the bottom
        textAlign: 'center', // Center the text horizontally
        width: '100%', // Ensure the text spans the button's width
      },triangleContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative', // Required for absolute text positioning
        width: 60,
        height: 60,
      },
      triangleButton: {
        position: 'absolute',
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 30,
        borderRightWidth: 30,
        borderBottomWidth: 60,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: colors.triBtn || '#FF5722',
      },
      triangleText: {
        position: 'absolute',
        bottom: 5,
        fontSize: 17,
        fontWeight: 'bold',
        color: '#ffffff',
        textAlign: 'center',
      },
});

export default Login;
