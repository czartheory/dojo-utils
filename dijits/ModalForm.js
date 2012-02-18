/*
 * Copyright 2011 Czar Theory, LLC
 * All rights reserved.
 */
dojo.provide("czarTheory.dijits.ModalForm");

dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require("dijit.form.Button");
dojo.require("dijit.Dialog");

dojo.declare("czarTheory.dijits.ModalForm",[dijit._Widget, dijit._Templated], {

	widgetsInTemplate: true

	,buttonLabel:"button"
	,dialogTitle:"title"
	,draggable: false
	,useLink: false

	,_form:null
	,_actionButton: null
	,buttonNode: null

	,templateString: dojo.cache('czarTheory.dijits','ModalForm.html')

	,startup: function(){
		this.inherited(arguments);

		//Looking for a dojo.form.Form within the dialog
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

		//Create either a button or a link to activate the dialog
		var buttonEvt;
		if(this.useLink === true) {
			this.buttonNode = dojo.create('a', {
				innerHTML: this.buttonLabel
				,href: '#'
			}, this.domNode, 'before');
			buttonEvt = 'onclick';
		} else {
			this.buttonNode = new dijit.form.Button({
				label: this.buttonLabel
			}).placeAt(this.domNode, 'before');
			buttonEvt = 'onClick';
		}

		//Connecting the buttons (the main button, submit button, and the close button)
		dojo.connect(this._form,'onSubmit', this, function(evt){
			if(this._actionButton.get("disabled")){
				dojo.stopEvent(evt);
			}
			else {
				this._actionButton.set("disabled",true);
				this._actionButton.set("iconClass","dijitIconWaiting");
				this._makeRequest(evt);
			}
		});

		dojo.connect(this.dialogNode,'onHide',this, this._onCancel);

		dojo.connect(this.buttonNode, buttonEvt, this, function(evt){
			dojo.stopEvent(evt);
			this.dialogNode.show();
		});

	}

	,_makeRequest: function(evt){
	}

	,_onCancel: function(){
	}

});