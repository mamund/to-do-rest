/* to-do crud example */

var http = require('http');
var fs = require('fs');
var querystring = require('querystring');

var g = {};
g.host = '0.0.0.0';
g.port = (process.env.PORT ? process.env.PORT : 80);

/* local data */
g.list = [];
g.list[0] = {id:0,text:'this is item 0'};
g.list[1] = {id:1,text:'this is item 1'};
g.list[2] = {id:2,text:'this is item 2'};
g.list[3] = {id:3,text:'this is item 3'};

function handler(req, res) {

  var m = {};
  m.item = {};
  m.homeUrl = '/';
  m.listUrl = '/to-do/';
  m.searchUrl = '/to-do/search';
  m.completeUrl = '/to-do/complete/';
  m.errorMessage = '<h1>{@status} - {@msg}</h1>';
  m.textHtml = {'content-type':'text/html'};
  m.appJson  = {'content-type':'application/json'};

  main();

  /* process requests */
  function main() {
    var url;
    
    if(req.url.indexOf(m.searchUrl)!==-1) {
      url = m.searchUrl;
      m.search = req.url.substring(0,m.searchUrl.length,255);
    }
    else {
      url = req.url;
    }
    
    switch(url) {
      case m.homeUrl:
        switch(req.method) {
          case 'GET':
            showHtml();
            break;
          default:
            showError(405, 'Method not allowed');
            break;
        }
        break;
      case m.listUrl:
        switch(req.method) {
          case 'GET':
            showList();
            break;
          case 'POST':
            addToList();
            break;
          default:
            showError(405, 'Method not allowed');
            break;
        }
        break;
      case m.searchUrl:
        switch(req.method) {
          case 'GET':
            searchList();
            break;
          default:
            showError(405, 'Method not allowed');
            break;
        }
        break;
      case m.completeUrl:
        switch(req.method) {
          case 'POST':
            completeItem();
            break;
          default:
            showError(405, 'Method not allowed');
            break;
        }
        break;
      default:
        showError(404, 'Page not found');
        break;
    }
  }

  /* add item to list */
  function addToList() {
    var body = '';

    req.on('data', function(chunk) {
      body += chunk.toString();
    });

    req.on('end', function() {
      m.item = querystring.parse(body);
      sendAdd();
    });
  }
  function sendAdd() {
    g.list.push({id:g.list.length, text:m.item.text});
    res.writeHead(204, "No content");
    res.end();
  }

  /* complete single item */
  function completeItem() {
    var body = '';

    req.on('data', function(chunk) {
      body += chunk.toString();
    });

    req.on('end', function() {
      m.item = querystring.parse(body);
      sendComplete();
    });
  }
  function sendComplete() {
    g.list.splice(m.item.id,1);
    res.writeHead(204, "No content");
    res.end();
  }

  /* show html page */
  function showHtml() {
    fs.readFile('index.html', 'ascii', sendHtml);
  }
  function sendHtml(err, data) {
    if (err) {
      showError(500, err.message);
    }
    else {
      res.writeHead(200, "OK", {'content-type' : 'text/html'});
      res.end(data);
    }
  }

  /* search list */
  function searchList() {
    var search, i, x;
    
    search = [];
    for(i=0,x=g.list.length;i<x;i++) {
      if(g.list[i].text.indexOf(m.search)!==-1) {
        search.push(g.list[i]);
      }
    }
    res.writeHead(200, 'OK', m.appJson);
    res.end(JSON.stringify(search));    
  }
  
  /* show list of items */
  function showList() {
    res.writeHead(200, 'OK', m.appJson);
    res.end(JSON.stringify(g.list));
  }

  /* show error page */
  function showError(status, msg) {
    res.writeHead(status, msg, m.textHtml);
    res.end(m.errorMessage.replace('{@status}', status).replace('{@msg}', msg));
  }
}

// listen for requests
http.createServer(handler).listen(g.port, g.host);