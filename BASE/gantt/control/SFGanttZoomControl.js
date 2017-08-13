	/**
	这是一个甘特图功能控件，本控件实现甘特图的缩放级别功能
	@private
	@extends SFGanttControl
	@class
	*/
	function SFGanttZoomControl()
	{
	}
	SFGanttZoomControl.prototype=new window.SFGanttControl();
	/**
	功能控件的初始化，每个插件的实现都会重写此方法
	@private
	@param {SFGantt} gantt
	@returns {Bool} 如果初始化成功，返回true,否则返回false
	*/
	SFGanttZoomControl.prototype.initialize=function(gantt,container)
	{
		this.gantt=gantt;
		this.levels=[
			3*60000/6,	//每3分钟
			30*60000/6,	//每30分钟
			3600000/6,	//每1小时
			4*3600000/6,	//每4小时
			12*3600000/6,//每12小时
			24*3600000/6,	//每1天
			96*3600000/6,	//每4天
			192*3600000/6,	//每8天
			576*3600000/6,	//每24天
			1728*3600000/6	//每72天
		];
		SFGlobal.setProperty(gantt,{
			setZoomLevels:SFEvent.getCallback(this,this.setZoomLevels),
			getZoomScale:SFEvent.getCallback(this,this.getZoomScale),
			zoomIn:SFEvent.getCallback(this,this.zoomIn),
			zoomOut:SFEvent.getCallback(this,this.zoomOut),
			zoomTo:SFEvent.getCallback(this,this.zoomTo),
			getZoom:SFEvent.getCallback(this,this.getZoom),
			show:SFEvent.getCallback(this,this.show)
		});
		gantt.showMap=gantt.show;
		this.listeners=[
			SFEvent.bind(gantt,"initialize",this,this.onScaleChange),
			SFEvent.bind(gantt,"afterscalechange",this,this.onScaleChange)
		];
		return true;
	}
	/**
	根据缩放比例返回最近的缩放级别的比例
	@name SFGantt.prototype.getZoomScale
	@private
	@function
	@param {Number} scale
	@param {Number} [dir=0] 如果为-1代表只向上查找，为1代表只向下查找
	@returns {Number} 返回缩放比例
	*/
	SFGanttZoomControl.prototype.getZoomScale=function(scale,dir)
	{
		return this.levels[this.getZoomIndex(scale,dir)];
	}
	/**
	设置甘特图的缩放等级列表
	@name SFGantt.prototype.setZoomLevels
	@private
	@function
	@param {Number[]} levels
	*/
	SFGanttZoomControl.prototype.setZoomLevels=function(levels)
	{
		this.levels=levels;
	}
	/**
	根据缩放比例返回最近的缩放级别
	@private
	@param {Number} scale
	@param {Number} [dir=0] 如果为-1代表只向上查找，为1代表只向下查找
	@returns {Number} 返回缩放级别
	*/
	SFGanttZoomControl.prototype.getZoomIndex = function(scale,dir)
	{
		dir=dir?dir:0;
		var levels=this.levels,len=levels.length;
		for(var i=0;i<len;i++)
		{
			var level=levels[i];
			if(scale<=level)//如果已经大于此级别的倍数，则要么是这个级别，要么是上一个级别
			{
				if(i>0 && ((dir==1) || (dir==0 && scale/(levels[i-1])<level/scale)))
				{
					return i-1;
				}
				return i;
			}
		}
		return len-1;
	}
	/**
	在甘特图的缩放比例变化时自动更新甘特图的缩放级别
	@private
	*/
	SFGanttZoomControl.prototype.onScaleChange=function()
	{
		this.zoomIndex=this.getZoomIndex(this.gantt.getScale());
	}
	/**
	放大图表
	@name SFGantt.prototype.zoomIn
	@private
	@function
	*/
	SFGanttZoomControl.prototype.zoomIn=function(){this.zoomTo(this.zoomIndex-1);}//放大
	/**
	缩小图表
	@name SFGantt.prototype.zoomOut
	@private
	@function
	*/
	SFGanttZoomControl.prototype.zoomOut=function(){this.zoomTo(this.zoomIndex+1);}//缩小
	/**
	将图表的时间轴缩放等级变化到指定的级别
	@name SFGantt.prototype.zoomTo
	@param {Number} zoomIndex 甘特图显示的缩放等级，请参考{@link SFGantt#show}
	@private
	@function
	*/
	SFGanttZoomControl.prototype.zoomTo=function(zoomIndex)
	{
		if(!this.levels[zoomIndex]){return;}
		var oZoom=this.zoomIndex;
		this.zoomIndex=zoomIndex;
		this.gantt.setScale(this.levels[zoomIndex]);
		/** 
			@event
			@name SFGantt#zoom
			@description 在甘特图缩放级别变化后触发
			@param {Number} zoomIndex 新缩放级别.
			@param {Number} oZoom 原缩放级别.
		 */
		SFEvent.trigger(this,"zoom",[zoomIndex,oZoom]);
	}
	/**
	返回当前甘特图的缩放级别
	@name SFGantt.prototype.getZoom
	@returns {Number} 甘特图显示的缩放等级，请参考{@link SFGantt#show}
	@function
	*/
	SFGanttZoomControl.prototype.getZoom=function()
	{
		return this.zoomIndex;
	}
	/**
	甘特图的显示函数，调用这个函数开始显示甘特图
	@name SFGantt.prototype.show
	@function
	@param {Date} [time] 甘特图显示的起始时间,也就是甘特图打开的时候默认显示的时间轴最左侧的时间点。如果不设置，则自动为根任务的起始时间
	@param {Number} [zoomIndex=8] 甘特图显示的缩放等级，默认甘特图支持从0-8的9个等级
		<table cellspacing="1" border="1" borderColor="Gray">
		<tr><td>编号</td><td>日历上层单位</td><td>日历下层单位</td></tr>
		<tr><td>0</td><td>1小时</td><td>15分钟</td></tr>
		<tr><td>1</td><td>1天</td><td>2小时</td></tr>
		<tr><td>2</td><td>1天</td><td>6小时</td></tr>
		<tr><td>3</td><td>1周</td><td>1天</td></tr>
		<tr><td>4</td><td>1月</td><td>3天</td></tr>
		<tr><td>5</td><td>1月</td><td>1周</td></tr>
		<tr><td>6</td><td>1季度</td><td>1月</td></tr>
		<tr><td>7</td><td>1年</td><td>1月</td></tr>
		<tr><td>8</td><td>1年</td><td>1季度</td></tr>
		</table>
	*/
	SFGanttZoomControl.prototype.show=function(startTime,zoomIndex)
	{
		var scale=this.levels[zoomIndex];
		scale=scale?scale:zoomIndex;
		var gantt=this.gantt;
		if(startTime){gantt.setStartTime(startTime);}
		if(scale){gantt.setScale(scale);}
	}
	/**
	在功能控件被移除时执行的方法
	@private
	*/
	SFGanttZoomControl.prototype.remove=function()
	{
		var gantt=this.gantt;
		delete gantt.getZoomScale;
		delete gantt.showMap
		delete gantt.zoomIn
		delete gantt.zoomOut
		delete gantt.zoomTo
		delete gantt.getZoom;
		delete gantt.show
		SFGanttControl.prototype.remove.apply(this,arguments);
	}
	window.SFGanttZoomControl=SFGanttZoomControl;