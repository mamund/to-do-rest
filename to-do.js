/* to-do.js */

window.onload = function() {
  var pg;
  pg = thisPage();
  pg.init();
};

var thisPage = function() {

  var g = {};
  g.msg = {};
  g.listUrl = '/to-do/';

  function init() {
    refreshList(g.listUrl);
  }

  function refreshList(href) {
    makeRequest(href,'list');
  }

  function searchList(href) {
    var text;

    text = prompt('Enter search:');
    if(text) {
      makeRequest(href.replace('{@text}',encodeURIComponent(text)),'search');
    }
  }

  function addToList(href) {
    var text;

    text = prompt('Enter text:');
    if(text) {
      makeRequest(href,'add','text='+encodeURIComponent(text));
    }
  }

  function completeItem() {
    makeRequest(this.href, 'complete', 'id='+encodeURIComponent(this.id));
  }

  function showList() {
    var elm, li, i, x;

    // fill in the list
    elm = document.getElementById('list-data');
    if(elm) {
      elm.innerHTML = '';
      for(i=0,x=g.msg.collection.length;i<x;i++) {
        li = document.createElement('li');
        li.id = g.msg.collection[i].id;
        li.href = g.msg.collection[i].link.href;
        li.onclick = completeItem;
        li.title = 'click to delete';
        li.appendChild(document.createTextNode(g.msg.collection[i].text));
        elm.appendChild(li);
      }
    }

    hideButtons();
    showButtons();
  }

  function hideButtons() {
    var coll, i, x;

    coll = document.getElementsByClassName('button');
    for(i=0,x=coll.length;i<x;i++) {
      coll[i].style.display='none';
    }
  }

  function showButtons() {
    var i,x;

    // see if we should show buttons
    for(i=0,x=g.msg.links.length;i<x;i++) {
      switch(g.msg.links[i].rel) {
        case 'search':
        case 'add':
        case 'list':
          initButton(g.msg.links[i]);
          break;
      }
    }
  }

  function initButton(link) {
    var elm;

    elm = document.getElementById(link.rel);
    if(elm) {
      elm.href = link.href;
      elm.style.display = 'inline';
      elm.onclick = clickButton;
    }
  }

  function clickButton() {

    switch(this.id) {
      case 'add':
        addToList(this.href);
        break;
      case 'search':
        searchList(this.href);
        break;
      case 'list':
        refreshList(this.href);
        break;
    }
  }

  function makeRequest(href, context, body) {
    var ajax;

    ajax=new XMLHttpRequest();
    if(ajax) {
      ajax.onreadystatechange = function(){processResponse(ajax, context);};
      if(body) {
        ajax.open('post',href,false);
        ajax.send(body);
      }
      else {
        ajax.open('get',href,false);
        ajax.send(null);
      }
    }
  }

  function processResponse(ajax, context) {

    if(ajax.readyState==4 || ajax.readyState==='complete') {
      if(ajax.status===200 || ajax.status===204) {
        switch(context) {
          case 'list':
          case 'search':
            g.msg = JSON.parse(ajax.responseText);
            showList();
            break;
          case 'add':
          case 'complete':
            makeRequest(g.listUrl, 'list');
            break;
          default:
            alert('unknown context:'+context);
            break;
        }
      }
      else {
        alert(ajax.status+'\n'+ajax.statusText);
      }
    }
  }

  var that = {};
  that.init = init;
  return that;
};