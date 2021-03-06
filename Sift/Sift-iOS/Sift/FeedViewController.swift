//
//  ViewController.swift
//  Sift
//
//  Created by Connor Giles on 2015-03-28.
//  Copyright (c) 2015 Connor Giles. All rights reserved.
//

import UIKit
import SVPullToRefresh
import SVProgressHUD
import SDWebImage

var imagesDownloading = 0

class FeedCell: UITableViewCell{
    
    @IBOutlet weak var upvotesLabel: UILabel!
    @IBOutlet weak var titleLabel: UILabel!
    @IBOutlet weak var detailsLabel: UILabel!
    @IBOutlet weak var publicationLogo: UIImageView!
    @IBOutlet weak var articleImage: UIImageView!
    
    var article: Article!
    
    override func layoutSubviews() {
        super.layoutSubviews()
        articleImage.frame = CGRect(x: 0, y: 0, width: self.contentView.bounds.width, height: self.contentView.bounds.height)
    }
    
    func setupArticle(article: Article) {
        
        self.article = article
        
        titleLabel.text = article.title
        detailsLabel.text = article.details
        publicationLogo.image = article.getPublicationLogo()
        
        upvotesLabel.text = "Recommended by \(article.upvotes)"
        
        articleImage.image = article.articleImage
        articleImage.clipsToBounds = true
        articleImage.contentMode = UIViewContentMode.ScaleAspectFill
    }
    
}

class FeedViewController: UIViewController {
    
    var articles = [Article]()
    var selected: Article!
    var viewingArticle = false
    var nextArticle: Article!
    @IBOutlet weak var navBar: UIImageView!
    
    @IBOutlet weak var tableView: UITableView!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        tableView.addPullToRefreshWithActionHandler({self.getOlderArticles()})
        tableView.addInfiniteScrollingWithActionHandler({self.getNewerArticles()})
        
        tableView.pullToRefreshView.setTitle("Get older articles...", forState: UInt(SVPullToRefreshStateTriggered))
        
        tableView.scrollsToTop = true
        
