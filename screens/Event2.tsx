import React, { useState, useEffect } from 'react';
import { View, Text,   SafeAreaView , Alert  , ScrollView, Image, FlatList, StyleSheet, Dimensions } from 'react-native';
import { baseURL } from '../config';

const screenWidth = Dimensions.get('window').width;




const Event2: React.FC = () => {

    console.log( 'ev :: ' + baseURL );
    const ev2 = [
     //   { id: '1', uri: `${ baseURL}EventImg/nas4.jpg` },
     //   { id: '2', uri: `${ baseURL}EventImg/nas5.jpg`  },
        { id: '3', uri: `${ baseURL}EventImg/nas3.jpg?timestamp=${Date.now()}`  },
        { id: '4', uri: `${ baseURL}EventImg/nas1.jpg?key=1&timestamp=${Date.now()}`  },
        { id: '5', uri: `${ baseURL}EventImg/nas2.jpg?key2=2&timestamp=${Date.now()}`  },
        { id: '6', uri: `${ baseURL}EventImg/nas6.jpg?key3=3&timestamp=${Date.now()}`  },
      ];


      const renderItem = ({ item }: { item: { id: string; uri: string } }) => {
        console.log(item.uri); // Log the URI to the console
      
        return (
          <Image source={{ uri: item.uri }} style={styles.image} 
          onError={(error) => console.log('Image load error:', error)}
          />
        );
      };
    
      return (
        <SafeAreaView style={{ flex: 1 }} forceInset={{ bottom: 'never' }} >
          <View  > 
        <FlatList
        data={ev2}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.container}
        initialNumToRender={4}
        maxToRenderPerBatch={4} 
        windowSize={10}
        onEndReachedThreshold={0.5} 
        ListHeaderComponent={
          <View>
            <Text style={styles.title}>QNAP TS-453Be NAS</Text>
            <Text style={styles.subtitle}>Details:</Text>
            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>• 4-Bay</Text>
              <Text style={styles.infoText}>• 16GB Memory</Text>
              <Text style={styles.infoText}>• 1.5GHz Processor</Text>
              <Text style={styles.infoText}>• 1000Giga (4 Drives)</Text>
              <Text style={styles.infoText}>• Fully Tested</Text>
              <Text style={styles.infoText}>• Disassembled and Cleaned</Text>
            </View>
            <Text style={styles.subtitle}>이글이 표시되고 있으면 아직 제고가 있는 것입니다.</Text>
            <View style={styles.priceContainer}>
        <Text style={styles.priceLabel}>잠실역 직거래 기준:logicmaker@naver.com</Text>
        <Text style={styles.price}>45만원</Text>
      </View>


          </View>
          
        }
      />
      </View>
      </SafeAreaView>
    );
    };

    const styles = StyleSheet.create({    
    container: {
      flexGrow: 1,
      paddingBottom: 50
      },
      title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
        textAlign: 'center',
      },
      subtitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#555',
        marginBottom: 10,
      },
      infoContainer: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginBottom: 20,
      },
      infoText: {
        fontSize: 16,
        color: '#666',
        marginBottom: 5,
      },
      itemContainer: {
        marginBottom: 15,
        backgroundColor: '#fff',
        borderRadius: 8,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      },
      image: {
        width: screenWidth - 20, // Full width minus padding
        height: screenWidth * 0.6, // Adjust height ratio as needed
        resizeMode: 'cover', // Ensures the image covers the area proportionally
      },
      text: {
        fontSize: 16,
        fontWeight: 'bold',
        padding: 10,
        textAlign: 'center',
        color: '#333',
      },
      priceContainer: {
        marginTop: 20,
        padding: 15,
        backgroundColor: '#ffe4e1', // Light red background for emphasis
        borderRadius: 8,
        alignItems: 'center',
      },
      priceLabel: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
      },
      price: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#d32f2f', // Red color for emphasis
        marginTop: 5,
      },
    });
export default Event2;
