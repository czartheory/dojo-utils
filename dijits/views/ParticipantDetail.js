/* 
 * Copyright 2011 Czar Theory, LLC
 * All rights reserved.
 */
dojo.provide("czarTheory.dijits.views.ParticipantDetail");

dojo.require("czarTheory.dijits.views._EntityView");

dojo.declare("czarTheory.dijits.views.ParticipantDetail", [czarTheory.dijits.views._EntityView], {
	
	templateString: dojo.cache('czarTheory.dijits.views', 'ParticipantDetail.html')
	,animateOnCreate:false
	,animateOnUpdate:false
	,normalBackgroundColor: "#d2d2d2"
	,customDemographics: null

	,attributeMap: {
		id: "",
		label: {
			node: "nameNode", 
			type:"innerHTML"
		},
		email: {
			node: "emailNode", 
			type:"innerHTML"
		}
	}
	
	,postCreate: function(){
		this.allowedProperties = [
			'label',
			'firstName',
			'middleNames',
			'lastName',
			'email',
			'demographics',
		];
		this.inherited(arguments);
		dojo.style(this.domNode, "margin-left", "-260px");
		this.customDemographics = {};
	}
	
	,firstLoaded: false
	,_setValueAttr: function(){
		if(!this.firstLoaded){
			dojo.animateProperty({
				node: this.domNode,
				duration: 400,
				properties: {
					marginLeft:0
				}
			}).play();
			this.firstLoaded = true;
			dojo.removeClass(this.itemControlNode, "dijitHidden");
		}
		this.inherited(arguments);
	}
	
	,_getValueAttr: function(){
		var output = {};
		var prop;
		var item;
		for(prop in this.properties){
			item = this.properties[prop];
			if(item && prop === "demographics"){
				for(var id in item){
					output['demographic_' + id] = item[id];
				}
			} else {
				if(item && typeof item === "object"){item = item.id;}
				output[prop] = item;
			}
		}
		return output;
	
}
	
	,close: function() {
		dojo.addClass(this.itemControlNode,"dijitHidden");
		this.firstLoaded = false;
		dojo.animateProperty({
			node: this.domNode,
			duration: 400,
			properties: {
				marginLeft: -260
			}
		}).play();
	}
	
	,_setDemographicsAttr: function(data){
		for(var id in data){
			var demo = this.customDemographics[id];
			if(demo == null) continue;
			var value = dojo.trim(data[id]);
			if(value == null || value === "") value = "_BLANK_";
			demo.valueNode.innerHTML = value;
		}
	}
	
	,addDemographic: function(demo){
		if(!demo.isCustom) return;
		var id = demo.id;

		if(this.customDemographics[id] != null){
			console.error("this demographic was added already:",demo);
		} else {
			var value = (this.properties.demographics != null) ? this.properties.demographics[id] : "";
			if(!value) value = "_BLANK_";
			this.customDemographics[id] = {
				data: demo
				,labelNode: dojo.create('dt', {innerHTML: demo.label}, this.demographicsNode)
				,valueNode: dojo.create('dd', {innerHTML: value}, this.demographicsNode)
			}
		}
	}
	
	,updateDemographic: function(demo){
		var id = demo.id;
		var existing = this.customDemographics[id];
		if(existing == null) throw new Error("no demographic found to update: ", demo);

		existing.labelNode.innerHTML = demo.label;
		existing.data = demo;
	}
	
	,removeDemographic: function(id){
		console.log("remove requested");
		var existing = this.customDemographics[id];
		if(existing == null) return;
		
		dojo.destroy(existing.labelNode);
		console.log("existing item to be deleted:",existing);
		dojo.destroy(existing.valueNode);
		this.customDemographics[id] = null;
	}
});
