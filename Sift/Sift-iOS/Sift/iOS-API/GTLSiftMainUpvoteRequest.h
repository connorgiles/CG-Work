/* This file was generated by the ServiceGenerator.
 * The ServiceGenerator is Copyright (c) 2015 Google Inc.
 */

//
//  GTLSiftMainUpvoteRequest.h
//

// ----------------------------------------------------------------------------
// NOTE: This file is generated from Google APIs Discovery Service.
// Service:
//   sift/v1
// Description:
//   API for sift
// Classes:
//   GTLSiftMainUpvoteRequest (0 custom class methods, 2 custom properties)

#if GTL_BUILT_AS_FRAMEWORK
  #import "GTL/GTLObject.h"
#else
  #import "GoogleOpenSource/GTLObject.h"
#endif

// ----------------------------------------------------------------------------
//
//   GTLSiftMainUpvoteRequest
//

@interface GTLSiftMainUpvoteRequest : GTLObject
@property (copy) NSString *articleTitle;
@property (copy) NSString *userId;
@end
