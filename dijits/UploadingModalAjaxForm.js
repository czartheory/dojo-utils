/*
 * Copyright 2011 Czar Theory, LLC
 * All rights reserved.
 */
dojo.provide("czarTheory.dijits.UploadingModalAjaxForm");

dojo.require("czarTheory.dijits.ModalAjaxForm");

dojo.require("dojox.form.Uploader");
dojo.require("dojox.form.uploader.plugins.IFrame")

dojo.declare("czarTheory.dijits.UploadingModalAjaxForm",[czarTheory.dijits.ModalAjaxForm], {

	_submitForm: function(){
		this._lastDeferred = dojo.io.iframe.send({
			url: this.href
			,method: this.method
			,form: this._form.domNode
			,load: dojo.hitch(this, this._requestCompleted)
			,handle: dojo.hitch(this, function(){
				this._requestCompleted("{}");
			})
			,error: dojo.hitch(this, this._requestError)
			//,handle: function(error,ioArgs){
				//console.error("handle",error);
				//console.error("ioArgs:",ioArgs);
				//this.onSuccess();
			//}
			,failOk: true
		});
	}
});




