	/**
	这是一个甘特图功能控件，此控件用来实现甘特图的自适应大小的功能，如果甘特图的大小不是用百分比控制的，则自动拒绝运行
	@private
	@extends SFGanttControl
	@class
	*/
	function SFGanttAutoResizeControl()
	{
	}
	SFGanttAutoResizeControl.prototype=new window.SFGanttControl();
	/**
	@private
	功能控件的初始化，每个插件的实现都会重写此方法
	@param {SFGantt} gantt
	@returns {Bool} 如果初始化成功，返回true,否则返回false
	*/
	SFGanttAutoResizeControl.prototype.initialize=function(gantt)
	{
		var style=gantt.getContainer().style;
		if(style.width && style.width.indexOf("%")<0 && style.height && style.height.indexOf("%")<0){return false}
		this.gantt=gantt;
		this.listeners=[
			SFEvent.bind(gantt.getContainer(),"resize",this,this.onResize),
			SFEvent.bind(window,"resize",this,this.onResize),
			SFEvent.bind(window,"move",this,this.onResize),
			SFEvent.bind(window,"load",this,this.onResize)
		]
		return true;
	}
	/**
	@private
	在甘特图大小变化时执行的响应
	*/
	SFGanttAutoResizeControl.prototype.onResize=function()
	{
		if(!this.timeout){this.timeout=window.setInterval(SFEvent.getCallback(this,this.onTime),256);}
		this.changed=true;
		this.idleTimes=0;
	}
	/**
	@private
	在甘特图大小变化过程之中持续执行的过程
	*/
	SFGanttAutoResizeControl.prototype.onTime=function()
	{
		if(!this.changed)
		{
			this.idleTimes++;
			if(this.idleTimes>4)
			{
				window.clearInterval(this.timeout);
				delete this.timeout
			}
			return;
		}
		this.changed=false;
		this.resize();
	}
	/**
	@private
	重新设置甘特图的大小
	*/
	SFGanttAutoResizeControl.prototype.resize=function()
	{
		var gantt=this.gantt;
		gantt.setViewSize(SFGlobal.getElementSize(gantt.getContainer()));
		this.timeout=null;
	}
	window.SFGanttAutoResizeControl=SFGanttAutoResizeControl;