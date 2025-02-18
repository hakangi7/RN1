//
//  RNEventEmitter.h
//  RN1
//
//  Created by super on 11/28/24.
//

#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RNEventEmitter : RCTEventEmitter<RCTBridgeModule>
-(void)sendEventWithName:(NSString *)name body:(id)body  ;
@end

 
