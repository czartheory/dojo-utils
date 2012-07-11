/*
 * Copyright 2011 Czar Theory, LLC
 * All rights reserved.
 */
dojo.provide("czarTheory.dijits.ModalCrudLister");

dojo.require('czarTheory.dijits._CrudLister');
dojo.require('czarTheory.dijits.ModalAjaxForm');
dojo.require('dijit.Dialog');

dojo.declare("czarTheory.dijits.ModalCrudLister",[
	czarTheory.dijits.ModalAjaxForm, czarTheory.dijits._CrudLister
], {

	dialogCreateLabel: "Create New"
	,dialogUpdateLabel: "Update Item"

	,templateString: dojo.cache('czarTheory.dijits', 'ModalCrudLister.html')
	,widgetsInTemplate: true

	,_prepFormForCreation: function(){
		this.inherited(arguments);
		this.dialogNode.set("title",this.dialogCreateLabel);
		this.dialogNode.show();
	}

	,_newCreated: function(data){
		this.inherited(arguments);
		this._dismissFormDialog();
	}

	,_prepFormForUpdate: function(){
		this.inherited(arguments);
		this.dialogNode.set("title",this.dialogUpdateLabel);
		this.dialogNode.show();
	}

	,_currentUpdated: function(data){
		this.inherited(arguments);
		this._dismissFormDialog();
	}

	,_dismissFormDialog: function(){
		this._actionButton.set("disabled",false);
		this._actionButton.set("iconClass","");
		this.dialogNode.hide();
	}
});
