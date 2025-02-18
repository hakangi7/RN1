import { Platform } from 'react-native';

// Define the baseURL as a constant outside the NetworkService class
export const baseURL: string = Platform.OS === 'ios' ? "http://logicmaker.com:3001/" : "http://logicmaker.com:3001/" ;//'http://localhost:3001/' : 'http://10.0.2.2:3001/' ; 
//ios http://localhost:3001  and 'http://10.0.2.2:3001/'
