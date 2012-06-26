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
	idProperty: 'id',
	storeChildNodeType: 'li',

	templateString: dojo.cache('czarTheory.dijits', 'DataLister.html'),
	_activeItem: null,

	postCreate: function() {
		if(this.objectStore == null){
			dojo.require('czarTheory.store.JsonRest');
			this.objectStore = new czarTheory.store.JsonRest({target: this.target});
		}

		this.inherited(arguments);
	},

	startup:function(){
		this.inherited(arguments);

		var _this = this;
		dojo.when(this.objectStore.query(),function(results){
			for(var i=0;i<results.length;i++){
				var data = results[i];
				var item = _this.itemConstructor({properties:data, animateOnCreate:false, idProperty:_this.idProperty});
				item.placeAt(_this.storeContentsNode);
			}
		},function(error){
			console.log('error retreiving results back from server: ',error);
		});

		dojo.connect(this.storeContentsNode, 'onclick', this, function(evt){
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

			this.onItemClick(widget, traversible);
		});
	},

	reload: function(callback){
		var _this = this;

		var oldies = dijit.findWidgets(_this.storeContentsNode);
		console.log('oldies:',oldies);
		dojo.forEach(oldies, function(w){w.destroyRecursive();});

		dojo.when(this.objectStore.query(),function(results){
			_this.numItems = results.length;
			for(var i=0;i<results.length;i++){
				var data = results[i];
				var item = _this.itemConstructor({properties:data, animateOnCreate:false, idProperty:_this.idProperty});
				item.placeAt(_this.storeContentsNode);
			}

			callback(results.length);
		},function(error){
			console.log('error retreiving results back from server: ',error);
		});

	},

	_onItemClick: function(widget){
		this._activateItem(widget);
	},

	_activateItem: function(widget){
		if(null != this._activeItem){
			if(widget === this._activeItem) return;
			this._activeItem.deactivate();
		}
		this._activeItem = widget;
		if(widget != null) {widget.activate();}
	}
});
