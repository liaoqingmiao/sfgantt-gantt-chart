	/**
	这是一个甘特图功能控件，本控件实现对甘特图的大小进行限制的功能
	@private
	@extends SFGanttControl
	@class
	*/
	function SFGanttSizeLimitControl()
	{
	}
	SFGanttSizeLimitControl.prototype=new window.SFGanttControl();
	/**
	@private
	功能控件的初始化，每个插件的实现都会重写此方法
	@param {SFGantt} gantt
	@returns {Bool} 如果初始化成功，返回true,否则返回false
	*/
	SFGanttSizeLimitControl.prototype.initialize=function(gantt)
	{
		this.listeners=[
			SFEvent.bind(gantt,"beforeresize",this,this.onBeforeResize)
		]
		var maxSize=gantt.maxSize,minSize=gantt.minSize;
		maxSize=maxSize?maxSize:[4096,4096];
		minSize=minSize?minSize:[200,200];
		SFGlobal.setProperty(this,{maxSize:maxSize,minSize:minSize,gantt:gantt});
		gantt.setMaxSize=SFEvent.getCallback(this,function(size){this.maxSize=size;});
		gantt.setMinSize=SFEvent.getCallback(this,function(size){this.minSize=size;});
		return true;
	}
	/**
	@private
	在甘特图的大小变化之前进行检查
	@param {Json} returnObj 事件控制对象
	@param {Number[]} s 甘特图打算变化的目标大小
	@returns {Bool} 如果没有超出限制，返回true,否则返回false
	*/
	SFGanttSizeLimitControl.prototype.onBeforeResize=function(returnObj,s)
	{
		var size=this.maxSize;
		if(size && (size[0]<s[0] || size[1]<s[1])){returnObj.returnValue=false;}
		var size=this.minSize;
		if(size && (size[0]>s[0] || size[1]>s[1])){returnObj.returnValue=false;}
	}
	/**
	@private
	在功能控件被移除时执行的方法
	*/
	SFGanttSizeLimitControl.prototype.remove=function()
	{
		var gantt=this.gantt;
		delete gantt.setMaxSize
		delete gantt.setMinSize
		SFGanttControl.prototype.remove.apply(this,arguments);
	}
	window.SFGanttSizeLimitControl=SFGanttSizeLimitControl;