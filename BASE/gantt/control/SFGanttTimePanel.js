	/**
	这是一个甘特图功能控件，本控件用来实现甘特图的时间层，也就是在图标滚动条拖动时跟随时间变化的层
	@private
	@extends SFGanttControl
	@class
	*/
	function SFGanttTimePanel()
	{
	}
	SFGanttTimePanel.prototype=new window.SFGanttControl();
	/**
	@private
	功能控件的初始化，每个插件的实现都会重写此方法
	@param {SFGantt} gantt
	@returns {Bool} 如果初始化成功，返回true,否则返回false
	*/
	SFGanttTimePanel.prototype.initialize=function(gantt)
	{
		if(!gantt.getLayout || !gantt.getStartTime || !gantt.getLayout("mapBody")){return false;}
		var container=this.div=gantt.container.ownerDocument.createElement("div");
		SFGlobal.setProperty(container.style,{position:'absolute',left:'0px',top:'0px',width:'100%',height:'100%',zIndex:10});
		gantt.getContainer().appendChild(container);
		if(!container){return false;}
		this.gantt=gantt;
		gantt.getTimePanel=SFEvent.getCallback(this,this.getTimePanel)
		gantt.getTimePanelPosition=SFEvent.getCallback(this,this.getTimePanelPosition);
		this.listeners=[
			SFEvent.bind(gantt,"initialize",this,this.onGanttInit),
			SFEvent.bind(gantt,"layoutchange",this,this.onTimeChange),
			SFEvent.bind(gantt,"afterstarttimechange",this,this.onTimeChange),
			SFEvent.bind(gantt,"afterscalechange",this,this.onTimeChange)
		];
		return true;
	}
	/**
	@private
	在甘特图初始化时初始化时间层的显示
	*/
	SFGanttTimePanel.prototype.onGanttInit=function()
	{
		this.drawStart=this.gantt.getStartTime();
		this.onTimeChange();
	}
	/**
	@private
	在甘特图图表显示起始时间变化时移动时间层
	@param {Date} time 甘特图的图表显示起始时间
	*/
	SFGanttTimePanel.prototype.onTimeChange=function(time)
	{
		if(!this.drawStart){return;}
		var gantt=this.gantt;
		this.div.style.left=-Math.round((gantt.getStartTime()-this.drawStart)/gantt.getScale()-SFEvent.getPageOffset(gantt.getLayout("mapBody"),gantt.getContainer())[0])+"px";
	}
	/**
	@private
	获得指定的时间相对于时间层的像素位置
	@name SFGantt.prototype.getTimePanelPosition
	@private
	@function
	@param {Date} time
	@returns {Number} 像素值
	*/
	SFGanttTimePanel.prototype.getTimePanelPosition=function(time)
	{
		if(!time){return 0;}
		return Math.round(time-this.drawStart)/this.gantt.getScale();
	}
	/**
	@private
	获得甘特图的时间层
	@name SFGantt.prototype.getTimePanel
	@private
	@function
	@returns {HtmlElement}
	*/
	SFGanttTimePanel.prototype.getTimePanel=function()
	{
		return this.div;
	}
	/**
	@private
	在功能控件被移除时执行的方法
	*/
	SFGanttTimePanel.prototype.remove=function()
	{
		var gantt=this.gantt;
		delete gantt.getTimePanel
		delete gantt.getTimePanelPosition
		SFGanttControl.prototype.remove.apply(this,arguments);
	}
	window.SFGanttTimePanel=SFGanttTimePanel;