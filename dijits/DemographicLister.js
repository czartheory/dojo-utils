/* 
 * Copyright 2011 Czar Theory, LLC
 * All rights reserved.
 */

dojo.provide("czarTheory.dijits.DemographicLister");

dojo.require("czarTheory.dijits._FlyoutMultiLister");
dojo.require("czarTheory.dijits.views.DemographicDetail");

dojo.declare("czarTheory.dijits.DemographicLister",[czarTheory.dijits._FlyoutMultiLister],{
	templateString: dojo.cache('czarTheory.dijits', 'DemographicLister.html')
});