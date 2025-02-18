//
//  APIClient.m
//  RN1
//
//  Created by super on 11/28/24.
//

#import "APIClient.h"
#import <AFNetworking/AFNetworking.h>

@implementation APIClient

+ (void)sendGetRequestToEndpoint:(NSString *)endpoint
                      parameters:(NSDictionary *)parameters
                      completion:(void (^)(id responseObject, NSError *error))completion {
    // Construct the full URL
    NSString *fullURL = [NSString stringWithFormat:@"%@%@", kBaseURL, endpoint];

    // Use Alamofire to send a GET request
    [[AFHTTPSessionManager manager] POST:fullURL
                             parameters:parameters
                               headers:nil
                               progress:nil
                                success:^(NSURLSessionDataTask * _Nonnull task, id  _Nullable responseObject) {
                                    if (completion) {
                                        completion(responseObject, nil);
                                    }
                                } failure:^(NSURLSessionDataTask * _Nullable task, NSError * _Nonnull error) {
                                    if (completion) {
                                        completion(nil, error);
                                    }
                                }];
}

@end
