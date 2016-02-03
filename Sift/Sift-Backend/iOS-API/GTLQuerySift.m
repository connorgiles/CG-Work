/* This file was generated by the ServiceGenerator.
 * The ServiceGenerator is Copyright (c) 2015 Google Inc.
 */

//
//  GTLQuerySift.m
//

// ----------------------------------------------------------------------------
// NOTE: This file is generated from Google APIs Discovery Service.
// Service:
//   sift/v1
// Description:
//   API for sift
// Classes:
//   GTLQuerySift (2 custom class methods, 1 custom properties)

#import "GTLQuerySift.h"

#import "GTLSiftMainArticleRequest.h"
#import "GTLSiftMainArticleResponse.h"
#import "GTLSiftMainUpvoteRequest.h"
#import "GTLSiftMainUpvoteResponse.h"

@implementation GTLQuerySift

@dynamic fields;

#pragma mark -
#pragma mark "siftApi" methods
// These create a GTLQuerySift object.

+ (id)queryForSiftApiGetArticlesWithObject:(GTLSiftMainArticleRequest *)object {
  if (object == nil) {
    GTL_DEBUG_ASSERT(object != nil, @"%@ got a nil object", NSStringFromSelector(_cmd));
    return nil;
  }
  NSString *methodName = @"sift.siftApi.getArticles";
  GTLQuerySift *query = [self queryWithMethodName:methodName];
  query.bodyObject = object;
  query.expectedObjectClass = [GTLSiftMainArticleResponse class];
  return query;
}

+ (id)queryForSiftApiUpvoteWithObject:(GTLSiftMainUpvoteRequest *)object {
  if (object == nil) {
    GTL_DEBUG_ASSERT(object != nil, @"%@ got a nil object", NSStringFromSelector(_cmd));
    return nil;
  }
  NSString *methodName = @"sift.siftApi.upvote";
  GTLQuerySift *query = [self queryWithMethodName:methodName];
  query.bodyObject = object;
  query.expectedObjectClass = [GTLSiftMainUpvoteResponse class];
  return query;
}

@end
