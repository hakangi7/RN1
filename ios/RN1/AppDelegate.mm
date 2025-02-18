#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import <GoogleMaps/GoogleMaps.h>
#import <Photos/Photos.h>
#import <Firebase/Firebase.h>
#import <FirebaseMessaging/FirebaseMessaging.h>
#import <CoreLocation/CoreLocation.h>
#import <AVFoundation/AVFoundation.h>
#import <UserNotifications/UserNotifications.h>
#import <React/RCTBridge.h>
//#import <React/RCTEventEmitter.h>
#import <React/RCTRootView.h>
#import "RNEventEmitter.h"

@interface AppDelegate () <CLLocationManagerDelegate>
@property (nonatomic, strong) CLLocationManager *locationManager;
@property (nonatomic, assign) BOOL isBackground;
@end

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
   
    // Provide Google Maps API Key
    [GMSServices provideAPIKey:@"AIzaSyBM-lRAb3UetyrYY1EKKTGSLj5kbrhymmY"];
    
    // Initialize React Native Bridge and Root View
    NSDictionary *featureFlags = @{ @"fuseboxEnabledRelease": @YES };
    RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];
    RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge moduleName:@"RN1" initialProperties:featureFlags];
    rootView.backgroundColor = [UIColor whiteColor];
    
    // Set up window and root view controller
    self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
    UIViewController *rootViewController = [UIViewController new];
    rootViewController.view = rootView;
    self.window.rootViewController = rootViewController;
    [self.window makeKeyAndVisible];
    
    [FIRApp configure];
  // Set Firebase messaging delegate
    [FIRMessaging messaging].delegate = self;

    // Register for remote notifications
    [[UIApplication sharedApplication] registerForRemoteNotifications];

    // Set up notification center delegate
    [UNUserNotificationCenter currentNotificationCenter].delegate = self;

      
    self.isBackground = NO;
  NSLog(@"App moved to foreground");
    // Request permissions in the correct sequence
    [self requestLocationPermission];
    [self requestCameraPermission];
    [self requestPhotoLibraryPermission];
    [self requestPushNotificationPermission];
    
    return YES;
}

 - (void)userNotificationCenter:(UNUserNotificationCenter *)center
        willPresentNotification:(UNNotification *)notification
        withCompletionHandler:(void (^)(UNNotificationPresentationOptions options))completionHandler {
  
     // Get the payload data from the notification
     NSDictionary *userInfo = notification.request.content.userInfo;
 
  
     // Call the completion handler to show the notification with sound, alert, and badge options
     completionHandler(UNNotificationPresentationOptionSound | UNNotificationPresentationOptionAlert | UNNotificationPresentationOptionBadge|UIBackgroundFetchResultNewData);
 }
 

// - (void)registerForRemoteNotifications {
//     if (@available(iOS 10.0, *)) {
//         UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
//         center.delegate = self;
//         UNAuthorizationOptions authOptions = UNAuthorizationOptionAlert | UNAuthorizationOptionSound | UNAuthorizationOptionBadge;
//         [center requestAuthorizationWithOptions:authOptions completionHandler:^(BOOL granted, NSError * _Nullable error) {
//             if (!error) {
//                 dispatch_async(dispatch_get_main_queue(), ^{
//                     [[UIApplication sharedApplication] registerForRemoteNotifications];
//                 });
//             }
//         }];
//     } else {
//         UIUserNotificationType allNotificationTypes = (UIUserNotificationTypeSound | UIUserNotificationTypeAlert | UIUserNotificationTypeBadge);
//         UIUserNotificationSettings *settings = [UIUserNotificationSettings settingsForTypes:allNotificationTypes categories:nil];
//         [[UIApplication sharedApplication] registerUserNotificationSettings:settings];
//         [[UIApplication sharedApplication] registerForRemoteNotifications];
//     }
// }

