#import "RNEventEmitter.h"

@interface RNEventEmitter ()
@property (nonatomic, strong) NSMutableArray<NSDictionary *> *eventQueue;
@property (nonatomic, assign) BOOL hasListeners;
@end

@implementation RNEventEmitter

RCT_EXPORT_MODULE();

- (instancetype)init {
    self = [super init];
    if (self) {
        _eventQueue = [NSMutableArray new];
        _hasListeners = NO;
    }
    return self;
}

- (NSArray<NSString *> *)supportedEvents {
    return @[@"FCMMessageReceived"];
}

// Called when JavaScript starts observing
- (void)startObserving {
    _hasListeners = YES;

    // Flush the queue
    for (NSDictionary *event in _eventQueue) {
        [self sendEventWithName:event[@"name"] body:event[@"body"]];
    }
    [_eventQueue removeAllObjects];
}

// Called when JavaScript stops observing
- (void)stopObserving {
    _hasListeners = NO;
}

// Method to send events
- (void)sendEventWithName:(NSString *)name body:(id)body {
    if (_hasListeners) {
        [super sendEventWithName:name body:body];
    } else {
        NSLog(@"No listeners registered. Queuing event: %@", name);
        [_eventQueue addObject:@{@"name": name, @"body": body}];
    }
}

@end
