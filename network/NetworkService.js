import axios from 'axios';
import qs from 'qs'; // Import querystring library for URL encoding
import {
  Platform
} from 'react-native';

import { baseURL } from '../config';
import { NativeModules } from 'react-native';
const { RCTNetworking } = NativeModules; 

class NetworkService {

   
  constructor() {
    // Create an Axios instance
 
    this.instance = axios.create({
      baseURL: baseURL ,
      timeout: 20000, // Timeout in milliseconds
      headers: {
        'Accept': 'application/json', // Expect JSON response
      },
    });

    // Interceptor to log request details
    this.instance.interceptors.request.use(
      (config) => {
        // Log the full URL before the request is sent
        const fullUrl = `${ baseURL}${config.url}`;
        console.log(`Requesting URL: ${fullUrl}`, config.params ? `with params: ${JSON.stringify(config.params)}` : '');
        return config;
      },
      (error) => {
        // Handle request error
        return Promise.reject(error);
      }
    );

    // Interceptor to handle response
    this.instance.interceptors.response.use(
      (response) => {
        // Check if the response is JSON
        if (
          response.headers['content-type'] &&
          response.headers['content-type'].includes('application/json') &&
          response && response.data
        ) {
          return response; // Automatically parse JSON data
        } else {
          // If response is not JSON, handle it differently
          console.error('Expected JSON response, but got:', response.headers['content-type']);
          return Promise.reject(new Error('Expected JSON response, but received a different content type.'));
        }
      },
      (error) => {
        //console.error('Response error:', error.message);
        return Promise.reject(error);
      }
    );
  }

  // Common GET request
  async get(url, params = {}) {
    try {
      const response = await this.instance.get(url, { params });
      return response; // Return full response for more context
    } catch (error) {
      this.handleError(error);
    }
  }

  // Common POST request
  async post(url, data = {}) {
    try {
      // Ensure data is properly URL-encoded
      const encodedData = qs.stringify(data); 
      const response = await this.instance.post(url, encodedData , {
        validateStatus: (status) => {
          // Prevent Axios from throwing errors for HTTP 401
          return status >= 200 && status < 300 || status === 401;
        }, 
      } );
      return response; // Return full response for more context
    } catch (error) {
      if (__DEV__) {
      console.error('Error object:', JSON.stringify(error, null, 2)); 
      console.error('Error stack:', error.stack);  
      console.log( ' post error :: ' ,  error)
      }
      this.handleError(error);

      return error;

    }
  }

  async postWithHead(url, data = {} , headers = {} ) {
    try {
      // Ensure data is properly URL-encoded
      const encodedData = qs.stringify(data); 
      const response = await this.instance.post(url, encodedData , {
        headers: headers,
      });
      return response; // Return full response for more context
    } catch (error) {

      console.log( ' post error :: ' ,  error)

      this.handleError(error);

      return error;

    }
  }





  // Common PUT request
  async put(url, data = {}) {
    try {
      // Ensure data is properly URL-encoded
      const encodedData = qs.stringify(data);
      const response = await this.instance.put(url, encodedData);
      return response; // Return full response for more context
    } catch (error) {
      this.handleError(error);
    }
  }

  // Common DELETE request
  async delete(url) {
    try {
      const response = await this.instance.delete(url);
      return response; // Return full response for more context
    } catch (error) {
      this.handleError(error);
    }
  }

  // New Upload method
  async upload(url, formData) {
    try {
      // Send the request with the formData
      const response = await this.instance.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      return response; // Ensure we return the full response object
    } catch (error) {
      this.handleError(error);
      throw error; // Ensure errors are properly thrown and handled
    }
  }
  

  handleError(error) {
    if (__DEV__) {
    if (error.response) {
      // The request was made and the server responded with a status code outside of 2xx
      console.log('Response error:', error.response.data.message);
    } else if (error.request) {
      // The request was made but no response was received
      console.log('Request error:', error);
    } else {
      // Something happened in setting up the request
      console.log('Error setting up request:', error.message);
    }
  }
   // console.error('Network error:', error.message);
  }
  //RCTNetworking.ignoreSslErrors(true);
}

// Export a single instance of the class
export default new NetworkService();
