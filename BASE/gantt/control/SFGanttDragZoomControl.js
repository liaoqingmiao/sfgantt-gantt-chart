	/**
	这是一个甘特图功能控件，本控件实现在拖动甘特图的日历层的时候，进行甘特图图表的缩放操作
	@private
	@extends SFGanttControl
	@class
	*/
	function SFGanttDragZoomControl()
	{
	}
	SFGanttDragZoomControl.prototype=new window.SFGanttControl();
	/**
	@private
	功能控件的初始化，每个插件的实现都会重写此方法
	@param {SFGantt} gantt
	@returns {Bool} 如果初始化成功，返回true,否则返回false
	*/
	SFGanttDragZoomControl.prototype.initialize=function(gantt)
	{
		if(gantt.disableDragZoom || !gantt.getLayout){return false;}
		var container=gantt.getLayout("mapHead");
		if(!container){return false;}
		SFGlobal.setCursor(container,"col-resize");
		this.gantt=gantt;
		this.container=container;
		this.listeners=[
			SFDragObject.setup(container,SFEvent.getCallback(this,this.onMove),{interval:32})
		];
		return true;
	}
	/**
	@private
	在拖拽缩放图表的过程之中持续触发的函数
	@param {Number[]} startPoint 拖拽起始点位置
	@param {Number[]} point 拖拽当前点位置
	@param {String} type 当前触发的类型
	*/
	SFGanttDragZoomControl.prototype.onMove=function(sp,lp,type)
	{
		if(type=="start"){this.startScale=this.gantt.getScale();}
		if(lp[0]>1)
		{
			var scale=this.startScale*sp[0]/lp[0];
			this.gantt.setScale(scale);
		}
	}
	window.SFGanttDragZoomControl=SFGanttDragZoomControl;