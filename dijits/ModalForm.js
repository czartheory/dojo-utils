/*
 * Copyright 2011 Czar Theory, LLC
 * All rights reserved.
 */
dojo.provide("czarTheory.dijits.ModalForm");

dojo.require("czarTheory.dijits._FormWrapper");
dojo.require("dijit.form.Button");
dojo.require("dijit.Dialog");

dojo.declare("czarTheory.dijits.ModalForm", czarTheory.dijits._FormWrapper, {

	widgetsInTemplate: true
	,templateString: dojo.cache('czarTheory.dijits','ModalForm.html')

	,buttonLabel:"button"
	,dialogTitle:"title"
	,draggable: false
	,useLink: false
	,buttonNode: null

	,startup: function(){
		this.inherited(arguments);

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
		if(this.baseClass != null) dojo.addClass(this.buttonNode,this.baseClass);

		dojo.connect(this.dialogNode,'onHide',this, this._onCancel);

		dojo.connect(this.buttonNode, buttonEvt, this, function(evt){
			dojo.stopEvent(evt);
			this.dialogNode.show();
		});
	}
});
