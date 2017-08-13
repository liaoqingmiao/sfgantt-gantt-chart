	/**
	甘特图上的时间线对象
	@extends SFGanttControl
	@param {Date} time 时间
	@param {Bool} dragable 是否允许拖动该时间线
	@param {Json} style 时间线的显示CSS样式
	@class
	*/
	function SFGanttTimeLine(time,dragable,style)
	{
		SFGlobal.setProperty(this,{time:time,dragable:dragable,style:style});
	}
	SFGanttTimeLine.prototype=new window.SFGanttControl();
	/**
	@private
	功能控件的初始化，每个插件的实现都会重写此方法
	@param {SFGantt} gantt
	@returns {Bool} 如果初始化成功，返回true,否则返回false
	*/
	SFGanttTimeLine.prototype.initialize=function(gantt)
	{
		if(!gantt.getTimePanel){return false;}
		var container=gantt.getTimePanel()
		if(!container){return false;}
		gantt.addTimeLine=SFEvent.getCallback(gantt,SFGanttTimeLine.addTimeLine);
		if(!this.time){return false;}
		this.gantt=gantt;
		SFConfig.applyProperty(this,gantt.config.getConfigObj("SFGanttTimeLine"));
		//分割条的任务显示层
		var div=this.div=gantt.container.ownerDocument.createElement('div');
		SFGlobal.setProperty(div.style,this.lineStyle);
		SFGlobal.setProperty(div.style,this.style);
		SFGlobal.setProperty(div.style,{position:'absolute',fontSize:'0px',left:'-1px',top:'0px',height:'100%',zIndex:200});
		container.appendChild(div);
		this.listeners=[
			SFEvent.bind(gantt,"afterscalechange",this,this.onMove)
		];
		if(this.dragable)
		{
			SFGlobal.setCursor(div,"col-resize");
			this.listeners.push(SFDragObject.setup(div,SFEvent.getCallback(this,this.onDrag),{container:container}));
		}
		this.onMove();
		return true;
	}
	/**
	@private
	在甘特图移动时移动时间线
	*/
	SFGanttTimeLine.prototype.onMove=function()
	{
		var gantt=this.gantt,scale=gantt.getScale(),startTime=gantt.getStartTime();
		if(!scale || !startTime){return;}
		this.div.style.left=gantt.getTimePanelPosition(this.time)+'px';
	}
	/**
	设置时间线的时间，实际上就是移动时间线
	@param {Date} time
	*/
	SFGanttTimeLine.prototype.moveTo=function(time)
	{
		this.time=time;
		this.onMove();
	}
	/**
	@private
	在拖拽时间线的过程之中持续触发的函数
	@param {Number[]} sp 拖拽起始点位置
	@param {Number[]} lp 拖拽当前点位置
	@param {String} type 当前触发的类型
	*/
	SFGanttTimeLine.prototype.onDrag=function(sp,lp,type)
	{
		if(type=="start"){this.dragStart=this.time.valueOf();}
		var gantt=this.gantt,time=new Date(this.dragStart+(lp[0]-sp[0])*this.gantt.getScale())
		this.moveTo(time);
		if(gantt.getTooltip)
		{
			var tooltip=gantt.getTooltip(),tpPosition=SFEvent.getPageOffset(gantt.getTimePanel(),gantt.getContainer());
			tooltip.setContent(this.div.ownerDocument.createTextNode(SFGlobal.getDateString(time,this.tooltipFormat)));
			tooltip.show([lp[0]+tpPosition[0],lp[1]+tpPosition[1]]);
		}
	}
	/**
	在甘特图上显示一条时间线，可以添加多条
	@name SFGantt.prototype.addTimeLine
	@function
	@param {Date} time 时间
	@param {Bool} dragable 是否允许拖动该时间线
	@param {Json} style 一个简单对象，包含该时间线显示的样式，例如{borderStyle:'dashed',borderColor:'green'}
	@returns {SFGanttTimeLine}
	*/
	SFGanttTimeLine.addTimeLine=function(time,dragable,style)
	{
		var line=new SFGanttTimeLine(time,dragable,style);
		this.addControl(line);
		return line;
	}
	window.SFGanttTimeLine=SFGanttTimeLine;