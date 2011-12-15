/* 
 * Copyright 2011 Czar Theory, LLC
 * All rights reserved.
 */
dojo.provide("czarTheory.dijits.views.DemographicDetail");

dojo.require("czarTheory.dijits.views._EntityView");

dojo.declare("czarTheory.dijits.views.DemographicDetail", [czarTheory.dijits.views._EntityView], {
	
	templateString: dojo.cache('czarTheory.dijits.views', 'DemographicDetail.html')
	,animateOnCreate:false
	,animateOnUpdate:false
	,normalBackgroundColor: "#d2d2d2"

	,attributeMap: {
		id: "",
		label: {
			node: "labelNode", 
			type:"innerHTML"
		},
		distribution: {
			node: "dataTypeNode", 
			type:"innerHTML"
		}
	}
	
	,postCreate: function(){
		this.allowedProperties = [
			'allowNull',
			'dataType',
			'distribution',
			'isCustom',
			'isUnique',
			'label',
			'options',
			'verifyWithParticipants',
			'visibleInSurveys'
		];
		this.inherited(arguments);
		dojo.style(this.domNode, "margin-left", "-260px");
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
			if(item && prop === "options"){
				if(item.categories) output.categories = item.categories.join(", ");
				if(item.anyInput) output.anyInput = true;
				output.min = item.min;
				output.max = item.max;
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
	
	,_setOptionsAttr: function(options){
		var showOptions = false;
		if(options){	
			var dist = this.properties.distribution.distribution;
			var output = "";
			switch(dist){
				case "categorical":
					if(options.anyInput) {output = "<em>Any input allowed.</em>"}
					//fall through
				case "ordered":
					output = options.categories.join(', ') + "<br/>" + output;
					showOptions = true;
					break;
				case "numeric":
					if(options.min){output += "<em>Minimum: </em>" + options.min + "<br/>";}
					if(options.max){output += "<em>Maximum: </em>" + options.max + "<br/>";}
					showOptions = true;
					break;
			}
			this.optionsList.innerHTML = output;
		}

		if(showOptions){
			dojo.removeClass(this.optionsNode,"dijitHidden");
			dojo.removeClass(this.optionsList,"dijitHidden");
		} else {
			dojo.addClass(this.optionsNode,"dijitHidden");
			dojo.addClass(this.optionsList,"dijitHidden");
		}
	}
	
	,_setCanUpdateAttr: function(canDelete){
		this.inherited(arguments);
	}
	
	,_setCanDeleteAttr: function(canDelete){
		this.inherited(arguments);
	}
	
	,_setAllowNullAttr: function(allowNull){
		if(allowNull){
			dojo.addClass(this.allowNullNode,"allowed");
		} else {
			dojo.removeClass(this.allowNullNode,"allowed");
		}
	}

	,_setVisibleInSurveysAttr: function(visibleInSurveys){
		if(visibleInSurveys){
			dojo.addClass(this.inSurveyNode,"allowed");
		} else {
			dojo.removeClass(this.inSurveyNode,"allowed");
		}
	}

	,_setVerifyWithParticipantsAttr: function(verifyWithParticipants){
		if(verifyWithParticipants){
			dojo.addClass(this.needsVerifyNode,"allowed");
		} else {
			dojo.removeClass(this.needsVerifyNode,"allowed");
		}
	}

	,_setIsCustomAttr: function(isCustom){
		if(!this.firstLoaded) return;
		if(isCustom){
			this.set("canUpdate",true);
			this.set("canDelete",true);
			dojo.addClass(this.mandatoryNode,"dijitHidden");
		} else {
			this.set("canUpdate",false);
			this.set("canDelete",false);
			if(this.firstLoaded) dojo.removeClass(this.mandatoryNode,"dijitHidden");
		}
	}
});