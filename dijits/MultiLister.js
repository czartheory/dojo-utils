/*
 * Copyright 2011 Czar Theory, LLC
 * All rights reserved.
 */
dojo.provide("czarTheory.dijits.MultiLister");

dojo.require('czarTheory.dijits.DataLister');
dojo.require('czarTheory.dijits.ModalAjaxForm');
dojo.require('dojo.NodeList-traverse');

dojo.declare("czarTheory.dijits.MultiLister",[
	czarTheory.dijits.DataLister,
	czarTheory.dijits.ModalAjaxForm
], {

	buttonCreateLabel: "Create",
	dialogCreateLabel: "Create New",
	buttonUpdateLabel: "Save",
	dialogUpdateLabel: "Update Item",
	deleteConfirmation: "Are you sure?",

	canCreate: true,
	canUpdate: true,
	canDelete: true,

	checkEachUpdate: false,
	checkEachDelete: false,

	buttonNode: null, //Create Button Node
	dialogNode: null, //Form dialog node
	_actionButton: null,

	_confirmDeleteDialog: null,
	_deleteButton: null,
	_cancelDeleteButton: null,

	_form: null,
	_errorTooltip: null,
	_currentItem: null,
	_lastDefferred: null,

	templateString: dojo.cache('czarTheory.dijits', 'MultiLister.html'),

	widgetsInTemplate: true,

	postCreate:function(){
		this.inherited(arguments);

		if(null != this.deleteConfirmation) {
			this._confirmDeleteDialog = new dijit.Dialog({
				title: 'Delete Confirmation',
				content: this.deleteConfirmation + '<br/>',
				onHide: dojo.hitch(this, this._cancelDelete),
				draggable: this.draggable
			});

			this._deleteButton = new dijit.form.Button({
				label:"Yes",
				onClick: dojo.hitch(this, this._deleteCurrent)
			}).placeAt(this._confirmDeleteDialog.containerNode);

			dojo.create('span',{innerHTML:'&nbsp;&nbsp;'}, this._confirmDeleteDialog.containerNode);
			this._cancelDeleteButton = new dijit.form.Button({
				label: "Cancel",
				baseClass: "gray dijitButton",
				onClick: dojo.hitch(this, function(){this._confirmDeleteDialog.hide();})
			}).placeAt(this._confirmDeleteDialog.containerNode);
		}
	},

	startup:function(){
		this.inherited(arguments);

		var foundWidgets = dijit.findWidgets(this.dialogNode.containerNode);
		var i;
		for (i = 0; i<foundWidgets.length; i++) {
			if(foundWidgets[i].declaredClass == "dijit.form.Form"){
				this._form = foundWidgets[i];
				break;
			}
		}
		if(!this._form) throw new Error('No dijit.form.form widget found inside widget: '+ this.id);

		var formNode = this._form.domNode;
		dojo.removeClass(formNode,'dijitHidden');

		if(this.target == null) this.target = this._form.action;

		var formElements = this._form.getChildren();
		for (i = formElements.length-1; i>=0; i--){
			if(formElements[i].type == "submit") {
				this._actionButton = formElements[i];
				break;
			}
		}

		if(this._actionButton == null) {
			console.error("No submit button found in form: " + this.widgetId);
		} else {
			this._actionButton.set("disabled",true);
		}

		this._form.watch("state",dojo.hitch(this,function(watch,oldState,newState){
			var disabled = (newState == "") ? false : true;
			this._actionButton.set("disabled",disabled);
			if(!disabled) this._actionButton.set("iconClass","");
		}));

		dojo.connect(this._form,'onSubmit', this, this._onSubmit);
		dojo.connect(this.dialogNode, 'onHide', this, this._cancelForm);
		if(this.canCreate){
			dojo.connect(this.buttonNode, "onClick", this, this._prepFormForCreation);
		} else {
			dojo.addClass(this.buttonNode.domNode, "dijitHidden");
		}
	},

	_onItemClick: function(widget, traversable) {
		var link = traversable.closest('a')[0];
		if(null != link) {
			var type = dojo.attr(link, 'data-dojo-attach-point');
			if(type == 'deleteAnchor'){
				dojo.stopEvent(evt);
				this._currentItem = widget;
				if(this._confirmDeleteDialog) {
					this._confirmDeleteDialog.show();
				} else {
					this._deleteCurrent();
				}
			} else if(type == 'updateAnchor'){
				dojo.stopEvent(evt);
				this._currentItem = widget;
				this._prepFormForUpdate();
			} else {
				this._activateItem(widget);
			}
		} else {
			this._activateItem(widget);
		}
	},

	_onSubmit: function(evt){
		dojo.stopEvent(evt);

		if(this._actionButton.get("disabled")) return;

		this._actionButton.set("disabled",true);
		this._actionButton.set("iconClass","dijitIconWaiting");

		if(this._errorTooltip != null){
			this._errorTooltip.close();
			this._errorTooltip.removeTarget(this._actionButton.domNode);
		}

		if(null == this.target) {
			this.onError("No Target defined for this Widget");
			return;
		}

		if(this._form.get("state") == "") {
			var data = this._form.get("value");
			if(this._currentAction == "create") {this._createNew(data);}
			else if(this._currentAction == "update") {this._updateCurrent(data)}
		}
	},

	_prepFormForCreation: function(){
		this._currentAction = "create";
		this._form.reset();
		this.dialogNode.set("title",this.dialogCreateLabel);
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
			}
		}
		this.dialogNode.show();
	},

	_getCurrentData: function(){
		return this._currentItem.get("value");
	},

	_prepFormForUpdate: function(){
		this._currentAction = "update";
		var data = this._getCurrentData();
		this._form.reset();
		this._form.set("value",data);
		this.dialogNode.set("title",this.dialogUpdateLabel);
		this._actionButton.set("label",this.buttonUpdateLabel);
		var items = this._form.getDescendants();
		var i;
		for(i=0; i<items.length; i++){
			var item = items[i];
			var node = item.domNode;
			var placeholder = dojo.query(node).siblings('[data-placeholder-for$='+ item.id + ']')[0];
			if(placeholder != null) {
				dojo.removeClass(placeholder, 'dijitHidden');
				var value = data[item.id];
				if(typeof value === 'object'){value = value.label;}
				placeholder.innerHTML = value;
				dojo.addClass(node, 'dijitHidden');
			}
		}
		this.dialogNode.show();
	},

	_dismissFormDialog: function(){
		this._actionButton.set("disabled",false);
		this._actionButton.set("iconClass","");
		this.dialogNode.hide();
	},

	_createNew: function(data){
		dojo.when(
			this.objectStore.add(data),
			dojo.hitch(this,"_newCreated"),
			dojo.hitch(this,"_formRequestError")
		);
	},

	_newCreated: function(data){
		this._dismissFormDialog();
		var item = this.itemConstructor({properties:data, idProperty:this.idProperty});
		item.placeAt(this.storeContentsNode);
		this._activateItem(item);
	},

	_updateCurrent: function(data){
		data[this.idProperty] = this._currentItem.getId();
		dojo.when(
			this.objectStore.put(data),
			dojo.hitch(this,"_currentUpdated"),
			dojo.hitch(this,"_formRequestError")
		);
	},

	_currentUpdated: function(data){
		this._dismissFormDialog();
		this._currentItem.set("value",data);
		this._activateItem(this._currentItem);
		this._currentItem = null;
	},

	_deleteCurrent: function(){
		if(this._deleteButton.get("disabled")) return;

		this._deleteButton.set("disabled",true);
		this._deleteButton.set("iconClass","dijitIconWaiting");

		if(this._errorTooltip != null){
			this._errorTooltip.close();
			this._errorTooltip.removeTarget(this._deleteButton.domNode);
		}

		var _this = this;
		dojo.when(
			this.objectStore.remove(_this._currentItem.getId()),
			dojo.hitch(this,"_currentDeleted"),
			dojo.hitch(this,"_deleteRequestError")
		);
	},

	_currentDeleted: function(){
		if(this._confirmDeleteDialog != null) {this._confirmDeleteDialog.hide();}
		this._deleteButton.set("disabled",false);
		this._deleteButton.set('iconClass',"");
		var recent = this._currentItem;
		this._currentItem = null;
		this._activateItem(null);
		recent.destroy();
	},

	_cancelDelete: function(){
		this._onCancel(this._deleteButton);
	},

	_cancelForm: function(evt){
		this._onCancel(this._actionButton);
	},

	_onCancel: function(button){
		if(null !== this._lastDefferred){this._lastDefferred.cancel();}
		if(null !== this._errorTooltip){
			this._errorTooltip.close();
			this._errorTooltip.removeTarget(button);
			button.set("iconClass","");
		}
	},

	_initErrorTooltip: function(){
		if(null === this._errorTooltip){
			dojo.require("dijit.Tooltip");
			this._errorTooltip = new dijit.Tooltip ({
				label: 'An Error has Occured.<br/>We\'re still working out kinks.',
				showDelay: 100
			});
		}
	},

	_deleteRequestError:function(error){
		console.error("An error occured:", error);
		this._deleteButton.set("disabled", false);
		this._deleteButton.set("iconClass", "dijitIconError");
		this._initErrorTooltip();
		this._errorTooltip.addTarget(this._deleteButton.domNode);
		this._errorTooltip.open(this._deleteButton.domNode);
	},

	_formRequestError: function(error){
		var data = error.response;
		if(data != null) error = data;

		if(error.invalid != null){
			this._formInvalid(error.invalid);
			return;
		}

		console.error("An error occured:", error);
		this._actionButton.set("disabled", false);
		this._actionButton.set("iconClass", "dijitIconError");
		this._initErrorTooltip();
		this._errorTooltip.addTarget(this._actionButton.domNode);
		this._errorTooltip.open(this._actionButton.domNode);
	},

	_formInvalid: function(invalid){
		console.error("Form is invalid:", invalid);
		this._actionButton.set("iconClass","dijitIconError");

		var i;
		var formElements = this._form.getDescendants();
		for(i=0;i<formElements.length;i++){
			var element = formElements[i];
			var name = element.name;
			if(invalid[name]){
				var messages = "";
				var property;
				for(property in invalid[name]) {
					messages+= invalid[name][property];
				}
				messages = dojo.trim(messages);
				if(messages.length > 0){
					if(element.validate) {dojo.hitch(this,this._monkeySwapValidator, element, messages)();}
					else {dojo.hitch(this, this._monkeyAddValidator, element, messages)();}
				}
			}
		}
		this._form.validate();
	},

	_monkeySwapValidator: function(item, message){
		//	summary:
		//		This is a SHORTCUT monkey-patch, to allow for server-side validation.
		//		We must update it by subclassing form elements, but to do that and
		//		Have it work well with Zend_Dojo, we'll need to add some functionality
		//		to Zend Dojo.

		console.warn("Using a monkey-patch and swapping validators");
		var originalValue = item.get("value");

		item.originalInvalid = item.invalidMessage;
		item.invalidMessage = message;

		item.originalValidator = item.validator;
		item.validator = function(isFocused){
			var current = item.get("value");
			if(current != originalValue) {
				item.validator = item.originalValidator;
				item.invalidMessage = item.originalInvalid;

				delete item.originalValidator;
				delete item.originalInvalid;
				return true;
			}
			else return false;
		}
	},

	_monkeyAddValidator: function(item, message){
		//	summary:
		//		This is a SHORTCUT monkey-patch, to allow for server-side validation.
		//		We must update it by subclassing form elements, but to do that and
		//		Have it work well with Zend_Dojo, we'll need to add some functionality
		//		to Zend_Dojo.

		console.warn("Using a monkey-patch to add a validator");

		var onBlur;
		var onChange;
		var onFocus;
		var originalValue = item.get("value");
		var _this = this;

		item.validate = function(){
			var current = item.get("value");
			if(current != originalValue) {
				item.set("state","");
				dijit.hideTooltip(item.domNode);
				dojo.disconnect(onBlur);
				dojo.disconnect(onChange);
				dojo.disconnect(onFocus);
				delete item.validate;
				return true;
			} else {
				item.set("state","Error");
				dijit.hideTooltip(item.domNode);
				if(item._focused) {dijit.showTooltip(message,item.domNode);}
				return false;
			}
		}
		onBlur = dojo.connect(item, "onBlur", item, function(){dijit.hideTooltip(item.domNode);});
		onChange = dojo.connect(item,"onKeyUp",item, function(){item.validate();});
		onFocus = dojo.connect(item,"onFocus",item,function(){item.validate();});

		this._form._childWatches.push(item.watch("state",function(attr,oldVal,newVal){
			_this._form.set("state",_this._form._getState());
		}));
	}

});