// // This method will be called once the APNs token is received
 - (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken {
       const unsigned *tokenBytes = (const unsigned *)[deviceToken bytes];
       NSMutableString *hexString = [NSMutableString stringWithCapacity:deviceToken.length * 2];
      
       for (NSInteger i = 0; i < deviceToken.length; i++) {
           [hexString appendFormat:@"%02x", tokenBytes[i]];
       }
      
       NSString *deviceTokenString = [hexString copy];
      
       NSLog(@"APNs Device Token (String): %@", deviceTokenString);
      
       // Pass the deviceToken to Firebase
       //[[FIRMessaging messaging] setAPNSToken:deviceToken];
 }

// This method is called when the FCM registration token is refreshed or initially generated
 - (void)messaging:(FIRMessaging *)messaging didReceiveRegistrationToken:(NSString *)fcmToken {
     NSLog(@"FCM Token: %@", fcmToken);
     NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
     NSString *userEmail = [defaults stringForKey:@"userEmail"];
     NSLog(@"userEmail %@" , userEmail );
      
   // Check if userEmail exists before proceeding
       if (userEmail && userEmail.length > 0) {
           // Prepare parameters for the GET request
           NSDictionary *parameters = @{
               @"token": fcmToken,
               @"email": userEmail
           };
         NSLog(@"Send from appdelegate ");
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

 // Handle failure to register for APNs
 - (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error {
     NSLog(@"Failed to register for remote notifications: %@", error);
 }




#pragma mark - Permissions Request Sequence

// Request Location (GPS) Permission
- (void)requestLocationPermission {
    self.locationManager = [[CLLocationManager alloc] init];
    self.locationManager.delegate = self;
    
    if ([CLLocationManager authorizationStatus] == kCLAuthorizationStatusNotDetermined) {
        [self.locationManager requestWhenInUseAuthorization];  // or requestAlwaysAuthorization based on your needs
    }
}

// Request Camera Permission
- (void)requestCameraPermission {
    AVAuthorizationStatus cameraAuthStatus = [AVCaptureDevice authorizationStatusForMediaType:AVMediaTypeVideo];
    
    if (cameraAuthStatus == AVAuthorizationStatusNotDetermined) {
        [AVCaptureDevice requestAccessForMediaType:AVMediaTypeVideo completionHandler:^(BOOL granted) {
            if (granted) {
                NSLog(@"Camera permission granted");
            } else {
                NSLog(@"Camera permission denied");
            }
        }];
    }
}

// Request Photo Library Permission
- (void)requestPhotoLibraryPermission {
    PHAuthorizationStatus photoAuthStatus = [PHPhotoLibrary authorizationStatus];
    
    if (photoAuthStatus == PHAuthorizationStatusNotDetermined) {
        [PHPhotoLibrary requestAuthorization:^(PHAuthorizationStatus status) {
            if (status == PHAuthorizationStatusAuthorized) {
                NSLog(@"Photo library permission granted");
            } else {
                NSLog(@"Photo library permission denied");
            }
        }];
    }
}

// // Request Push Notification Permission
 - (void)requestPushNotificationPermission {
     UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
     [center requestAuthorizationWithOptions:(UNAuthorizationOptionAlert | UNAuthorizationOptionSound | UNAuthorizationOptionBadge)
                           completionHandler:^(BOOL granted, NSError * _Nullable error) {
         if (granted) {
             NSLog(@"Push notification permission granted");
             dispatch_async(dispatch_get_main_queue(), ^{
                 [[UIApplication sharedApplication] registerForRemoteNotifications];
             });
         } else {
             NSLog(@"Push notification permission denied");
         }
     }];
 }

#pragma mark - Push Notification Handlers

  
- (void)application:(UIApplication *)application
didReceiveRemoteNotification:(NSDictionary *)userInfo
fetchCompletionHandler:(void (^)(UIBackgroundFetchResult result))completionHandler {
    // Log the notification payload
    NSLog(@"FCM Notification: %@", userInfo);

    // Check for FCM data payload
    NSDictionary *data = userInfo[@"data"];
    if (userInfo   ) {
        // Pass the data to React Native via your event emitter
      RCTBridge *bridge =  [self getReactBridge];
      RNEventEmitter *eventEmitter =  [bridge moduleForClass:[RNEventEmitter class]];// [[RNEventEmitter alloc] init]; //
      [eventEmitter  sendEventWithName:@"FCMMessageReceived" body:userInfo   ];
      
      if (self.isBackground) {
              [self showNotificationWithMessageData:userInfo];
          }
      
      
    } else {
      NSLog(@"userinfo not here .");
    }
    // Notify iOS that the notification has been processed
    completionHandler(UIBackgroundFetchResultNewData);
}

-(void)applicationDidEnterBackground:(UIApplication *)application {

  self.isBackground = YES;
  NSLog(@"App moved to background");
  //  UIApplicationState state = application.applicationState;
//  if (state == UIApplicationStateBackground || state == UIApplicationStateInactive) {
//      // background
//  } else if (state == UIApplicationStateActive) {
//      // foreground
//  }
}
// Handle foreground and background messages
//- (void)messaging:(FIRMessaging *)messaging didReceiveMessage:(FIRMessagingRemoteMessage *)remoteMessage {
//    NSDictionary *messageData = remoteMessage.appData;
//    NSLog(@"Received FCM data message: %@", messageData);
//
//    [self showNotificationWithMessageData:messageData];
//}

- (void)applicationWillEnterForeground:(UIApplication *)application {
    self.isBackground = NO;
    NSLog(@"App moved to foreground");
}


- (void)showNotificationWithMessageData:(NSDictionary *)messageData {
  
    NSLog(@"showNotificationWithMessageData %@ " , messageData  );
  
    NSString *title = messageData[@"title"];
    NSString *body = messageData[@"body"];
    NSString *productID = messageData[@"productID"];

    UNMutableNotificationContent *content = [[UNMutableNotificationContent alloc] init];
    content.title = title ?: @"New Notification";
    content.body = body ?: @"You have received a message.";
    content.userInfo = messageData;
    content.sound = [UNNotificationSound defaultSound];

    // Create trigger
    UNTimeIntervalNotificationTrigger *trigger = [UNTimeIntervalNotificationTrigger triggerWithTimeInterval:1 repeats:NO];

    // Create a request
    NSString *identifier = [NSString stringWithFormat:@"productID_%@", productID ?: @"unknown"];
    UNNotificationRequest *request = [UNNotificationRequest requestWithIdentifier:identifier
                                                                          content:content
                                                                          trigger:trigger];

    // Add the notification to the notification center
    UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
    [center addNotificationRequest:request withCompletionHandler:^(NSError * _Nullable error) {
        if (error != nil) {
            NSLog(@"Error adding notification: %@", error);
        }
    }];
}



- (RCTBridge *)getReactBridge {
    // Check if the root view exists and retrieve its bridge
    if ([self.window.rootViewController.view isKindOfClass:[RCTRootView class]]) {
        RCTRootView *rootView = (RCTRootView *)self.window.rootViewController.view;
        RCTBridge *bridge = rootView.bridge;
        //RNEventEmitter *eventEmitter = [bridge moduleForClass:[RNEventEmitter class]];
        //[eventEmitter sendEventWithName:@"FCMMessageReceived" body:data];

        NSLog(@"bridge ok ");
        return bridge;
    }
  NSLog(@"bridge no ");
    return nil; // Return nil if the bridge is not available
}



#pragma mark - React Native Bridge

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge {
    return [self bundleURL];
}

- (NSURL *)bundleURL {
#if DEBUG
    return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
    return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end
