// utils/auth.ts

import { baseURL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetworkService from '../network/NetworkService';
 

export const signIn = async (email: string, password: string) => {
  try {
    const responseData = await NetworkService.post('signin', {
        email: email , password: password 
    });
     console.log( 'status :: ' , responseData?.status  );
    if (responseData && responseData?.status === 200) {
        await AsyncStorage.setItem('token',responseData?.data?.token );
    }

    return responseData;
  } catch (error) {
    if (error?.status === 401) {
      console.error('Unauthorized: Invalid credentials');
    } else {
      console.error('Sign-in error:', error);
    }
    throw error; // Propagate the error to be handled in the calling function
  }
};


export const signup = async (email: string, password: string) => {
  try {
    const responseData = await NetworkService.post('signup', { email: email , password: password });
   
    console.log('Full Response Data:', responseData );
   
    if (responseData && responseData.status === 200) {

        console.log( 'token::',  responseData.data.token );

        await AsyncStorage.setItem('token', responseData.data.token);
        await AsyncStorage.setItem('email', email );

    } 
   
    return responseData;
  } catch (error) {
    throw error; // Propagate the error to be handled in the calling function
  }
};


// export const autoLogin = async () => {
//     const token = await AsyncStorage.getItem('token');
//     if (!token) return null;

//     try {
//         const responseData = await NetworkService.post('autologin', {
//             method: 'POST',
//             headers: { Authorization: 'Bearer ${token}' },
//         });

//         if (responseData.status === 200) {
//             return await responseData.json();
//         } else {
//             console.log('Auto-login failed:', responseData.status  );
//             return null;
//         }
//     } catch (error) {
//         console.error('Auto-login error:', error);
//         return null;
//     }
    
// };


export const autoLogin = async () => {
    const token = await AsyncStorage.getItem('token'); // Retrieve token from storage
    console.log('token :: ',  token  );
  if (!token) {
    console.log('No token found, auto-login cannot proceed.');
    return null;
  }

  try {
    const response = await NetworkService.postWithHead ('autologin',{}, {
     
      Authorization: `Bearer ${token}`  // Send the token in Authorization header
    });

    if (response.status === 200) {

        console.log( 'res :: ' , response.data );

      const responseData = await response.data ; // Parse the JSON response
      return responseData; // Return the user object
    } else {
      console.log(
        'Auto-login failed:',
        response.status,
        response.statusText
      );
      return null;
    }
  } catch (error) {
    console.log('Auto-login error:', error);
    return null;
  }
  };
  





