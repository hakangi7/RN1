 


import React, { useState } from 'react';
import { View, Text, Button, Image } from 'react-native';
import axios from 'axios';
import { launchImageLibrary } from 'react-native-image-picker';
import AWS from 'aws-sdk';
import { Platform } from 'react-native';

const  Tezt: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);

  // Function to make a GET request
  const fetchData = async () => {


    // const instance = axios.create({
    //   baseURL: 'https://appleappdev.com',
    //   timeout: 20000,
    // });
    
   
    
    // // Make your request
    // instance
    //   .get('/appLec/imageList.jsp?key=1')
    //   .then((response) => {
    //     console.log('Response:', response.data);
    //   })
    //   .catch((error) => {
    //     console.error('Error:', error.message);
    //   });
   


       
        try {
          const response = await axios.get('http://logicmaker.com/appLec/imageList.jsp?key=1');
          console.log('Response:', response.data);
        } catch (error) {
          if (error.response) {
            // The request was made, and the server responded with a status code outside of the range of 2xx
            console.error('Error Response:', error.response.data);
            console.error('Error Status:', error.response.status);
            console.error('Error Headers:', error.response.headers);
          } else if (error.request) {
            // The request was made, but no response was received
            console.error('Error Request:', error.request);
          } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error Message:', error.message);
          }
        }
    


  


    // fetch('https://appleappdev.com/appLec/imageList.jsp?key=1', {
    //   method: 'GET',
    //   headers: {
    //     Accept: 'application/json',
    //   }
    // })
    //   .then(response => {
    //     // Check if the response status is not in the range of 2xx
    //     if (!response.ok) {
    //       return response.json().then(errorData => {
    //         // Create a custom error with the response details
    //         const error = new Error('HTTP error');
    //         error.response = errorData;
    //         error.status = response.status;
    //         error.headers = response.headers;
    //         throw error;
    //       });
    //     }
    //     return response.json();
    //   })
    //   .then(data => {
    //     // Process the successful response data
    //     console.log(data);
    //   })
    //   .catch(error => {
    //     if (error.response) {
    //       // Handle errors with a response from the server
    //       console.error('Response error:', error.response);
    //       console.error('Status:', error.status);
    //       console.error('Headers:', error.headers);
    //     } else {
    //       // Handle network errors or other types of errors
    //       console.error('Error:', error.message);
    //     }
    //   });

    // try {
 
    //  const response = await axios.get('https://appleappdev.com/appLec/imageList.jsp?key=1', {
    //   headers: {
    //     'Content-Type': 'application/json', // Make sure to use the correct content type
    //   },
    //   timeout : 10000
    // });

    //   setData(response.data);
    //   console.log(response.data);
    //   //setData(data);
    // } catch (error) {
    //   console.error('Fetch error:', error);

    //   if (error.response) {
    //     // Server responded with a status code outside the range of 2xx
    //     console.error('Response error:', error.response.data);
    //     console.error('Status:', error.response.status);
    //     console.error('Headers:', error.response.headers);
    //   } else if (error.request) {
    //     // No response was received from the server
    //     console.error('Request error:', error.request);
    //   } else {
    //     // Something happened while setting up the request
    //     console.error('Error', error.message);
    //   }

    // }



//     try {
//       //https://jsonplaceholder.typicode.com/posts/1

//       const https = require('https');
// const axios = require('axios');

// // Configure HTTPS Agent with TLS 1.2
// const agent = new https.Agent({
//   secureProtocol: 'TLSv1_2_method', // Force TLS 1.2
// });

//       const response = await axios.get('https://appleappdev.com' , { httpsAgent: agent } );
//       setData(response.data);
  
//     } catch (error) {
//       if (error.response) {
//         // Server responded with a status code outside the range of 2xx
//         console.error('Response error:', error.response.data);
//         console.error('Status:', error.response.status);
//         console.error('Headers:', error.response.headers);
//       } else if (error.request) {
//         // No response was received from the server
//         console.error('Request error:', error.request);
//       } else {
//         // Something happened while setting up the request
//         console.error('Error', error.message);
//       }
//     }
  


    // try {
    //   const response = await axios.get('https://jsonplaceholder.typicode.com/posts/1');
    //   setData(response.data);
    // } catch (error) {
    //   console.error('Error fetching data:', error);
    // }
  };



 






  // Function to make a POST request
  const postData = async () => {
    try {
      const response = await axios.post('https://jsonplaceholder.typicode.com/posts', {
        title: 'foo',
        body: 'bar',
        userId: 1,
      });
      console.log('Post Response:', response.data);
    } catch (error) {
      console.error('Error posting data:', error);
    }
  };

  // Function to pick an image from the gallery and upload to AWS S3
  const uploadImageToS3 = async () => {
    launchImageLibrary({ mediaType: 'photo' }, async (response) => {
      if (response.assets && response.assets.length > 0) {
        const uri = response.assets[0].uri;
        setImageUri(uri);

        // Configure AWS S3 credentials
        AWS.config.update({
          accessKeyId: 'YOUR_ACCESS_KEY_ID',
          secretAccessKey: 'YOUR_SECRET_ACCESS_KEY',
          region: 'YOUR_REGION',
        });

        const s3 = new AWS.S3();
        const file = {
          uri,
          name: `your-image-name-${Date.now()}.jpg`,
          type: 'image/jpeg',
        };

        const params = {
          Bucket: 'YOUR_BUCKET_NAME',
          Key: file.name,
          Body: {
            uri: file.uri,
            type: file.type,
            name: file.name,
          },
          ACL: 'public-read', // Access control
        };

        try {
          const uploadResult = await s3.upload(params).promise();
          console.log('Image uploaded successfully:', uploadResult.Location);
        } catch (error) {
          console.error('Error uploading image:', error);
        }
      }
    });
  };

  return (
    <View style={{ padding: 20 }}>
      <Button title="Fetch Data" onPress={fetchData} />
      <Button title="Post Data" onPress={postData} />
      <Button title="Upload Image to S3" onPress={uploadImageToS3} />
      {data && <Text>{JSON.stringify(data)}</Text>}
      {imageUri && <Image source={{ uri: imageUri }} style={{ width: 100, height: 100 }} />}
    </View>
  );
};

export default Tezt;
