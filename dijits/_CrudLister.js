/*
 * Copyright 2011 Czar Theory, LLC
 * All rights reserved.
 */
dojo.provide("czarTheory.dijits._CrudLister");

dojo.require('czarTheory.dijits.DataLister');
dojo.require('dijit.Dialog');

dojo.declare("czarTheory.dijits._CrudLister",[
	czarTheory.dijits.DataLister,
], {

	buttonLabel: "Create New"
	,buttonCreateLabel: "Create"
	,buttonUpdateLabel: "Save"
	,deleteConfirmation: "Are you sure?"
    ,deleteConfirmPosition: NaN

	,canCreate: true
	,canUpdate: true
	,canDelete: true

	,checkEachUpdate: false
	,checkEachDelete: false

	,_confirmDeleteDialog: null
	,_deleteButton: null
	,_cancelDeleteButton: null

	,postCreate:function(){
		this.inherited(arguments);

		if(this.canDelete && null != this.deleteConfirmation) {
			this._confirmDeleteDialog = new dijit.Dialog({
				title: 'Delete Confirmation',
				content: this.deleteConfirmation + '<br/>',
				onHide: dojo.hitch(this, this._cancelDelete),
				draggable: this.draggable
			});

			this._deleteButton = new dijit.form.Button({
				label:"Yes",
				onClick: dojo.hitch(this, this._deleteActive)
			}).placeAt(this._confirmDeleteDialog.containerNode);

			dojo.create('span',{innerHTML:'&nbsp;&nbsp;'}, this._confirmDeleteDialog.containerNode);
			this._cancelDeleteButton = new dijit.form.Button({
				label: "Cancel",
				baseClass: "gray dijitButton",
				onClick: dojo.hitch(this, function(){this._confirmDeleteDialog.hide();})
			}).placeAt(this._confirmDeleteDialog.containerNode);
		}
	}

	,startup:function(){
		this.inherited(arguments);

		if(!this.canCreate){
			dojo.addClass(this.buttonNode.domNode, "dijitHidden");
		}
	}

	,_onItemClick: function(widget, traversable, evt) {
		var link = traversable.closest('a')[0];
		if(null != link) {
			var type = dojo.attr(link, 'data-dojo-attach-point');
			if(type == 'deleteAnchor'){
				dojo.stopEvent(evt);
				if(this._confirmDeleteDialog) {
					this._showDeleteConfirmation();
				} else {
					this._deleteActive();
				}
			} else if(type == 'updateAnchor'){
				dojo.stopEvent(evt);
				this._prepFormForUpdate();
			} else {
				this._activateItem(widget,traversable);
			}
		} else {
			this._activateItem(widget,traversable);
		}
	}

    ,_showDeleteConfirmation: function(){
        console.log("show delete confirmation");
        this._confirmDeleteDialog.show();
        if(!isNaN(this.deleteConfirmPosition)){
            console.log("custom position");
            dojo.style(this._confirmDeleteDialog.domNode,'top',this.deleteConfirmPosition + 'px');
        }
    }

	,_getCurrentData: function(){
		return this._activeItem.get("value");
	}

	,_addRecord: function(data){
		if(this.canDelete) {
			if(!data.hasOwnProperty('canDelete')) data.canDelete = this.canDelete;
		} else {
			data.canDelete = false;
		}

		if(this.canUpdate) {
			if(!data.hasOwnProperty('canUpdate')) data.canUpdate = this.canUpdate;
		} else {
			data.canUpdate = false;
		}

		return this.inherited(arguments);
	}

	,_submitForm: function(){
		var data = this._getFormData();
		if(this._currentAction == "create") {
			this._createNew(data);
		} else if(this._currentAction == "update") {
			this._updateActive(data)
		}
	}

    ,_getFormData: function(){
        if(typeof this._form == "object"){
            return this._form.get("value");
        } else {
            console.error("no form found in this widget");
        }
    }

	,_onCancel: function(){
		this._cancel(this._actionButton);
	}

	,_cancelDelete: function(){
		this._cancel(this._deleteButton);
	}

	,_cancel: function(button){
		if(null !== this._lastDeferred){
			this._lastDeferred.cancel();
		}

		if(null !== this._errorTooltip){
			this._errorTooltip.close();
			this._errorTooltip.removeTarget(button);
			button.set("iconClass","");
		}
	}

	,_onButtonNodeClick: function(){
		this.inherited(arguments);
		this._prepFormForCreation();
	}

	,_prepFormForCreation: function(){
		this._currentAction = "create";
		this._form.reset();
		this._actionButton.set("label",this.buttonCreateLabel);
		var items = this._form.getDescendants();
		var i;
		for(i=0; i<items.length; i++){
			var item = items[i];
			var node = item.domNode;
			var placeholder = dojo.query(node).siblings('[data-placeholder-for$='+ item.id + ']')[0];
			if(placeholder != null) {
				dojo.addClass(placeholder, 'dijitHidden');
				dojo.removeClass(node, 'dijitHidden');
				item.set("disabled", false);
			}
		}
	}

	,_createNew: function(data){
		this._lastDeferred = this.objectStore.add(data);
		dojo.when(
			this._lastDeferred,
			dojo.hitch(this, this._newCreated),
			dojo.hitch(this, this._requestError)
		);
	}

	,_newCreated: function(data){
		var item = this._addRecord(data, true);
		this._activateItem(item);
	}

	,_prepFormForUpdate: function(){
		this._currentAction = "update";
		var data = this._getCurrentData();
		var raw = this._activeItem.get("rawProperties");
		this._form.reset();
		this._form.set("value",data);
		this._actionButton.set("label",this.buttonUpdateLabel);
		var items = this._form.getDescendants();
		var i;
		for(i=0; i<items.length; i++){
			var item = items[i];
			var node = item.domNode;
			var placeholder = dojo.query(node).siblings('[data-placeholder-for$='+ item.id + ']')[0];
			if(placeholder != null) {
				dojo.removeClass(placeholder, 'dijitHidden');
				var value = raw[item.id];
				if(typeof value === 'object'){value = value.label;}
				placeholder.innerHTML = value;
				dojo.addClass(node, 'dijitHidden');
				item.set("disabled", true);
			}
		}
	}

	,_updateActive: function(data){
		this._lastDeferred = this.objectStore.put(data, {id: this._activeItem.getId()});
		dojo.when(
			this._lastDeferred,
			dojo.hitch(this, this._recordUpdated),
			dojo.hitch(this, this._requestError)
		);
	}

	,_recordUpdated: function(data){
        widget = this.dataItems[data[this.idProperty]];
        widget.set("value",data);
        if(widget == this._activeItem) {
            this._activateItem(widget);
        }
	}

	,_requestError:function(error){
		console.error("An error occured:", error);
		if(error.invalid){
			this._onInvalid(error.invalid);
		} else {
			this.onError(error);
		}
	}

	,_deleteActive: function(){
		if(this._deleteButton.get("disabled")) return;

		this._deleteButton.set("disabled",true);
		this._deleteButton.set("iconClass","dijitIconWaiting");

		if(this._errorTooltip != null){
			this._errorTooltip.close();
			this._errorTooltip.removeTarget(this._deleteButton.domNode);
		}

		this._lastDeferred = this.objectStore.remove(this._activeItem.getId());
		dojo.when(
			this._lastDeferred,
			dojo.hitch(this, this._recordDeleted),
			dojo.hitch(this, this._deleteRequestError)
		);
	}

	,_recordDeleted: function(data){
		if(this._confirmDeleteDialog != null) {this._confirmDeleteDialog.hide();}
		this._deleteButton.set("disabled",false);
		this._deleteButton.set('iconClass',"");

        widget = this.dataItems[data.id];
        delete this.dataItems[data.id];

        if(widget == this._activeItem) {
            this._activateItem(null);
        }
		widget.destroy();
	}

	,_deleteRequestError:function(error){
		console.error("An error occured:", error);
		this._deleteButton.set("disabled", false);
		this._deleteButton.set("iconClass", "dijitIconError");
		this._initErrorTooltip();
		this._errorTooltip.addTarget(this._deleteButton.domNode);
		this._errorTooltip.open(this._deleteButton.domNode);
	}

});
