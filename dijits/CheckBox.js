/* 
 * Copyright 2011 Czar Theory, LLC
 * All rights reserved.
 */

dojo.provide("czarTheory.dijits.CheckBox");

dojo.require("dijit.form.CheckBox");

dojo.declare("czarTheory.dijits.CheckBox",[dijit.form.CheckBox], {
	
	uncheckedValue: "false"
	,value: "true"

	,_getValueAttr: function(){
			// summary:
			//		Hook so get('value') works.
			// description:
			//		If the CheckBox is checked, returns the value attribute.
			//		Otherwise returns this.uncheckedValue.
			return (this.checked ? this.value : this.uncheckedValue);
	}
});



