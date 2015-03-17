var TaskApp = (function (window, document, undefined) {
  'use strict';
  /*global window: false */
  /*global jQuery:false */
  /*global document:false */
  /*global console:false */


  var config, actionTable, templates, wrapper, _history;

  // App Defaults
  config = {
    selector: '.task-app'
  };

  actionTable = {
    listItem : {
      createInner : 'remove'
    },
    list : {
      create : 'remove'
    }
  };
  // private functions

  // Quick and simple cross-browser event handler - to compensate for IE's attachEvent handler
  function _addEvent(obj, evt, fn, capture) {
    if ( window.attachEvent ) {
      obj.attachEvent("on" + evt, fn);
    }
    else {
      if ( !capture ) capture = false; // capture
      obj.addEventListener(evt, fn, capture);
    }
  }

  function _closest (el, cls) {
    while ((el = el.parentElement) && !el.classList.contains(cls));
    return el;
  }

  function _getOppositeProp(obj, tgtProp){
    var prop;
    for (prop in obj) {
      if (prop === tgtProp){
        return obj[prop];
      } else if (obj[prop] === tgtProp) {
        return prop;
      }
    }
  }

  _history = [];

  // public functions

  function init(options) {
    // copy properties of `options` to `config`. Will overwrite existing ones.
    var prop;

    for (prop in options) {
      if (options.hasOwnProperty(prop)) {
        config[prop] = options[prop];
      }
    }

    list.create('My First List');

    wrapper = document.querySelectorAll(config.selector);

    _addEvent(wrapper[0], 'keyup', function(e) {
      var target = e ? e.target : window.event.srcElement;
      if (e.keyCode === 13 && target.tagName.toLowerCase() === 'input') {
        // enter on input
        listItem.create(e);
      }
    });
  }


  var list = {
    create: function  (title) {
      wrapper = document.querySelectorAll(config.selector);
      var holder, header, titleNode, btnRemove;

      holder = document.createElement('div');
      holder.innerHTML = templates.list;

      // Set Header Text
      header = holder.querySelector('.task-app__list-title');
      titleNode = document.createTextNode(title || 'New List');
      btnRemove = header.firstChild;

      // Insert into DOM
      header.insertBefore(titleNode, btnRemove);
      [].forEach.call(wrapper, function (elem) {
        elem.appendChild(holder.firstChild);
      });
    },

    remove: function (e) {
      var list = _closest(e.currentTarget, 'task-app__list');
      list.remove();
    }
  };

  var listItem = {
    create: function (e) {
      var list, listInner, holder, text, input, titleNode, btnRemove, target;

      target = e ? e.target : window.event.srcElement;
      list = _closest(target, 'task-app__list');

      // prepare template
      holder = document.createElement('div');
      holder.innerHTML = templates.listItem;

      // get text
      titleNode = holder.querySelector('.task-app__list-item-text');
      input = list.querySelector('.task-app__list-item-input');
      text = input.value;
      input.value = '';

      if (text) {
        titleNode.textContent = text;

        // Add to list
        listInner = list.querySelector('.task-app__list-list');
        listInner.appendChild(holder.firstChild);
      }
    },

    toggleComplete: function(e) {
      var item = _closest(e.currentTarget, 'task-app__list-item');
      if (e.currentTarget.checked) {
        item.className = item.className + ' task-app__list-item-complete';
        item.className = item.className + ' list-group-item-success';
      } else {
        item.className = item.className.replace( /(?:^|\s)task-app__list-item-complete(?!\S)/g , '' );
        item.className = item.className.replace( /(?:^|\s)list-group-item-success(?!\S)/g , '' );
      }
    },

    remove: function (e) {
      var item = _closest(e.currentTarget, 'task-app__list-item'),
          list = _closest(item, 'task-app__list'),
          holder = document.createElement('div'),
          undo = templates.itemUndo;

      holder.innerHTML = undo;
      undo = holder.childNodes[0];
      item.style.display = 'none';
      item.parentNode.insertBefore(undo, item);
      //item.remove();
      setTimeout(function() {
        undo.remove();
        if(item.style.display == 'none'){
          item.remove();
        }
      }, 2500);
    },

    undo: function (e) {
      var undo = _closest(e.currentTarget, 'task-app__list-item-undo'),
          childNodes = Array.prototype.slice.call( undo.parentElement.children),
          index = childNodes.indexOf(undo),
          item = childNodes[index + 1];

      undo.remove();
      item.style.display = 'block';
    }

  };


  // Templates
  templates = {
    listItem:
      '<li class="list-group-item  task-app__list-item">' +
        '<div class="row">' +
          '<div class="col-xs-2">' +
            '<input type="checkbox" onclick="TaskApp.listItem.toggleComplete(event);" class="task-app__list-item-toggle" />' +
          '</div>' +
          '<div class="col-xs-8 task-app__list-item-text"></div>' +
          '<div class="col-xs-2"><a href="#" class="pull-right" onclick="TaskApp.listItem.remove(event);" ><i class="fa fa-fw fa-times"></i></a></div>' +
        '</div>' +
      '</li>',

    list:
      '<div class="col-sm-4 task-app__list">' +
        '<div class="panel panel-default">' +
            '<div class="panel-heading">' +
            '<a href="#" class="pull-right task-app__btn-list-remove" onclick="TaskApp.list.remove(event);">' +
            '<i class="fa fa-fw fa-times"></i></a>' +
            '<span class="task-app__list-title"></span></div>' +
          '<ul class="list-group task-app__list-list">      ' +
          '</ul>' +
          '<div class="panel-footer">' +
            '<div class="input-group">' +
              '<input class="form-control task-app__list-item-input" placeholder="New task">' +
              '<span class="input-group-btn">' +
                '<a href="#" onclick="TaskApp.listItem.create(event);" class="btn btn-primary">Add</a>' +
              '</span>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>',

    itemUndo:
    '<li class="list-group-item task-app__list-item-undo">' +
      '<div class="row">' +
        '<div class="col-xs-12"><a href="#" class="pull-right btn btn-xs btn-info" pull-right" onclick="TaskApp.listItem.undo(event);" >Undo <i class="fa fa-fw fa-undo"></i></a></div>' +
      '</div>' +
    '</li>',

  };

  return {
    init :  init,
    list: list,
    listItem: listItem
  };
})(window, document);

