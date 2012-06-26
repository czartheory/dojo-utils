/*
 * Copyright 2011 Czar Theory, LLC
 * All rights reserved.
 */
dojo.provide("czarTheory.dijits.ModalAjaxForm");

dojo.require('czarTheory.dijits.ModalForm');
dojo.require('czarTheory.dijits.AjaxForm');

dojo.declare("czarTheory.dijits.ModalAjaxForm",[czarTheory.dijits.ModalForm, czarTheory.dijits.AjaxForm], {

	templateString: dojo.cache('czarTheory.dijits','ModalForm.html')

	,_onSuccess: function(){
		this.inherited(arguments);
		this.dialogNode.hide();
	}
});
