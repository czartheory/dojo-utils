/* 
 * Copyright 2011 Czar Theory, LLC
 * All rights reserved.
 */
dojo.provide("czarTheory.dijits.ModalAjaxForm");

dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require("dijit.form.Button");
dojo.require("dijit.Dialog");

dojo.declare("czarTheory.dijits.ModalAjaxForm",[dijit._Widget, dijit._Templated], {
	
	widgetsInTemplate: true,
	
	buttonLabel:"button",
	dialogTitle:"title",
	href: '',
	method: '',
	draggable: false,
	
	_lastDeferred: null,
	_form:null,
	_errorTooltip: null,
	_actionButton: null,
	
	constructor:function(){
		this.href = null;
		this.method = null;
		this.inherited(arguments);
	},
	
	templateString: dojo.cache('czarTheory.dijits','ModalAjaxForm.html'),
	
	startup: function(){
		this.inherited(arguments);
		
		//Looking for a dojo form within the dialog
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
		//unhiding the form if hidden (to prevent FOUC)
		dojo.removeClass(formNode, 'dijitHidden');
		
		//Deciding on the form's destination url
		if(this.href == null) this.href = this._form.action;
		if(this.method == null) this.method = this._form.method;
	
		//Locating the submit button
		var formElements = this._form.getChildren();
		for (i = formElements.length-1; i>=0; i--){
			if(formElements[i].type == "submit") {
				this._actionButton = formElements[i];
				break;
			}
		}

		//because it's required
		if(this._actionButton == null) {
			console.log("No submit button found in form: " + this.widgetId);
		} else {
			if(this._form.get("state") != "") this._actionButton.set("disabled",true);
		}
		
		//Allow submit button to be disabled if it's state is bad
		this._form.watch("state",dojo.hitch(this, function(watch,oldState,newState){
			var disabled = (newState == "") ? false : true;
			this._actionButton.set("disabled",disabled);
			if(!disabled) this._actionButton.set("iconClass","");
		}));
		
		//Connecting the buttons (the main button, submit button, and the close button)
		dojo.connect(this._form,'onSubmit', this, this._makeRequest);
		dojo.connect(this.dialogNode,'onHide',this, this._onCancel);
		dojo.connect(this.buttonNode, "onClick", this, function(evt){
			this.dialogNode.show();
		});
		
	},
	
	_onCancel: function(){
		if(null !== this._lastDeferred){this._lastDeferred.cancel();}
		if(null !== this._errorTooltip){
			this._errorTooltip.close();
			this._errorTooltip.removeTarget(this._actionButton.domNode);
			this._actionButton.set("iconClass","");
		}
	},
	
	_makeRequest: function(evt){
		console.log("making request");
		dojo.stopEvent(evt);
		
		if(this._actionButton.get("disabled")) return;
		
		this._actionButton.set("disabled",true);	
		this._actionButton.set("iconClass","dijitIconWaiting");

		//if a submit happended previously and there was an error, do this:
		if(null !== this._errorTooltip) {
			this._errorTooltip.close();
			this._errorTooltip.removeTarget(this._actionButton.domNode);
		}

		if(null == this.href) {
			this.onError("No href Defined for this button!");
			return;
		}
		
		if(this._form.get("state") == "") {
			this._submitForm();
		} else {
			this._onInvalid();
		}
	},	
	
	_submitForm: function(){
		this._lastDeferred = dojo.xhr(this.method,{
			url: this.href,
			form: this._form.domNode,
			headers: {"accept" : "application/json"},
			load: dojo.hitch(this, this._requestCompleted),
			error: dojo.hitch(this, this._requestError),
			failOk: true
		});
	},
	
	_requestError:function(error){
		var data;
		try{
			data = JSON.parse(error.responseText);
			if(data.error) data = data.error;
		} catch(e) {
			data = error.responseText;
		}
		this.onError(data);
	},
		
	_requestCompleted: function(data){
		var error = null;
		try{
			data = JSON.parse(data);
			if(data.error) error = data.error;
		} catch(e) {
			error = "Invalid Json:" + data + ".";
		}
		if(error != null) this.onError(error);
		else this._onSuccess(data);
	},

	_onSuccess: function(data){
		this._actionButton.set("disabled",false);
		this._actionButton.set("iconClass","");
		dojo.hitch(this,this.onSuccess,data)();
		this.dialogNode.hide();
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

	onSuccess: function(data, button){
		console.log("No onSuccess method implemented for this widget!");
	},
	
	onError: function(error){
		console.log(error);
		if(error.invalid != null){
			this._onInvalid(error.invalid);
			return;
		}

		console.log("An Error Occured.");
		console.log(error);
		this._actionButton.set("disabled",false);
		this._actionButton.set("iconClass","dijitIconError");
		this._initErrorTooltip();
		this._errorTooltip.addTarget(this._actionButton.domNode);
		this._errorTooltip.open(this._actionButton.domNode);
	},

	_onInvalid: function(invalid){
		console.log("Form is invalid:", invalid);
		this._actionButton.set("iconClass","dijitIconError");
		
		var i;
		var formElements = this._form.getDescendants();
		for (i=0;i<formElements.length;i++){
			var element = formElements[i];
			var name = element.name;
			if(invalid[name]){
				var messages = "";
				var property;
				for(property in invalid[name]) {
					messages += invalid[name][property];
				}
				messages = dojo.trim(messages);
				if(messages.length > 0) {
					if(element.validate) {dojo.hitch(this, this._monkeySwapValidator,element, messages)();}
					else {dojo.hitch(this, this._monkeyAddValidator,element, messages)();}
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
		//		to Zend Dojo.
		
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