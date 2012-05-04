/* 
 * Copyright 2011 Czar Theory, LLC
 * All rights reserved.
 */
dojo.provide("czarTheory.dijits.MultiLister");

dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('dijit.form.Button');
dojo.require('dijit.Dialog');
dojo.require('dojo.NodeList-traverse');
dojo.require('czarTheory.store.JsonRest');

dojo.declare("czarTheory.dijits.MultiLister",[dijit._Widget,dijit._Templated],{

	buttonCreateLabel: "Create",
	dialogCreateLabel: "Create New",
	buttonUpdateLabel: "Save",
	dialogUpdateLabel: "Update Item",
	deleteConfirmation: "Are you sure?",
	target: '',

	canCreate: true,
	canUpdate: true,
	canDelete: true,
	checkEachUpdate: false,
	checkEachDelete: false,
	draggable: false,
	objectStore: null,
	itemConstructor: null,
	idProperty: "id",

	_createButton: null,
	_formDialog: null,
	_formActionButton: null,
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
		if(this.objectStore == null){
			dojo.require('czarTheory.store.JsonRest');
			this.objectStore = new czarTheory.store.JsonRest({target: this.target});
		}
		
		this.inherited(arguments);
		if(null != this.deleteConfirmation) {
			this._confirmDeleteDialog = new dijit.Dialog({
				title: 'Delete Confirmation',
				content: this.deleteConfirmation + '<br/>',
				onHide: dojo.hitch(this, this._cancelDelete),
				draggable: false
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
		
		var foundWidgets = dijit.findWidgets(this._formDialog.containerNode);
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
				this._formActionButton = formElements[i];
				break;
			}
		}
		if(this._formActionButton == null) {
			console.log("No submit button found in form: " + this.widgetId);
		} else {
			this._formActionButton.set("disabled",true);
		}
		
		this._form.watch("state",dojo.hitch(this,function(watch,oldState,newState){
			var disabled = (newState == "") ? false : true;
			this._formActionButton.set("disabled",disabled);
			if(!disabled) this._formActionButton.set("iconClass","");
		}));
	
		dojo.connect(this._form,'onSubmit', this, this._onSubmit);
		dojo.connect(this._formDialog, 'onHide', this, this._cancelForm);
		if(this.canCreate){
			dojo.connect(this._createButton, "onClick", this, this._prepFormForCreation);
		} else {
			dojo.addClass(this._createButton.domNode, "dijitHidden");
		}
	
		var _this = this;
		dojo.when(this.objectStore.query(),function(results){
			for(var i=0;i<results.length;i++){
				var data = results[i];
				if(!_this.checkEachUpdate){data.canUpdate = _this.canUpdate;}
				if(!_this.checkEachDelete){data.canDelete = _this.canDelete;}
				
				var item = _this.itemConstructor({properties:data, animateOnCreate:false, idProperty:_this.idProperty});
				item.placeAt(_this.storeContentsNode);
			}
		},function(error){
			console.log("error retreiving results back from server: ",error);
		});
		
		dojo.connect(this.storeContentsNode, 'onclick', this, function(evt){
			var target = evt.target;
			var traversable = dojo.query(target);
			var node = traversable.closest('li')[0];
			if(node == null) {return;}
			var widget = dijit.byNode(node);
			if(widget == null) {return;}

			var link = traversable.closest('a')[0];
			if(null != link) {
				var type = dojo.attr(link, 'data-dojo-attach-point');
				if(type == 'deleteAnchor'){
					dojo.stopEvent(evt);
					this._currentItem = widget;
					if(this._confirmDeleteDialog) {this._confirmDeleteDialog.show();}
					else this._deleteCurrent();
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
		});
	},

	reload: function(){
		var _this = this;

		var oldies = dijit.findWidgets(_this.storeContentsNode);
		console.log("oldies:",oldies);
		dojo.forEach(oldies, function(w){w.destroyRecursive();});

		dojo.when(this.objectStore.query(),function(results){
			for(var i=0;i<results.length;i++){
				var data = results[i];
				if(!_this.checkEachUpdate){data.canUpdate = _this.canUpdate;}
				if(!_this.checkEachDelete){data.canDelete = _this.canDelete;}
				
				var item = _this.itemConstructor({properties:data, animateOnCreate:false, idProperty:_this.idProperty});
				item.placeAt(_this.storeContentsNode);
			}
		},function(error){
			console.log("error retreiving results back from server: ",error);
		});
		
	},

	_activeItem: null,
	_activateItem: function(widget){
		if(null != this._activeItem){
			if(widget === this._activeItem) return;
			this._activeItem.deactivate();
		}
		this._activeItem = widget;
		if(widget != null) {widget.activate();}
	},
	
	_onSubmit: function(evt){
		console.log("making Request");
		dojo.stopEvent(evt);
		
		if(this._formActionButton.get("disabled")) return;
		
		this._formActionButton.set("disabled",true);
		this._formActionButton.set("iconClass","dijitIconWaiting");
		
		if(this._errorTooltip != null){
			this._errorTooltip.close();
			this._errorTooltip.removeTarget(this._formActionButton.domNode);
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
		this._formDialog.set("title",this.dialogCreateLabel);
		this._formActionButton.set("label",this.buttonCreateLabel);
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
		this._formDialog.show();
	},
	
	_getCurrentData: function(){
		return this._currentItem.get("value");
	},
	
	_prepFormForUpdate: function(){
		this._currentAction = "update";
		var data = this._getCurrentData();
		console.log("setting form with these values:",data);
		this._form.reset();
		this._form.set("value",data);
		this._formDialog.set("title",this.dialogUpdateLabel);
		this._formActionButton.set("label",this.buttonUpdateLabel);
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
		this._formDialog.show();
	},
	
	_dismissFormDialog: function(){
		this._formActionButton.set("disabled",false);
		this._formActionButton.set("iconClass","");
		this._formDialog.hide();
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
		console.log("requesting delete");
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
		this._onCancel(this._formActionButton);
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
		console.log("An error occured:", error);
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
		
		console.log("An error occured:", error);
		this._formActionButton.set("disabled", false);
		this._formActionButton.set("iconClass", "dijitIconError");
		this._initErrorTooltip();
		this._errorTooltip.addTarget(this._formActionButton.domNode);
		this._errorTooltip.open(this._formActionButton.domNode);
	},
	
	_formInvalid: function(invalid){
		console.log("Form is invalid:", invalid);
		this._formActionButton.set("iconClass","dijitIconError");
		
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
