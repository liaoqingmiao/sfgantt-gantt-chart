	/**
	这是一个甘特图功能控件，本控件用来实现甘特图的时间相关功能支持
	@private
	@extends SFGanttControl
	@class
	*/
	function SFGanttTimeControl()
	{
	}
	SFGanttTimeControl.prototype=new window.SFGanttControl();
	/**
	@private
	功能控件的初始化，每个插件的实现都会重写此方法
	@param {SFGantt} gantt
	@returns {Bool} 如果初始化成功，返回true,否则返回false
	*/
	SFGanttTimeControl.prototype.initialize=function(gantt,container)
	{
		this.gantt=gantt;
		SFGlobal.setProperty(gantt,{
			getStartTime:SFEvent.getCallback(this,this.getStartTime),
			getScale:SFEvent.getCallback(this,this.getScale),
			setStartTime:SFEvent.getCallback(this,this.setStartTime),
			setScale:SFEvent.getCallback(this,this.setScale),
			move:SFEvent.getCallback(this,this.move),
			show:SFEvent.getCallback(this,this.show)
		});
		gantt.moveTo=gantt.setStartTime
		this.listeners=[
			SFEvent.bind(gantt,"initialize",this,this.onGanttInit)
		];
		return true;
	}
	/**
	@private
	在甘特图初始化时初始化时间相关属性
	*/
	SFGanttTimeControl.prototype.onGanttInit=function()
	{
		var gantt=this.gantt;
		this.startTime=gantt.startTime;
		if(!this.startTime)
		{
			var task=gantt.data.getRootTask();
			if(task){this.startTime=task.Start;}
			if(!this.startTime){this.startTime=new Date();}
		}
		if(!this.scale){this.scale=576*3600000/12;}
	}
	/**
	将甘特图的图表内容向右移动指定的像素值,这个方法必须在地图初始化之后才能调用
	@name SFGantt.prototype.move
	@function
	@param {Number} length 移动的像素距离，正数代表向右移动，负数代表向左移动
	*/
	SFGanttTimeControl.prototype.move=function(length)
	{
		this.setStartTime(new Date(length*this.scale+this.startTime.valueOf()));
	}
	/**
	获取甘特图图表的显示开始时间(也就是图标最左侧对应时间)
	@name SFGantt.prototype.getStartTime
	@function
	@returns {Date}
	*/
	SFGanttTimeControl.prototype.getStartTime=function()
	{
		return this.startTime;
	}
	/**
	设置甘特图图表的显示开始时间(也就是图标最左侧对应时间)
	@name SFGantt.prototype.setStartTime
	@function
	@param {Date} time
	@returns {Bool} 如果设置成功，返回true,否则返回false
	*/
	SFGanttTimeControl.prototype.setStartTime=function(time)
	{
		var gantt=this.gantt,startTime=this.startTime;
		if(startTime && (startTime==time || startTime.valueOf()==time.valueOf())){return;}
		var returnObj={returnValue:true}
		/** 
			@event
			@name SFGantt#beforestarttimechange
			@description 在甘特图图表视图起始时间变化前触发（即移动）
			@param {Json} returnObj 如果设置returnObj.returnValue=false,则代表拒绝移动，甘特图就不会进行移动.
			@param {Date} time 欲设置的起始时间
		 */
		SFEvent.trigger(gantt,"beforestarttimechange",[returnObj,time]);
		if(!returnObj.returnValue){return false;}
		this.startTime=time;
		/** 
			@event
			@name SFGantt#afterstarttimechange
			@description 在甘特图图表视图起始时间变化后触发（即移动）
			@param {Date} time 新的视图起始时间
		 */
		/** 
			@event
			@name SFGantt#move
			@description afterstarttimechange的别名，用法相同
		 */
		SFEvent.trigger(gantt,"afterstarttimechange",[time]);
		SFEvent.trigger(gantt,"move",[time]);
		return true;
	}
	/**
	返回甘特图的图表显示缩放比例
	@name SFGantt.prototype.getScale
	@function
	@returns {Number} 返回缩放比例，实际上是一个像素对应时间的毫秒数
	*/
	SFGanttTimeControl.prototype.getScale=function()
	{
		return this.scale;
	}
	/**
	设置甘特图的图表显示缩放比例
	@name SFGantt.prototype.setScale
	@function
	@param {Number} scale 一个像素对应时间的毫秒数
	*/
	SFGanttTimeControl.prototype.setScale=function(scale)
	{
		if(this.scale==scale){return;}
		var returnObj={returnValue:true}
		/** 
			@event
			@name SFGantt#beforescalechange
			@description 在甘特图图表的缩放比例变化前触发
			@param {Json} returnObj 如果设置returnObj.returnValue=false,则代表拒绝更改，甘特图就不会进行缩放.
			@param {Number} scale 欲设置的缩放比例，即一个像素相当于多少毫秒
		 */
		SFEvent.trigger(this.gantt,"beforescalechange",[returnObj,scale]);
		if(!returnObj.returnValue){return false;}
		this.scale=scale;
		/** 
			@event
			@name SFGantt#afterscalechange
			@description 在甘特图图表的缩放比例变化后触发
			@param {Number} scale 当前的甘特图图表缩放比例，即一个像素相当于多少毫秒
		 */
		SFEvent.trigger(this.gantt,"afterscalechange",[scale]);
		return true;
	}
	/**
	甘特图的显示函数，调用这个函数开始显示甘特图
	@name SFGantt.prototype.show
	@private
	@function
	@param {Date} [time] 如果不设置，则为自动
	@param {Number} [scale] 如果不设置，则为自动
	*/
	SFGanttTimeControl.prototype.show=function(startTime,scale)
	{
		var gantt=this.gantt;
		if(startTime){gantt.setStartTime(startTime);}
		if(scale){gantt.setScale(scale);}
	}
	/**
	@private
	在功能控件被移除时执行的方法
	*/
	SFGanttTimeControl.prototype.remove=function()
	{
		var gantt=this.gantt;
		delete gantt.moveTo
		delete gantt.getStartTime
		delete gantt.getScale
		delete gantt.setStartTime
		delete gantt.setScale
		delete gantt.move
		delete gantt.show
		SFGanttControl.prototype.remove.apply(this,arguments);
	}
	window.SFGanttTimeControl=SFGanttTimeControl;