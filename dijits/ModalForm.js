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
    ,position: NaN

	,startup: function(){
		this.inherited(arguments);

		//Create either a button or a link to activate the dialog
		var buttonEvt;
		if(this.useLink === true) {
			buttonEvt = 'onclick'; //notice the slight difference in capitalization
		} else {
			buttonEvt = 'onClick'; //notice the slight difference in Capitalization
		}

		dojo.connect(this.buttonNode, buttonEvt, this, function(evt){
			dojo.stopEvent(evt);
			this._onButtonNodeClick();
		});

		dojo.connect(this.dialogNode,'onHide',this, this._onCancel);

	}

	,_onButtonNodeClick: function(){
        this.showDialog();
	}

    ,showDialog: function(){
		this.dialogNode.show();
        if(!isNaN(this.position)){
            dojo.style(this.dialogNode.domNode,'top',this.position + 'px');
        }
    }
});
