/* 
 * Copyright 2011 Czar Theory, LLC
 * All rights reserved.
 */
dojo.provide("czarTheory.dijits.UploadingModalAjaxForm");

dojo.require("czarTheory.dijits.ModalAjaxForm");
//dojo.require("dojo.io.iframe");

dojo.declare("czarTheory.dijits.UploadingModalAjaxForm",[czarTheory.dijits.ModalAjaxForm], {
	
	/* 
	_submitForm: function(){
		this._lastDeferred = dojo.io.iframe.send({
			url: this.href
			,method: this.method
			,form: this._form.domNode
			,headers: {"accept" : "application/json"}
			,load: dojo.hitch(this, this._requestCompleted)
			,error: dojo.hitch(this, this._requestError)
			,failOk: true
		});
	} // */
});




