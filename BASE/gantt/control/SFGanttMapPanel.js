	/**
	这是一个甘特图功能控件，本控件实现图表的绘制层
	@private
	@extends SFGanttControl
	@class
	*/
	function SFGanttMapPanel()
	{
	}
	SFGanttMapPanel.prototype=new window.SFGanttControl();
	/**
	@private
	功能控件的初始化，每个插件的实现都会重写此方法
	@param {SFGantt} gantt
	@returns {Bool} 如果初始化成功，返回true,否则返回false
	*/
	SFGanttMapPanel.prototype.initialize=function(gantt)
	{
		if(!gantt.getLayout || !gantt.getStartTime || !gantt.getLayout("mapBody")){return false;}
		var container=this.div=gantt.container.ownerDocument.createElement("div");
		SFGlobal.setProperty(container.style,{position:'relative',left:'0px',top:'0px'});
		gantt.getLayout("mapBody").appendChild(container);
		if(!container){return false;}
		this.gantt=gantt;
		gantt.getMapPanel=SFEvent.getCallback(this,this.getMapPanel)
		gantt.getMapPanelPosition=SFEvent.getCallback(this,this.getMapPanelPosition);
		gantt.getTimeByMapPanelPosition=SFEvent.getCallback(this,this.getTimeByMapPanelPosition);
		this.listeners=[
			SFEvent.bind(gantt,"initialize",this,this.onGanttInit),
			SFEvent.bind(gantt,"afterstarttimechange",this,this.onTimeChange),
			SFEvent.bind(gantt,"afterscalechange",this,this.onTimeChange)
		];
		if(!gantt.disableMapDrag)
		{
			this.listeners=this.listeners.concat(SFDragObject.setup(container,SFEvent.getCallback(this,this.onMove),{container:gantt.getContainer()}));
		}
		return true;
	}
	/**
	@private
	在甘特图初始化时初始化绘制基准时间
	*/
	SFGanttMapPanel.prototype.onGanttInit=function()
	{
		this.drawStart=this.gantt.getStartTime();
		this.onTimeChange();
	}
	/**
	@private
	在甘特图起始时间变化移动图表层
	@param {Date} time 当前甘特图的起始时间
	*/
	SFGanttMapPanel.prototype.onTimeChange=function(time)
	{
		this.div.style.left=-Math.round(this.gantt.getStartTime()-this.drawStart)/this.gantt.getScale()+"px";
	}
	/**
	获得指定的时间点在甘特图图表层上的相对位置
	@name SFGantt.prototype.getMapPanelPosition
	@private
	@function
	@param {Date} time 当前甘特图的起始时间
	@returns {Number} 以像素为单位的横向相对位置
	*/
	SFGanttMapPanel.prototype.getMapPanelPosition=function(time)
	{
		if(!time){return 0;}
		return Math.round(time-this.drawStart)/this.gantt.getScale();
	}
	/**
	根据甘特图图表层上的相对位置获取对应的时间
	@name SFGantt.prototype.getTimeByMapPanelPosition
	@private
	@function
	@param {Number} position 甘特图图表层上的横向相对位置
	@returns {Date} 时间轴上对应的时间
	*/
	SFGanttMapPanel.prototype.getTimeByMapPanelPosition=function(position)
	{
		position=position?position:0;
		return new Date(position*this.gantt.getScale()+this.drawStart.valueOf());
	}
	/**
	获得甘特图的图表层，图表上面所有根据时间绘制的内容都是在图表层上定位的
	@name SFGantt.prototype.getMapPanel
	@private
	@function
	@returns {HtmlElement}
	*/
	SFGanttMapPanel.prototype.getMapPanel=function()
	{
		return this.div;
	}
	/**
	@private
	在图表层被拖拽的过程之中持续触发的函数
	@param {Number[]} sp 拖拽起始点位置
	@param {Number[]} lp 拖拽当前点位置
	@param {String} type 当前触发的类型
	*/
	SFGanttMapPanel.prototype.onMove=function(sp,lp,type)
	{
		var gantt=this.gantt,scrollDiv=gantt.getLayout("bodyScroll");
		if(type=="start")
		{
			this.startPosition=scrollDiv.scrollTop;
			this.startTime=gantt.getStartTime();
		}
		var scrollTop=scrollDiv.scrollTop=this.startPosition-lp[1]+sp[1];
		/** 
			@event
			@name SFGantt#scroll
			@private
			@description 在甘特图纵向滚动时触发
			@param {Number} scrollTop 甘特图当前的滚动位置.
		 */
		SFEvent.trigger(gantt,"scroll",[scrollTop]);
		gantt.setStartTime(new Date(this.startTime.valueOf()+(sp[0]-lp[0])*gantt.getScale()));
	}
	/**
	@private
	在功能控件被移除时执行的方法
	*/
	SFGanttMapPanel.prototype.remove=function()
	{
		var gantt=this.gantt;
		delete gantt.getMapPanel;
		delete gantt.getMapPanelPosition;
		delete gantt.getTimeByMapPanelPosition;
		SFGanttControl.prototype.remove.apply(this,arguments);
	}
	window.SFGanttMapPanel=SFGanttMapPanel;