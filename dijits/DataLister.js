/*
 * Copyright 2011 Czar Theory, LLC
 * All rights reserved.
 */
dojo.provide('czarTheory.dijits.DataLister');

dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('dojo.NodeList-traverse');
dojo.require('czarTheory.store.JsonRest');
dojo.require('czarTheory.string');

dojo.declare('czarTheory.dijits.DataLister',[dijit._Widget, dijit._Templated],{
	href: '', // the url of the data store
	objectStore: null,
	itemConstructor: null,
	dataItems: null,
	idProperty: 'id',
	storeChildNodeType: 'li',
    sort: null,
    animate: false,

	templateString: dojo.cache('czarTheory.dijits', 'DataLister.html'),
	_activeItem: null,

	postCreate: function() {
		if(this.objectStore == null){
			dojo.require('czarTheory.store.JsonRest');
			this.objectStore = new czarTheory.store.JsonRest({target: this.href});
		}

		this.dataItems = {};
		this.inherited(arguments);
	},

	startup:function(){
		this.inherited(arguments);

		dojo.connect(this.storeContentsNode, 'onclick', this, function (evt) {
			var target = evt.target;
			var traversable = dojo.query(target);
			var node = traversable.closest(this.storeChildNodeType)[0];

			if (node == null) {
				return;
			}

			var widget = dijit.byNode(node);
			if (widget == null) {
				return;
			}

			this._onItemClick(widget, traversable, evt);
		});

        this.reload();
	},

	reload: function (callback) {
		var _this = this;

		dojo.forEach(this.dataItems, function (w) {
            w.destroyRecursive();
        });

        dojo.addClass(this.storeContentsNode, "loading");
        dojo.removeClass(this.storeContentsNode, "error");

		this.dataItems = {};
        var options = {};
        if (null != this.sort) {
            options.sort = this.sort;
        }

		dojo.when(this.objectStore.query({}, options), function (results) {
            dojo.removeClass(_this.storeContentsNode, "loading");
			_this.numItems = results.length;

			for (var i = 0; i < results.length; ++i){
				_this._addRecord(results[i]);
			}

            _this.onDataLoad(results.length);
            if(callback){callback(results.length);}

		}, function (error) {
			console.error('error retreiving results back from server: ',error);
            dojo.removeClass(_this.storeContentsNode,"loading");
            dojo.addClass(_this.storeContentsNode, "error");
		});
	},

    onDataLoad: function() {
        //Hook for subclasses if needed
    }

	_onItemClick: function (widget, traversable, evt) {
		this._activateItem(widget, traversable, evt);
	},

	_addRecord: function (data, doAnimate) {
        console.debug('in _addRecord');
		if(typeof doAnimate == 'undefined') doAnimate = this.animate;
		doAnimate = !!doAnimate;

		if (this.dataItems.hasOwnProperty(data.id)) {
			console.warn('You\'re overwritting id #' + data.id);
			this._removeRecord(data);
		}

		var item = this.itemConstructor({properties:data, animateOnCreate:doAnimate, idProperty:this.idProperty});
		this.dataItems[data.id] = item;
        if (this.sort != null) {
            var result = this._getSortedInsertionPoint(item);
            console.debug('got insertion point:', result);
            item.placeAt(result.node, result.placement);
        } else {
            item.placeAt(this.storeContentsNode);
        }

		return item;
	},

	_removeRecord: function (data) {
		this.dataItems[data.id].destroyRecursive();
		delete this.dataItems[data.id];
	},

    _getSortedInsertionPoint: function (item) {
        var nodes = dojo.query(this.storeChildNodeType, this.storeContentsNode);
        console.debug('Searching for insertion point for', item, 'among', nodes);
        var maxNode = nodes.length;
        var maxSort = this.sort.length;
        console.debug('max node', maxNode, 'max sort', maxSort);
        var test = 0;
        var node = null;
        for (var i = 0; i < maxNode; ++i) {
            node = dijit.byNode(nodes[i]);
            for (var j = 0, test = 0; j < maxSort && test == 0; ++j) {
                var sort = this.sort[j];
                var property = sort.attribute + 'Node';
                if (sort.descending) {
                    test = czarTheory.string.stricmp(node[property].innerText, item.properties[sort.attribute]);
                } else {
                    test = czarTheory.string.stricmp(item.properties[sort.attribute], node[property].innerText);
                }

                console.debug('node', i, 'test', j, '=', test);
            }

            if (test < 0) {
                return {'node': node.domNode, 'placement': 'before'};
            }
        }

        return node === null
            ? {'node': this.storeContentsNode, 'placement': undefined }
            : {'node': node.domNode, 'placement': 'after'};
    },

	_activateItem: function(widget, traversable){
		if (null != this._activeItem) {
			if (widget === this._activeItem) return;
			this._activeItem.deactivate();
		}

		this._activeItem = widget;
		if (widget != null) widget.activate(traversable);
	}
});
