/*
 * Copyright 2011 Czar Theory, LLC
 * All rights reserved.
 */

dojo.provide("czarTheory.dijits.SimpleAjaxButton");

dojo.require("dijit.form.Button");
dojo.require("dijit.Dialog");

dojo.declare("czarTheory.dijits.SimpleAjaxButton",[dijit.form.Button], {

	href: '',
	method: 'get',
	sendParams: {},
	confirm: '',

	confirmDialog: null,
	lastDeferred: null,
	errorTooltip: null,

	constructor: function(){
		this.confirm = null;
		this.href = null;
		this.inherited(arguments);
	},


	startup: function(){
		this.inherited(arguments);
		if(null !== this.confirm){
			dojo.require("dijit.Dialog");
			this.confirmDialog = new dijit.Dialog({
				title: "Are you sure?",
				content: this.confirm + '<br/>',
				onHide: dojo.hitch(this,this._onCancel),
				draggable: false
			});
			this._actionButton = new dijit.form.Button({
				label:"Yes",
				baseClass: this.baseClass,
				onClick: dojo.hitch(this, this._preRequest)
			}).placeAt(this.confirmDialog.containerNode);
			dojo.create('span', {innerHTML:'&nbsp;&nbsp;'}, this.confirmDialog.containerNode);
			this._cancelButton = new dijit.form.Button({
				label:"Cancel",
				baseClass: "gray dijitButton",
				onClick: dojo.hitch(this, function(){this.confirmDialog.hide();})
			}).placeAt(this.confirmDialog.containerNode);
		} else this._actionButton = this;
	},

	_onCancel: function(){
		if(null !== this.lastDeferred){this.lastDeferred.cancel()}
		if(null !== this.errorTooltip){
			this.errorTooltip.close();
			this.errorTooltip.removeTarget(this._actionButton.domNode);
			this._actionButton.set("iconClass","");
		}
	},

	_onClick: function(evt){
		if(null !== this.confirm) this.confirmDialog.show();
		else this._preRequest();
	},

	_preRequest: function() {
		if(this._actionButton.get("disabled")) return;
		this._actionButton.set("disabled",true);
		this._actionButton.set("iconClass","dijitIconWaiting");

		if(null !== this.errorTooltip) {
			this.errorTooltip.close();
			this.errorTooltip.removeTarget(this._actionButton.domNode);
		}

		this.onRequest();
	},

	_makeRequest: function() {
		if (null === this.href) {
			this.onError("No href Defined for this button!");
			return;
		}

		this.lastDeferred = dojo.xhr(this.method, {
			url:this.href,
			content: this.sendParams,
			headers: {"Accept": "application/javascript, application/json"},
			load: dojo.hitch(this, this._requestCompleted),
			error: dojo.hitch(this, this._requestError)
		});
	},

	_requestError: function(error){
		this.onError(error);
	},

	_requestCompleted: function(json){
		var error = null;
		try{
			data = JSON.parse(json);
			if(data.error) error = data.error;
		} catch(e) {
			error = "Invalid Json:" + json + ".";
		}

		if(error !== null) this.onError(error);
		else this._onSuccess(data);
	},

	_onSuccess: function(data){
		this._actionButton.set("disabled",false);
		this._actionButton.set("iconClass","");
		dojo.hitch(this,this.onSuccess,data)();
		if(null !== this.confirm) this.confirmDialog.hide();
	},

	onRequest: function() {
		this._makeRequest();
	},

	onSuccess: function(data){
		console.warn("No onSuccess method implemented for this button!");
	},

	onError: function(error){
		console.log("An Error Occured.", error);
		var errorLabel = 'An Error has Occured.<br/>We\'re still working out kinks.';
		if(null === this.errorTooltip){
			dojo.require("dijit.Tooltip");
			this.errorTooltip = new dijit.Tooltip ({
				label: errorLabel,
				showDelay: 100
			});
		}
		this._actionButton.set("disabled",false);
		this._actionButton.set("iconClass","dijitIconError");
		this.errorTooltip.addTarget(this._actionButton.domNode);
		this.errorTooltip.open(this._actionButton.domNode);
	}
});
