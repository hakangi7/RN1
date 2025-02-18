//
//  FromReactModule.m
//  RN1
//
//  Created by super on 11/28/24.
//

#import <React/RCTBridgeModule.h>
#import "APIClient.h"
@interface FromReactModule : NSObject <RCTBridgeModule>
@end

@implementation FromReactModule

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(receiveDataFromReact:(NSString *)data) {
    NSLog(@"Data from React Native: %@", data);
  
  NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];

  // Save a string
  [defaults setObject:data forKey:@"userEmail"];
  
  
  NSString *fcmToken = [defaults stringForKey:@"fcmToken"];
  NSLog(@"fcmToken %@" , fcmToken );
   

  
  // Check if userEmail exists before proceeding
      if (fcmToken && fcmToken.length > 0) {
          // Prepare parameters for the GET request
          NSDictionary *parameters = @{
              @"token": fcmToken,
              @"email": data
          };
        NSLog(@"Send from module ");
          // Use APIClient to send the GET request
          [APIClient sendGetRequestToEndpoint:@"updateFCM"
                                   parameters:parameters
                                   completion:^(id responseObject, NSError *error) {
              if (!error) {
                  NSLog(@"Server Response: %@", responseObject);
              } else {
                  NSLog(@"Error Sending Token to Server: %@", error.localizedDescription);
              }
          }];
      } else {
          NSLog(@"User email is not set in NSUserDefaults.");
      }
  
  
  
}

@end