        getNewerArticles()
        
    }
    
    func getNewerArticles() {
        
        //Setup Google Service
        let service = GTLServiceSift()
        service.retryEnabled = true
        
        //Declare Request Message
        let articleRequest = GTLSiftMainArticleRequest()
        
        //Set Request Paramaters
        if articles.count == 0 {
            
            let defaults = NSUserDefaults()
            
            let lastArticleTime = defaults.objectForKey("lastArticleTime") as? NSTimeInterval
            
            if lastArticleTime != nil {
                articleRequest.currentArticleTimestamp = lastArticleTime
            } else {
                articleRequest.currentArticleTimestamp = NSInteger(NSDate().timeIntervalSince1970-(12*60*60))
            }
            
        } else {
            articleRequest.currentArticleTimestamp = articles.last?.date.timeIntervalSince1970
        }
        
        articleRequest.numOfArticles = 20
        articleRequest.userId = "TEST"
        
        //Delare query
        let query = GTLQuerySift.queryForSiftApiGetArticlesWithObject(articleRequest) as! GTLQuerySift
        
        //Perform authentication and login
        service.executeQuery(query, completionHandler: { (ticket: GTLServiceTicket!, object: AnyObject!, error: NSError!) -> Void in
            if object != nil {
                
                //Cast down to Article Response Message
                let response = object as! GTLSiftMainArticleResponse
                
                if response.articles != nil {
                    let newArticles = response.articles as! [GTLSiftMainArticle]
                    
                    for article in newArticles {
                        self.articles.append(Article(article: article))
                        self.tableView.insertRowsAtIndexPaths([NSIndexPath(forRow: self.articles.count-1
                            , inSection: 0)], withRowAnimation: UITableViewRowAnimation.Fade)
                    }
                } else {
                    
                    if self.articles.count == 0 {
                        
                        
                        let defaults = NSUserDefaults()
                        
                        defaults.setObject(NSInteger(NSDate().timeIntervalSince1970-(12*60*60)), forKey: "lastArticleTime")
                        
                        defaults.synchronize()
                        
                        print("NO MORE ARTICLES")
                        
                        SVProgressHUD.showInfoWithStatus("The end. Check back soon!")
                    } else {
                        
                    }
                }
                
                
            } else {
                print("Error: \(error)")
            }
            
            self.tableView.infiniteScrollingView.stopAnimating()
            
        })
        
    }
    
    func getOlderArticles() {
        
        //Setup Google Service
        let service = GTLServiceSift()
        service.retryEnabled = true
        
        //Declare Request Message
        let articleRequest = GTLSiftMainArticleRequest()
        
        //Set Request Paramaters
        if articles.count == 0 {
            
            articleRequest.currentArticleTimestamp = NSDate().timeIntervalSince1970
        } else {
            articleRequest.currentArticleTimestamp = articles.first?.date.timeIntervalSince1970
        }
        
        articleRequest.numOfArticles = -20
        articleRequest.userId = "TEST"
        
        //Delare query
        let query = GTLQuerySift.queryForSiftApiGetArticlesWithObject(articleRequest) as! GTLQuerySift
        
        //Perform authentication and login
        service.executeQuery(query, completionHandler: { (ticket: GTLServiceTicket!, object: AnyObject!, error: NSError!) -> Void in
            if object != nil {
                
                //Cast down to Article Response Message
                let response = object as! GTLSiftMainArticleResponse
                
                if response.articles != nil {
                    
                    let newArticles = response.articles as! [GTLSiftMainArticle]
                    
                    for article in newArticles {
                        self.articles.insert(Article(article: article), atIndex: 0)
                    }
                    
                    self.tableView.reloadData()
                    
                    self.tableView.scrollToRowAtIndexPath(NSIndexPath(forRow: newArticles.count, inSection: 0), atScrollPosition: UITableViewScrollPosition.Top, animated: false)
                    
                    self.tableView.pullToRefreshView.stopAnimating()
                    
                } else {
                    print("NO MORE ARTICLES")
                    
                    SVProgressHUD.showInfoWithStatus("You've reached the end!")
                }
                
                
            } else {
                print("Error: \(error)")
            }
            
            self.tableView.infiniteScrollingView.stopAnimating()
            
        })
        
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
    }
    
    override func prepareForSegue(segue: UIStoryboardSegue, sender: AnyObject?) {
        let articleView = segue.destinationViewController as! ArticleViewController
        articleView.article = selected
        articleView.feedView = self
        viewingArticle = true
        setNeedsStatusBarAppearanceUpdate()
    }
    
    @IBAction func closeArticleViewController (sender: UIStoryboardSegue){
        print("HERE")
        let articleView = sender.sourceViewController as! ArticleViewController
        articleView.removeFromParentViewController()
        tableView.reloadData()
        viewingArticle = false
        setNeedsStatusBarAppearanceUpdate()
        
    }
    
    override func preferredStatusBarStyle() -> UIStatusBarStyle {
        return UIStatusBarStyle.LightContent
    }
    
    override func prefersStatusBarHidden() -> Bool {
        return viewingArticle
    }
    
    override func viewWillDisappear(animated: Bool) {
        let rows = tableView.indexPathsForVisibleRows!
        
        for index in rows {
            let article = tableView.cellForRowAtIndexPath(index) as! FeedCell
            
            print(article.article.title)
        }
    }
    
}

extension FeedViewController: UITableViewDataSource {
    
    func tableView(tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        let count = articles.count
        
        if count == 0 {
            navBar.hidden = true
        } else {
            navBar.hidden = false
        }
        return count
    }
    
    func tableView(tableView: UITableView, cellForRowAtIndexPath indexPath: NSIndexPath) -> UITableViewCell {
        
        let article = articles[indexPath.row]
        
        let defaults = NSUserDefaults()
        
        defaults.setObject(article.date.timeIntervalSince1970, forKey: "lastArticleTime")
        
        defaults.synchronize()
        
        let cell = tableView.dequeueReusableCellWithIdentifier("FeedCell") as! FeedCell
        
        if article.hasImage! {
            
            cell.setupArticle(article)
            cell.setNeedsLayout()
            
        } else {
            
            article.retrieveImage({ () -> () in
                cell.setupArticle(article)
                cell.setNeedsLayout()
            })
        }
        
        cell.layoutSubviews()
        
        
        return cell
        
    }
}

extension FeedViewController: UITableViewDelegate {
    
    func tableView(tableView: UITableView, didSelectRowAtIndexPath indexPath: NSIndexPath) {
        
        selected = articles[indexPath.row]
        print("Reading \"\(selected.title)\"")
        
        performSegueWithIdentifier("displayArticle", sender: self)
        
        tableView.deselectRowAtIndexPath(indexPath, animated: false)
        
    }
    
    
}