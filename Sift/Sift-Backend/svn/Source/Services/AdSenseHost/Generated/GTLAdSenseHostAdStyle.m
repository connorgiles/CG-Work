/* Copyright (c) 2012 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

//
//  GTLAdSenseHostAdStyle.m
//

// ----------------------------------------------------------------------------
// NOTE: This file is generated from Google APIs Discovery Service.
// Service:
//   AdSense Host API (adsensehost/v4.1)
// Description:
//   Gives AdSense Hosts access to report generation, ad code generation, and
//   publisher management capabilities.
// Documentation:
//   https://developers.google.com/adsense/host/
// Classes:
//   GTLAdSenseHostAdStyle (0 custom class methods, 4 custom properties)
//   GTLAdSenseHostAdStyleColors (0 custom class methods, 5 custom properties)
//   GTLAdSenseHostAdStyleFont (0 custom class methods, 2 custom properties)

#import "GTLAdSenseHostAdStyle.h"

// ----------------------------------------------------------------------------
//
//   GTLAdSenseHostAdStyle
//

@implementation GTLAdSenseHostAdStyle
@dynamic colors, corners, font, kind;

+ (void)load {
  [self registerObjectClassForKind:@"adsensehost#adStyle"];
}

@end


// ----------------------------------------------------------------------------
//
//   GTLAdSenseHostAdStyleColors
//

@implementation GTLAdSenseHostAdStyleColors
@dynamic background, border, text, title, url;
@end


// ----------------------------------------------------------------------------
//
//   GTLAdSenseHostAdStyleFont
//

@implementation GTLAdSenseHostAdStyleFont
@dynamic family, size;
@end
