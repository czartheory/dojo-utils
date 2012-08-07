/*
 * Copyright 2011 Czar Theory, LLC
 * All rights reserved.
 */
dojo.provide("czarTheory.dijits.views._CrudEntityView");

dojo.require("czarTheory.dijits.views._EntityView");

dojo.declare("czarTheory.dijits.views._CrudEntityView", czarTheory.dijits.views._EntityView, {

	deleteAnchor: null,
	canDelete: true,

	updateAnchor: null,
	canUpdate: true,

	_setCanUpdateAttr: function(canUpdate){
		if(!this.updateAnchor) return;
		if(canUpdate){
			dojo.removeClass(this.updateAnchor, "dijitHidden");
		} else {
			dojo.addClass(this.updateAnchor,"dijitHidden");
		}
	},

	_setCanDeleteAttr: function(canDelete){
		if(!this.deleteAnchor) return;
		if(canDelete){
			dojo.removeClass(this.deleteAnchor, "dijitHidden");
		} else {
			dojo.addClass(this.deleteAnchor,"dijitHidden");
		}
	}
});
