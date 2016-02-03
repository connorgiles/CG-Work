/*
*   Dynamic Connections - Confirmation Module
*   May 2015
*/

//dependency injection
var express = require('express');
var pg = require('pg');
var bodyParser = require('body-parser')
var nodemailer = require('nodemailer');
var fs = require('fs');
var moment = require('moment');

//initialization
var app = express();

//set production parameters
var production = false;
var to = (production) ? "solutions@dynamicconnections.com" : "sthornley@dynamicconnections.com";

//app configuration
app.set('port', (process.env.PORT || 5001));
app.set('views', './views')
app.set('view engine', 'jade');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(express.static(__dirname + '/public'));

//parsers
var jsonParser = bodyParser.json();
var urlParser = bodyParser.urlencoded();

//++++++++++++++++++++++++++
//       GUID GEN.
//++++++++++++++++++++++++++

function guid(){
    function s4(){
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + s4() + s4() + s4() + s4() + s4() + s4();
}

//++++++++++++++++++++++++++
//       DB ACCESS
//++++++++++++++++++++++++++

app.get('/db', function (req, res) {
    
    pg.connect(process.env.DATABASE_URL, function(err, client, done){
        client.query('SELECT * FROM records_table;', function(err, result){
            done();
            if (err){ 
                console.error(err);
            }else{ 
                console.log(result.rows);
                res.send(result.rows); 
            }
        });
    });
});

//++++++++++++++++++++++++++
//       GENERATE
//++++++++++++++++++++++++++

app.post('/generate', jsonParser, function(req, res){

    var url_extension = guid();

    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    var currentdate = new Date(); 
    var datetime =currentdate.getHours() + ":"  
                  + currentdate.getMinutes() + ":" 
                  + currentdate.getSeconds() +" "
                  + (currentdate.getMonth()+1)  + "/" 
                  + currentdate.getDate() + "/"
                  + currentdate.getFullYear();
    
    //ugly
    var query_string = "INSERT INTO records_table (guid, workorder, load_number, consignee, contact_name, delivery_date, customer, load_contents, shipper,dropoff, response_time, response_notes, response,read_time, read, sent_time, response_type, loaded_from, PO, resolved, contact_email) VALUES ('"+ 
                          url_extension + "',"
                        + parseInt(req.body.workorder) + ","
                        + parseInt(req.body.load_number) + ",'"
                        + req.body.consignee + "','"
                        + req.body.contact_name + "','"
                        + req.body.delivery_date + "','"
                        + req.body.customer + "','"
                        + req.body.load_contents + "','"
                        + req.body.shipper + "','"
                        + req.body.drop_off + "',"
                        + "'None'" + ","
                        + "'None'" + ","
                        + 0 + ","
                        + "'None'" + ","
                        + 0 + ",'"
                        + datetime+"',"
                        + 0 + ",'"
                        + ip + "','" 
                        + req.body.PO + "',"
                        + 0 + ",'"
                        + req.body.contact_email + "');";

    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
        client.query(query_string, function(err, result) {
            done();
            if (err){ 
                res.send(query_string+" : "+err+" : "+result);
            }else{ 
                res.send(url_extension);
            }
        });
    });
});

//++++++++++++++++++++++++++
//       DASHBOARD
//++++++++++++++++++++++++++

app.get('/dashboard', function(req, res) {
    
    var query_string;
    
    if(req.param("guid")!=null){

        query_string = "SELECT * FROM records_table WHERE guid='"+req.param("guid")+"';";

    }else if(req.param("query")!=null && req.param("query")!=""){

        query_string = "SELECT * FROM records_table WHERE workorder="+req.param("query")+";";

    }else if(req.param("resolve")!=null){

        query_string = "UPDATE records_table SET resolved=1 WHERE guid='"+req.param("resolve")+"'; SELECT * FROM records_table WHERE resolved=0;";

    }else if(req.param("unresolve")!=null){

        query_string = "UPDATE records_table SET resolved=0 WHERE guid='"+req.param("unresolve")+"'; SELECT * FROM records_table WHERE resolved=0;";

    }else{

        query_string = "SELECT * FROM records_table WHERE resolved=0;";

    }

    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
        client.query(query_string, function(err, result) {
            done();
            if (err){ 
                console.error(err); res.send("Error " + err); 
            }else{
                for (var i in result.rows) {
                    result.rows[i].sent_time = moment(result.rows[i].sent_time).fromNow();
                    result.rows[i].read_time = moment(result.rows[i].read_time).fromNow();
                    result.rows[i].response_time = moment(result.rows[i].response_time).fromNow();
                    result.rows[i].delivery_date = moment(result.rows[i].delivery_date).format('MMM Do YYYY');
                }
                res.render('dashboard', {records:result.rows});
            }
        });
    });
});

//++++++++++++++++++++++++++
//      RESPONSE PAGE
//++++++++++++++++++++++++++

