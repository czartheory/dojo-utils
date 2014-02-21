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

dojo.declare('czarTheory.dijits.DataLister', [dijit._Widget, dijit._Templated], {
    href: '', // the url of the data store
    objectStore: null,
    itemConstructor: null,
    dataItems: null,
    idProperty: 'id',
    storeChildNodeType: 'li',
    sort: null,
    animate: false,
    loadOnStart: true,
    loadBatchSize: 100,
    isLoading: false,

    templateString: dojo.cache('czarTheory.dijits', 'DataLister.html'),
    _activeItem: null,

    postCreate: function () {
        if (this.objectStore === null) {
            dojo.require('czarTheory.store.JsonRest');
            this.objectStore = new czarTheory.store.JsonRest({target: this.href});
        }

        this.dataItems = {};
        this.inherited(arguments);
    },

    startup: function () {
        this.inherited(arguments);

        dojo.connect(this.storeContentsNode, 'onclick', this, function (evt) {
            var target = evt.target,
                traversable = dojo.query(target),
                node = traversable.closest(this.storeChildNodeType)[0],
                widget;

            if (node === null) {
                return;
            }

            widget = dijit.byNode(node);
            if (widget === null) {
                return;
            }

            this._onItemClick(widget, traversable, evt);
        });

        if(this.loadOnStart) this.reload();
    },

    reload: function (callback) {
        if(this.isLoading) return;
        var _this = this,
            options = {};

        dojo.forEach(this.dataItems, function (w) {
            w.destroyRecursive();
        });

        dojo.addClass(this.storeContentsNode, "loading");
        dojo.removeClass(this.storeContentsNode, "error");

        this.dataItems = {};
        if (null !== this.sort) {
            options.sort = this.sort;
        }

        dojo.when(this.objectStore.query({}, options), function (results) {
            var i, max;
            _this.numItems = results.length;
            _this.isLoading = true;
            _this._loadRecords(results);
        }, function (error) {
            console.error('error retreiving results back from server: ', error);
            dojo.removeClass(_this.storeContentsNode, "loading");
            dojo.addClass(_this.storeContentsNode, "error");
        });
    },

    _loadRecords: function(data, i) {
        if(i == undefined) {i = 0;}
        var stop = i + this.loadBatchSize;
        if(stop > this.numItems) stop = this.numItems;

        for (var j = i; j < stop; j++) {
            this._addRecord(data[j]);
        }

        if(j < this.numItems) {
            var _this = this;
            var nextBatch = function() {
                _this._loadRecords(data, j);
            };
            setTimeout(nextBatch, 0);
        } else {
            this.isLoading = false;
            this.onDataLoad(this.numItems);
            dojo.removeClass(this.storeContentsNode, "loading");
            var callback = this._loadingCallback;
            this._loadingCallback = null;
            if(typeof callback == "function") {
                callback(this.numItems);
            }
        }
    },

    onDataLoad: function() {
        //Hook for subclasses if needed
    },

    _onItemClick: function (widget, traversable, evt) {
        this._activateItem(widget, traversable, evt);
    },

    _addRecord: function (data, doAnimate) {
        var item, result;
        if (doAnimate === 'undefined') {
            doAnimate = this.animate;
        }

        doAnimate = !!doAnimate;

        if (this.dataItems.hasOwnProperty(data[this.idProperty])) {
            console.warn('You\'re overwritting id #' + data[this.idPoroperty]);
            this._removeRecord(data);
        }

        item = this.itemConstructor({
            properties: data,
            animateOnCreate: doAnimate,
            idProperty: this.idProperty
        });
        this.dataItems[data[this.idProperty]] = item;
        if (this.sort !== null) {
            //result = this._getSortedInsertionPoint(item);
            //item.placeAt(result.node, result.placement);
            //@TODO Find out why the above code is acting wonky in firefox
            item.placeAt(this.storeContentsNode);
        } else {
            item.placeAt(this.storeContentsNode);
        }

        return item;
    },

    _removeRecord: function (data) {
        this.dataItems[data[this.idProperty]].destroyRecursive();
        delete this.dataItems[data[this.idProperty]];
    },

    _getSortedInsertionPoint: function (item) {
        var nodes = dojo.query(this.storeChildNodeType, this.storeContentsNode),
            maxNode = nodes.length,
            maxSort = this.sort.length,
            test = 0,
            node = null,
            i,
            j,
            sort,
            property;

        for (i = 0; i < maxNode; ++i) {
            node = dijit.byNode(nodes[i]);
            for (j = 0, test = 0; j < maxSort && test === 0; ++j) {
                sort = this.sort[j];
                property = sort.attribute + 'Node';
                if (sort.descending) {
                    test = czarTheory.string.stricmp(node[property].innerText, item.properties[sort.attribute]);
                } else {
                    test = czarTheory.string.stricmp(item.properties[sort.attribute], node[property].innerText);
                }
            }

            if (test < 0) {
                return {
                    'node': node.domNode,
                    'placement': 'before'
                };
            }
        }

        return node === null
            ? {'node': this.storeContentsNode, 'placement': undefined}
            : {'node': node.domNode, 'placement': 'after'};
    },

    _activateItem: function (widget, traversable) {
        if (null !== this._activeItem) {
            if (widget === this._activeItem) {
                return;
            }

            this._activeItem.deactivate();
        }

        this._activeItem = widget;
        if (widget !== null) {
            widget.activate(traversable);
        }
    }
});
