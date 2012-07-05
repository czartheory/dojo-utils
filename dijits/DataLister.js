/*
 * Copyright 2011 Czar Theory, LLC
 * All rights reserved.
 */
dojo.provide('czarTheory.dijits.DataLister');

dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('dojo.NodeList-traverse');
dojo.require('czarTheory.store.JsonRest');

dojo.declare('czarTheory.dijits.DataLister',[dijit._Widget, dijit._Templated],{

	target: '', // the url of the data store
	objectStore: null,
	itemConstructor: null,
	dataItems: null,
	idProperty: 'id',
	storeChildNodeType: 'li',

	templateString: dojo.cache('czarTheory.dijits', 'DataLister.html'),
	_activeItem: null,

	postCreate: function() {
		if(this.objectStore == null){
			dojo.require('czarTheory.store.JsonRest');
			this.objectStore = new czarTheory.store.JsonRest({target: this.target});
		}

		this.dataItems = {};
		this.inherited(arguments);
	},

	startup:function(){
		this.inherited(arguments);

		var _this = this;
		dojo.when(this.objectStore.query(), function(results){
			for (var i = 0 ; i < results.length; ++i){
				_this._addRecord.call(_this, results[i]);
			}
		},function(error){
			console.log('error retreiving results back from server: ',error);
		});

		dojo.connect(this.storeContentsNode, 'onclick', this, function (evt) {
			var target = evt.target;
			var traversable = dojo.query(target);
			var node = traversable.closest(this.storeChildNodeType)[0];

			if(node == null) {
				return;
			}

			var widget = dijit.byNode(node);
			if(widget == null) {
				return;
			}

			this._onItemClick(widget, traversable);
		});
	},

	reload: function(callback){
		var _this = this;

		dojo.forEach(this.dataItems, function(w){w.destroyRecursive();});
		this.dataItems = {};
		dojo.when(this.objectStore.query(), function (results) {
			_this.numItems = results.length;
			for (var i = 0; i < results.length; ++i){
				_this._addRecord.call(_this, results[i]);
			}

			callback(results.length);
		},function(error){
			console.log('error retreiving results back from server: ',error);
		});

	},

	_onItemClick: function(widget){
		this._activateItem(widget);
	},

	_addRecord: function (data) {
		if (this.dataItems.hasOwnProperty(data.id)) {
			console.warn('You\'re overwritting id #' + data.id);
			this._removeRecord(data);
		}

		var item = this.itemConstructor({properties:data, animateOnCreate:false, idProperty:this.idProperty});
		this.dataItems[data.id] = item;
		item.placeAt(this.storeContentsNode);
	},

	_removeRecord: function (data) {
		this.dataItems[data.id].destroyRecursive();
		delete this.dataItems[data.id];
	},

	_activateItem: function(widget){
		if (null != this._activeItem) {
			if (widget === this._activeItem) return;
			this._activeItem.deactivate();
		}

		this._activeItem = widget;
		if (widget != null) widget.activate();
	}
});