app.get('/response', function(req, res){
    
    var currentdate = new Date(); 
    var datetime =  currentdate.getHours() + ":"  
                  + currentdate.getMinutes() + ":" 
                  + currentdate.getSeconds() +" "
                  + (currentdate.getMonth()+1)  + "/" 
                  + currentdate.getDate() + "/"
                  + currentdate.getFullYear();

    var filename = (parseInt(req.param("response")) == 1) ? 'email-template/confirm-notification-template.html':'email-template/other-notification-template.html';
    var html = '';

    fs.readFile(filename, "utf8", function(err, data) {
        if (err) throw err;

        var transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'dynamicconnections8@gmail.com',
                pass: '#Password'
            }
        });

        pg.connect(process.env.DATABASE_URL, function(err, client, done) {
            client.query("SELECT * FROM records_table WHERE guid='"+req.param("guid")+"';", function(err, result) {
                done();
                if (err){ 
                    console.log("Error " + err); 
                }else{
                    var order = result.rows[0];

                    if(order.response==0){
                        var mailOptions = {
                            from: 'Green Team Notification System <solutions@dynamicconnections.com>',
                            to: to,
                            subject: 'WO# '+order.workorder+'-'+order.load_number+'  - Consignee Confirmation',
                            text: 'NO DATA',
                            html: data.replace("[[CONTACT]]", order.contact_name).replace("[[WORK_ORDER]]", order.workorder).replace("[[CONSIGNEE]]", order.consignee).replace("[[LOAD_ITEM]]", order.load_contents).replace("[[DELIVERY_DATE]]", order.delivery_date).replace("[[CARRIER]]", order.shipper).replace("[[DROPOFF]]", order.dropoff).replace("[[DETAILS_LINK]]", "https://confirmation-module.herokuapp.com/dashboard?guid="+req.param("guid"))
                        };

                        transporter.sendMail(mailOptions, function(error, info){
                            if(error){
                                console.log('Error with ' + filename + " at " + req.param("response") + error);
                            }else{
                                console.log('Message sent');
                            }
                        });

                        if(order.response_type==0){
                            pg.connect(process.env.DATABASE_URL, function(err, client, done) {  
                                client.query("UPDATE records_table SET response="+req.param("response")+", response_time = '"+datetime+"' WHERE guid='"+req.param('guid')+"';", function(err, result) {
                                    done();
                                    if (err){ 
                                        res.send("Error " + err); 
                                    }else{ 
                                        if(req.param("response") == -1){
                                            res.render('response', {guid:req.param('guid')});
                                        }else{
                                            res.render('complete', {});
                                        }
                                    }
                                });
                            });
                        }else{
                            res.render('alreadydone', {});
                        }
                    }else{
                      res.render("alreadydone", {});
                    }
                }
            });
        });
    });
});

//++++++++++++++++++++++++++
//      REFINE PAGE
//++++++++++++++++++++++++++

app.get('/refine', function(req, res){

    var filename = 'email-template/specific-response-template.html';
    var html = '';

    fs.readFile(filename, "utf8", function(err, data) {
        if (err) throw err;

        var transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'dynamicconnections8@gmail.com',
                pass: 'Password'
            }
        });

        pg.connect(process.env.DATABASE_URL, function(err, client, done) {
            client.query("SELECT * FROM records_table WHERE guid='"+req.param("guid")+"';", function(err, result) {
                done();

                if (err){ 
                    console.log("Error " + err); 
                }else{ 
                    var order = result.rows[0];

                    if(order.response_type==0){
                        var problem = "none";
                        switch(parseInt(req.param("response_type"))){
                            case 1:
                                res.render('product', {guid:req.param("guid"), response_type:req.param("response_type")}); 
                                problem = 'Product / Damages';
                                break;
                            case 2:
                                res.render('late', {guid:req.param("guid"), response_type:req.param("response_type")}); 
                                problem = 'Late';
                                break;
                            case 3:
                                res.render('experience', {guid:req.param("guid"), response_type:req.param("response_type")}); 
                                problem = 'Experience';
                                break;
                            case 4:
                                res.render('other', {guid:req.param("guid"), response_type:req.param("response_type")}); 
                                problem = 'Other';
                                break;
                            default:
                                res.render('other', {guid:req.param("guid"), response_type:req.param("response_type")}); 
                        }

                        var mailOptions = {
                            from: 'Green Team Notification System <solutions@dynamicconnections.com>',
                            to: to, 
                            subject: 'WO# '+order.workorder+' - Consignee Confirmation', 
                            text: 'NO DATA', 
                            html: data.replace("[[PROBLEM]]", problem).replace("[[CONTACT]]", order.contact_name).replace("[[WORK_ORDER]]", order.workorder).replace("[[CONSIGNEE]]", order.consignee).replace("[[LOAD_ITEM]]", order.load_contents).replace("[[DELIVERY_DATE]]", order.delivery_date).replace("[[CARRIER]]", order.shipper).replace("[[DROPOFF]]", order.dropoff).replace("[[DETAILS_LINK]]", "https://confirmation-module.herokuapp.com/dashboard?guid="+req.param("guid"))
                        };

                        transporter.sendMail(mailOptions, function(error, info){
                            if(error){
                                console.log('Error with ' + filename + " at " + req.param("response") + error);
                            }else{
                                console.log('Message sent');
                            }
                        });
                    }else{
                        res.render("alreadydone", {});
                    }
                }
            });
        });
    });
});

