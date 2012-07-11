/*
 * Copyright 2012 Czar Theory, LLC
 * All rights reserved.
 */
dojo.provide("czarTheory.dijits._FormWrapper");

dojo.require('dijit._Widget');
dojo.require('dijit._Templated');

dojo.declare("czarTheory.dijits._FormWrapper",[dijit._Widget, dijit._Templated], {

	_form:null
	,_actionButton: null

	,startup: function(){
		this.inherited(arguments);

		//Looking for a dojo.form.Form within the widget
		var foundWidgets = dijit.findWidgets(this.containerNode);
		for (var i = 0; i<foundWidgets.length; i++) {
			if(foundWidgets[i].declaredClass == "dijit.form.Form"){
				this._form = foundWidgets[i];
				break;
			}
		}
		if(!this._form) throw new Error('No dijit.form.form widget found inside widget: '+ this.id);


		//unhiding the form if hidden (to prevent FOUC)
		dojo.removeClass(this._form.domNode, 'dijitHidden');

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
			throw new Error("No submit button found in form: " + this.widgetId);
		} else {
			if(this._form.get("state") != "") this._actionButton.set("disabled",true);
		}

		//Allow submit button to be disabled if it's state is bad
		this._form.watch("state",dojo.hitch(this, function(watch,oldState,newState){
			var disabled = (newState == "") ? false : true;
			this._actionButton.set("disabled",disabled);
			if(!disabled) this._actionButton.set("iconClass","");
		}));

		//Connecting the submit button
		dojo.connect(this._form,'onSubmit', this, function(evt){
			if(this._actionButton.get("disabled")){
				dojo.stopEvent(evt);
			} else {
				this._actionButton.set("disabled",true);
				this._actionButton.set("iconClass","dijitIconWaiting");
				this._makeRequest(evt);
			}
		});
	}

	,_makeRequest: function(){}

	,_onCancel: function(){}

});
