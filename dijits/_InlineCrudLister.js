/*
 * Copyright 2011 Czar Theory, LLC
 * All rights reserved.
 */

dojo.provide("czarTheory.dijits._InlineCrudLister");

dojo.require("czarTheory.dijits._CrudLister");

dojo.declare("czarTheory.dijits._InlineCrudLister",[czarTheory.dijits._CrudLister],{

	startup:function(){
		this.inherited(arguments);

        if(null != this.deleteAnchor) {
            dojo.connect(this.deleteAnchor, "onclick", this, function(evt){
                dojo.stopEvent(evt);
                this._currentItem = this._activeItem;
                if(this._confirmDeleteDialog) {
                    this._confirmDeleteDialog.show();
                } else {
                    this._deleteCurrent();
                }
            });
        }
	}

	,_activateItem: function(){
		this.inherited(arguments);
        this._currentItem = this._activeItem;
        this._prepFormForUpdate();
	}

    ,onDataLoad: function(count){
        if(count > 0) {
            var first;
            for(var i in this.dataItems) {
                if(this.dataItems.hasOwnProperty(i) && typeof(i) !== 'function') {
                    first = this.dataItems[i];
                    break;
                }
            }

            this._activateItem(first);
        }
    }
});