//++++++++++++++++++++++++++
//      SUBMIT PAGE
//++++++++++++++++++++++++++

app.post('/submit', urlParser, function(req, res){

    var filename = 'email-template/response-notes-template.html';
    var html = '';

    fs.readFile(filename, "utf8", function(err, data) {
        if (err) throw err;

        var transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'dynamicconnections8@gmail.com',
                pass: 'Password'
            }
        });

        pg.connect(process.env.DATABASE_URL, function(err, client, done) {
            client.query("SELECT * FROM records_table WHERE guid='"+req.param("guid")+"';", function(err, result) {
                done();
                if (err){ 
                    console.log("Error " + err); 
                }else{ 
                    var order = result.rows[0];
                          
                    if(order.response_type==0){
                        var mailOptions = {
                            from: 'Green Team Notification System <solutions@dynamicconnections.com>',
                            to: to,
                            subject: 'WO# '+order.workorder+' - Consignee Confirmation',
                            text: 'NO DATA',
                            html: data.replace("[[RESPONSENOTES]]", req.body.response_notes).replace("[[CONTACT]]", order.contact_name).replace("[[WORK_ORDER]]", order.workorder).replace("[[CONSIGNEE]]", order.consignee).replace("[[LOAD_ITEM]]", order.load_contents).replace("[[DELIVERY_DATE]]", order.delivery_date).replace("[[CARRIER]]", order.shipper).replace("[[DROPOFF]]", order.dropoff).replace("[[DETAILS_LINK]]", "https://confirmation-module.herokuapp.com/dashboard?guid="+req.param("guid"))
                        };

                        transporter.sendMail(mailOptions, function(error, info){
                            if(error){
                                console.log('Error with ' + filename + " at " + req.param("response") + error);
                            }else{
                                console.log('Message sent');
                            }
                        });
                    }else{
                        res.render("alreadydone", {});
                    }
                }
            });
        });
    });

    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
        client.query("UPDATE records_table SET response_type="+req.param("response_type")+", response_notes='"+req.body.response_notes+"' WHERE guid='"+req.param('guid')+"';", function(err, result) {
            done();
            if (err){ 
                  res.send("Error " + err); 
            }else{ 
              res.render('complete', {});
            }
        });
    });
});

//++++++++++++++++++++++++++
//      PING PAGE
//++++++++++++++++++++++++++

app.get('/ping', function(req, res) {
    
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log(ip);

    var currentdate = new Date(); 
    var datetime =  currentdate.getHours() + ":"  
                  + currentdate.getMinutes() + ":" 
                  + currentdate.getSeconds() +" "
                  + (currentdate.getMonth()+1)  + "/" 
                  + currentdate.getDate() + "/"
                  + currentdate.getFullYear();

    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
        client.query("SELECT * FROM records_table WHERE guid='"+req.param("guid")+"';", function(err, result) {
            done();
            if (err){ 
                console.log("Error " + err); 
            }else{
              var order = result.rows[0];

              var query_string;
                if(order!=null){
                    if(order.loaded_from == "None"){
                        query_string = "UPDATE records_table SET loaded_from='"+ip+"' WHERE guid='"+req.param("guid")+"';";
                    }else if(order.loaded_from == ip){
                        query_string = "UPDATE records_table SET loaded_from='"+ip+"' WHERE guid='"+req.param("guid")+"';";
                    }else{
                        query_string = "UPDATE records_table SET read=1 , read_time='"+datetime+"' WHERE guid='"+req.param("guid")+"';";
                    }
                }else{
                    query_string = "UPDATE records_table SET loaded_from='"+ip+"' WHERE guid='"+req.param("guid")+"';";
                }

                pg.connect(process.env.DATABASE_URL, function(err, client, done) {
                    client.query(query_string, function(err, result) {
                        done();
                        if (err){ 
                            console.log("Error " + err); 
                        }else{
                            console.log(query_string);
                        }
                    });
                });
            }
        });
    });

    var buf = new Buffer([
      0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 
      0x80, 0x00, 0x00, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x2c, 
      0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 
      0x02, 0x44, 0x01, 0x00, 0x3b]);

    console.log("buffer sending");

    res.send(buf, { 'Content-Type': 'image/gif' }, 200);
});

//++++++++++++++++++++++++++
//        DOWNLOAD
//++++++++++++++++++++++++++

app.get('/download', function(req, res) {
    var file = 'DynamicConnectionsClaimsForm.pdf';
    res.download(file);
});

//++++++++++++++++++++++++++
//          404
//++++++++++++++++++++++++++

app.get('*', function(req, res) {
    res.render('404', {});
});

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});
