/* 
 * Copyright 2011 Czar Theory, LLC
 * All rights reserved.
 */

dojo.provide("czarTheory.dijits.DemographicLister");

dojo.require("czarTheory.dijits._FlyoutMultiLister");
dojo.require("czarTheory.dijits.views.DemographicDetail");

dojo.declare("czarTheory.dijits.DemographicLister",[czarTheory.dijits._FlyoutMultiLister],{

	optionsNode:null
	,optionsLabel:null
	,anyOptionLabel:null
	,minNode:null
	,minLabel:null
	,maxNode:null
	,maxLabel:null
	,distributionWidget:null
	
	,templateString: dojo.cache('czarTheory.dijits', 'DemographicLister.html')
	
	,refresh: function(){
		var isOrdered = false;
		switch(this.distributionWidget.displayedValue){
			case '':
			case 'Identifier':
			case 'Unique Identifier':
				dojo.addClass(this.optionsNode,'dijitHidden');
				dojo.addClass(this.optionsLabel,'dijitHidden');
				dojo.addClass(this.anyOptionNode,'dijitHidden');
				dojo.addClass(this.minNode,'dijitHidden');
				dojo.addClass(this.minLabel,'dijitHidden');
				dojo.addClass(this.maxNode,'dijitHidden');
				dojo.addClass(this.maxLabel,'dijitHidden');
				break;
			case 'Ordered':
				isOrdered = true;
			case 'Categorical':
				dojo.removeClass(this.optionsNode,'dijitHidden');
				dojo.removeClass(this.optionsLabel,'dijitHidden');
				dojo.addClass(this.minNode,'dijitHidden');
				dojo.addClass(this.minLabel,'dijitHidden');
				dojo.addClass(this.maxNode,'dijitHidden');
				dojo.addClass(this.maxLabel,'dijitHidden');
				if(isOrdered) {dojo.addClass(this.anyOptionNode, 'dijitHidden');}
				else {dojo.removeClass(this.anyOptionNode,'dijitHidden');}
				break;
			case 'Numeric':
				dojo.addClass(this.optionsNode,'dijitHidden');
				dojo.addClass(this.optionsLabel,'dijitHidden');
				dojo.addClass(this.anyOptionNode,'dijitHidden');
				dojo.removeClass(this.minNode,'dijitHidden');
				dojo.removeClass(this.minLabel,'dijitHidden');
				dojo.removeClass(this.maxNode,'dijitHidden');
				dojo.removeClass(this.maxLabel,'dijitHidden');
				break;
			default:
				throw new Error('No Knowledge of this data type: ' + this.distributionWidget.displayedValue);
		}
	}

	,startup: function(){
		this.inherited(arguments);
		
		this.minNode = dijit.byId('min').domNode.parentNode;
		this.minLabel = this.getPrevious(this.minNode);
		this.maxNode = dijit.byId('max').domNode.parentNode;
		this.maxLabel = this.getPrevious(this.maxNode);
		this.optionsNode = dijit.byId('categories').domNode.parentNode;
		this.optionsLabel = this.getPrevious(this.optionsNode);
		this.anyOptionNode = dijit.byId('anyInput').domNode.parentNode;
		this.distributionWidget = dijit.byId('distribution');
		
		this.refresh();
		this.distributionWidget.watch('value', dojo.hitch(this, this.refresh));
	}
});