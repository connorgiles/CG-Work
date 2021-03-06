/* This file was generated by the ServiceGenerator.
 * The ServiceGenerator is Copyright (c) 2015 Google Inc.
 */

//
//  GTLSiftMainArticleRequest.m
//

// ----------------------------------------------------------------------------
// NOTE: This file is generated from Google APIs Discovery Service.
// Service:
//   sift/v1
// Description:
//   API for sift
// Classes:
//   GTLSiftMainArticleRequest (0 custom class methods, 3 custom properties)

#import "GTLSiftMainArticleRequest.h"

// ----------------------------------------------------------------------------
//
//   GTLSiftMainArticleRequest
//

@implementation GTLSiftMainArticleRequest
@dynamic currentArticleTimestamp, numOfArticles, userId;

+ (NSDictionary *)propertyToJSONKeyMap {
  NSDictionary *map =
    [NSDictionary dictionaryWithObjectsAndKeys:
      @"current_article_timestamp", @"currentArticleTimestamp",
      @"num_of_articles", @"numOfArticles",
      @"user_id", @"userId",
      nil];
  return map;
}

@end
