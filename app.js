/* to-do rest example */

var http = require('http');
var fs = require('fs');
var querystring = require('querystring');

var g = {};
g.host = '0.0.0.0';
g.port = (process.env.PORT ? process.env.PORT : 80);

/* initial data */
g.list = [];
g.list[0] = {link:{rel:'complete',href:'/to-do/complete/'},id:0,text:'this is some item'};
g.list[1] = {link:{rel:'complete',href:'/to-do/complete/'},id:1,text:'this is another item'};
g.list[2] = {link:{rel:'complete',href:'/to-do/complete/'},id:2,text:'this is one more item'};
g.list[3] = {link:{rel:'complete',href:'/to-do/complete/'},id:3,text:'this is possibly an item'};

function handler(req, res) {

  var m = {};
  m.item = {};
  m.search = '';
  m.homeUrl = '/';
  m.listUrl = '/to-do/';
  m.scriptUrl = '/to-do.js';
  m.searchUrl = '/to-do/search';
  m.completeUrl = '/to-do/complete/';
  m.errorMessage = '<h1>{@status} - {@msg}</h1>';
  m.appJson  = {'content-type':'application/json'};
  m.textHtml = {'content-type':'text/html'};
  m.appJS = {'content-type':'application/javascript'};

  main();

  /* process requests */
  function main() {
    var url;

    // check for a search query
    if(req.url.indexOf(m.searchUrl)!==-1) {
      url = m.searchUrl;
      m.search = req.url.substring(m.searchUrl.length,255).replace('?text=','');
    }
    else {
      url = req.url;
    }

    // process request
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
      case m.scriptUrl:
        switch(req.method) {
          case 'GET':
            showScript();
            break;
          default:
            showError(405, 'Method not allowed');
            break;
        }
        break;
      case m.listUrl:
        switch(req.method) {
          case 'GET':
            sendList();
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

  /* search the list */
  function searchList() {
    var search, i, x, msg;

    search = [];
    for(i=0,x=g.list.length;i<x;i++) {
      if(g.list[i].text.indexOf(m.search)!==-1) {
        search.push(g.list[i]);
      }
    }

    msg = {};
    msg.links =[];
    msg.collection = search;

    msg.links.push({rel:'add',href:'/to-do/'});
    msg.links.push({rel:'list',href:'/to-do/'});

    if(msg.collection.length>0) {
      msg.links.push({rel:'search',href:'/to-do/search?text={@text}'});
    }

    res.writeHead(200, 'OK', m.appJson);
    res.end(JSON.stringify(msg));
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
    var item;

    item = {};
    item.link = {rel:'complete',href:'/to-do/complete/'};
    item.id = g.list.length;
    item.text = m.item.text;
    g.list.push(item);

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
    var tlist, i, x;

    //build new list
    tlist = [];
    for(i=0,x=g.list.length;i<x;i++) {
      if(g.list[i].id!=m.item.id) {
        tlist.push(g.list[i]);
      }
    }
    g.list = tlist.slice(0);

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
      res.writeHead(200, "OK",m.textHtml);
      res.end(data);
    }
  }

  /* show script file */
  function showScript() {
    fs.readFile('to-do.js', 'ascii', sendScript);
  }
  function sendScript(err, data) {
    if (err) {
      showError(500, err.message);
    }
    else {
      res.writeHead(200, "OK",m.appJS);
      res.end(data);
    }
  }

  /* show list of items */
  function sendList() {
    var msg;

    msg = {};
    msg.links =[];
    msg.collection = g.list;

    msg.links.push({rel:'add',href:'/to-do/'});

    if(msg.collection.length>0) {
      msg.links.push({rel:'list',href:'/to-do/'});
      msg.links.push({rel:'search',href:'/to-do/search?text={@text}'});
    }

    res.writeHead(200, 'OK', m.appJson);
    res.end(JSON.stringify(msg));
  }

  /* show error page */
  function showError(status, msg) {
    res.writeHead(status, msg, m.textHtml);
    res.end(m.errorMessage.replace('{@status}', status).replace('{@msg}', msg));
  }
}

// listen for requests
http.createServer(handler).listen(g.port, g.host);
