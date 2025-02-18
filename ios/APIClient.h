//
//  APIClient.h
//  RN1
//
//  Created by super on 11/28/24.
//

#import <Foundation/Foundation.h>
#import "APIConstants.h"

@interface APIClient : NSObject

+ (void)sendGetRequestToEndpoint:(NSString *)endpoint
                      parameters:(NSDictionary *)parameters
                      completion:(void (^)(id responseObject, NSError *error))completion;

@end
