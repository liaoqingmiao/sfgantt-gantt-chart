	/**
	这是一个甘特图功能控件，本控件是用来显示甘特图的日历分割线，依赖日历控件SFGanttCalendarControl、布局控件SFGanttLayoutControl
	@private
	@extends SFGanttControl
	@class
	*/
	function SFGanttTimeSegmentation()
	{
	}
	SFGanttTimeSegmentation.prototype=new window.SFGanttControl();
	/**
	@private
	功能控件的初始化，每个插件的实现都会重写此方法
	@param {SFGantt} gantt
	@returns {Bool} 如果初始化成功，返回true,否则返回false
	*/
	SFGanttTimeSegmentation.prototype.initialize=function(gantt)
	{
		if(gantt.disableTimeSegmentation || !gantt.getTimePanel || !gantt.getCalList){return false;}
		var container=gantt.getTimePanel();
		if(!container){return false;}
		SFConfig.applyProperty(this,gantt.config.getConfigObj("SFGanttTimeSegmentation"));
		this.gantt=gantt;
		//分割条的任务显示层
		var div=this.div=gantt.container.ownerDocument.createElement('div');
		SFGlobal.setProperty(div.style,{position:'absolute',fontSize:'0px',left:'0px',top:'0px',height:'100%',width:'100%',zIndex:20});
		container.appendChild(div);
		this.listeners=[
			SFEvent.bind(gantt,"initialize",this,this.reDraw),
			SFEvent.bind(gantt,"layoutchange",this,this.reDraw),
			SFEvent.bind(gantt,"afterscalechange",this,this.reDraw),
			SFEvent.bind(gantt,"move",this,this.reDraw)
		];
		this.reDraw();
		return true;
	}
	/**
	@private
	在地图缩放等级变化时执行的操作
	*/
	SFGanttTimeSegmentation.prototype.reDraw=function()
	{
		var gantt=this.gantt,cals=gantt.getCalList();
		if(!cals ||!cals[this.calIndex]){return;}
		this.showSegmentations(gantt.getScale(),gantt.getStartTime().valueOf(),cals[this.calIndex]);
	}
	/**
	@private
	显示日历分隔线
	@param {Number} scale 当前甘特图的缩放比例
	@param {Date} startTime 当前甘特图的起始时间
	@param {SFGanttCalendarItem} cal 日历项
	*/
	SFGanttTimeSegmentation.prototype.showSegmentations=function(scale,startTime,cal)
	{
		if(this.cal!=cal || !this.drawStart || Math.abs(startTime-this.drawStart)/scale>10000)//如果缩放等级已经变化或者距离绘制起点像素值大于1万像素
		{
			this.clear();
			SFGlobal.setProperty(this,{cal:cal,drawStart:startTime,scale:scale});
			this.div.style.left=this.gantt.getTimePanelPosition(startTime)+"px";
		}
		if(this.scale!=scale)
		{
			for(var child=this.div.firstChild;child;child=child.nextSibling)
			{
				child.style.left=(child.sTime-this.drawStart)/scale+1+"px";
			}
			this.div.style.left=this.gantt.getTimePanelPosition(this.drawStart)+"px";
			this.scale=scale;
		}
		var endTime=startTime+this.div.offsetWidth*scale;//需要显示的结束时间
		var calDiv=this.div;
		var osTime=calDiv.firstChild?calDiv.firstChild.sTime:Number.MAX_VALUE;
		var oeTime=calDiv.lastChild?calDiv.lastChild.eTime:Number.MIN_VALUE;
		if(startTime>(calDiv.firstChild?calDiv.firstChild.eTime:Number.MAX_VALUE))//说明左边可能有多余的内容，删除
		{
			while(calDiv.firstChild && calDiv.firstChild.eTime<startTime)
			{
				SFEvent.deposeNode(calDiv.firstChild);
			}
			osTime=calDiv.firstChild?calDiv.firstChild.sTime:Number.MAX_VALUE
		}
		if((calDiv.lastChild?calDiv.lastChild.sTime:Number.MIN_VALUE)>endTime)//说明右边可能有多余的内容，删除
		{
			while(calDiv.lastChild && calDiv.lastChild.sTime>endTime)
			{
				SFEvent.deposeNode(calDiv.lastChild);
			}
			oeTime=calDiv.lastChild?calDiv.lastChild.eTime:Number.MIN_VALUE
		}
		if(startTime<osTime)//说明左侧需要添加内容
		{
			this.addSegmentation(startTime,Math.min(osTime,endTime),cal,calDiv,scale,-1);
			osTime=calDiv.firstChild?calDiv.firstChild.sTime:Number.MAX_VALUE;
			oeTime=calDiv.lastChild?calDiv.lastChild.eTime:Number.MIN_VALUE;
		}
		if(oeTime<endTime)//说明左侧需要添加内容
		{
			this.addSegmentation(Math.max(oeTime,startTime),endTime,cal,calDiv,scale,1);
		}
	}
	/**
	@private
	显示指定范围内的日历分隔线
	@param {Number} scale 当前甘特图的缩放比例
	@param {Date} startTime 显示范围的起始时间
	@param {Date} endTime 显示范围的结束时间
	@param {SFGanttCalendarItem} cal 日历项
	@param {HtmlElement} calDiv 显示日历分隔线的层
	@param {Number} scale 当前甘特图的缩放比例
	@param {Number} position 在calDiv之中添加的方式，-1代表在前面添加，1代表在后面添加
	*/
	SFGanttTimeSegmentation.prototype.addSegmentation=function(startTime,endTime,cal,calDiv,scale,position)
	{
		var sTime=parseInt(cal.getFloorTime(new Date(startTime)).valueOf());//需要显示的单位起始时间
		var lastAdd=null;
		while(sTime<endTime)
		{
			var eTime=parseInt(cal.getNextTime(new Date(sTime)).valueOf());
			var div=this.div.ownerDocument.createElement("div");
			SFGlobal.setProperty(div,{sTime:sTime,eTime:eTime});
			SFGlobal.setProperty(div.style,{position:'absolute',left:(sTime-this.drawStart)/scale+1+'px',top:'0px',width:'0px',height:'100%',borderLeft:'dotted 1px #808080'});
			SFGlobal.setProperty(div.style,this.lineStyle);
			if(position==-1)
			{
				if(lastAdd==null)
				{
					calDiv.insertBefore(div,calDiv.firstChild);
				}
				else if(lastAdd.nextSibling==null)
				{
					calDiv.appendChild(div);
				}
				else
				{
					calDiv.insertBefore(div,lastAdd.nextSibling);
				}
			}
			else
			{
				calDiv.appendChild(div);
			}
			lastAdd=div;
			sTime=eTime;
		}
	}
	/**
	@private
	清除所有已绘制的日历分隔线
	*/
	SFGanttTimeSegmentation.prototype.clear=function()
	{
		SFEvent.deposeNode(this.div,true);
	}
	window.SFGanttTimeSegmentation=SFGanttTimeSegmentation;