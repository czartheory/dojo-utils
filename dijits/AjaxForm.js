/*
 * Copyright 2011 Czar Theory, LLC
 * All rights reserved.
 */
dojo.provide("czarTheory.dijits.AjaxForm");

dojo.require("czarTheory.dijits._FormWrapper");

dojo.declare("czarTheory.dijits.AjaxForm", czarTheory.dijits._FormWrapper, {

	href: '__BLANK__'
	,method: '__BLANK__'

	,_lastDeferred: null
	,_errorTooltip: null
	,errorLabel: 'An Error has Occured.<br/>We\'re still working out kinks.'

	,templateString: dojo.cache('czarTheory.dijits','AjaxForm.html')

	,startup: function(){
		this.inherited(arguments);

		//Deciding on the form's destination url
		if(this.href === '__BLANK__') {
			var href = dojo.trim(this._form.action);
			if(href){
				this.href = href;
			} else {
				this.href = window.location.href;
			}
		}

		if(this.method === '__BLANK__') {
			this.method = this._form.method;
		}
	}

	,_onCancel: function(){
		if(null !== this._lastDeferred){this._lastDeferred.cancel();}
		if(null !== this._errorTooltip){
			this._errorTooltip.close();
			this._errorTooltip.removeTarget(this._actionButton.domNode);
			this._actionButton.set("iconClass","");
		}
	}

	,_makeRequest: function(evt){
		dojo.stopEvent(evt);

		//if a submit happended previously and there was an error, do this:
		if(null !== this._errorTooltip) {
			this._errorTooltip.close();
			this._errorTooltip.removeTarget(this._actionButton.domNode);
		}

		if(this.target) {
			this.onError("No Target defined for this Widget");
			return;
		}

		if(this._form.get("state") == "") {
			this._submitForm();
		} else {
			this._onInvalid();
		}
	}

	,_submitForm: function(){
		this._lastDeferred = dojo.xhr(this.method,{
			url: this.href,
			form: this._form.domNode,
			headers: {"accept" : "application/json"},
			load: dojo.hitch(this, this._requestCompleted),
			error: dojo.hitch(this, this._requestError),
			failOk: true
		});
	}

	,_requestError:function(error,ioArgs){
		console.error("request error: ",error,ioArgs);
		var data;
		try{
			data = JSON.parse(ioArgs.xhr.responseText);
			data = data.error;
		} catch(e) {
			data = ioArgs.xhr.responseText;
		}

		if(data && data.invalid){
			this._onInvalid(data.invalid);
		} else {
			this.onError(data);
		}
	}

	,_requestCompleted: function(data){
		var error = null;
		try{
			data = JSON.parse(data);
			if(data.error) error = data.error;
		} catch(e) {
			error = "Invalid Json:" + data + ".";
		}

		if(error != null) {
			if(error.invalid) {
				this._onInvalid(error.invalid);
			} else {
				this.onError(error);
			}
		} else {
			this._onSuccess(data);
		}
	}

	,_onSuccess: function(data){
		this._actionButton.set("disabled",false);
		this._actionButton.set("iconClass","");
		dojo.hitch(this,this.onSuccess,data)();
	}

	,_initErrorTooltip: function(){
		if(null === this._errorTooltip){
			dojo.require("dijit.Tooltip");
			this._errorTooltip = new dijit.Tooltip ({
				label: this.errorLabel
				,showDelay: 100
			});
		}
	}

	,onSuccess: function(data){
		console.warn("No onSuccess method implemented for this widget!");
	}

	,onError: function(error){
		console.error("An Error Occured.", error);
		this._actionButton.set("disabled",false);
		this._actionButton.set("iconClass","dijitIconError");
		this._initErrorTooltip();
		this._errorTooltip.addTarget(this._actionButton.domNode);
		this._errorTooltip.open(this._actionButton.domNode);
	}

	,_onInvalid: function(invalid){
		console.error("Form is invalid:", invalid);
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
	}

	,_monkeySwapValidator: function(item, message){
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
	}

	,_monkeyAddValidator: function(item, message){
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
