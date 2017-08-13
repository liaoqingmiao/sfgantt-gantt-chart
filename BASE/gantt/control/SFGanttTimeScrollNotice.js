	/**
	这是一个甘特图功能控件，本控件用来实现甘特图图表滚动时显示当前时间提示的功能
	@private
	@extends SFGanttControl
	@class
	*/
	function SFGanttTimeScrollNotice(gantt,container)
	{
	}
	SFGanttTimeScrollNotice.prototype=new window.SFGanttControl();
	/**
	@private
	功能控件的初始化，每个插件的实现都会重写此方法
	@param {SFGantt} gantt
	@returns {Bool} 如果初始化成功，返回true,否则返回false
	*/
	SFGanttTimeScrollNotice.prototype.initialize=function(gantt,container)
	{
		if(gantt.disableTimeScrollNotice || !gantt.getLayout){return false;}
		SFConfig.applyProperty(this,gantt.config.getConfigObj("SFGanttTimeScrollNotice"));
		this.gantt=gantt;
		//分割条的任务显示层
		this.div=container.ownerDocument.createElement('div');
		SFGlobal.setProperty(this.div.style,{position:'absolute',zIndex:400,display:'none',left:'100px'});
		SFGlobal.setProperty(this.div.style,this.divStyle);
		container.appendChild(this.div);
		this.listeners=[
			SFEvent.bind(gantt,"move",this,this.onMove),
			SFEvent.bind(gantt,"layoutchange",this,this.onResize)
		];
		return true;
	}
	/**
	@private
	在甘特图起始时间变化的时候的响应
	@param {Date} time 甘特图的起始时间
	*/
	SFGanttTimeScrollNotice.prototype.onMove=function(time)
	{
		if(!this.timeout){this.timeout=window.setInterval(SFEvent.getCallback(this,this.onTime),64);}
		this.lastTime=time;
		this.idleTimes=0
		this.changed=true;
	}
	/**
	@private
	在甘特图起始时间变化的时候延时显示时间提示
	*/
	SFGanttTimeScrollNotice.prototype.onTime=function()
	{
		if(!this.changed)
		{
			this.idleTimes++;
			if(this.idleTimes>4)
			{
				window.clearInterval(this.timeout);
				this.div.style.display="none";
				delete this.timeout
			}
			return;
		}
		this.changed=false;
		this.div.style.display="";
		this.div.innerHTML=SFGlobal.getDateString(this.lastTime,this.dateFormat);
	}
	/**
	@private
	在甘特图大小变化的时候调整显示提示的位置
	*/
	SFGanttTimeScrollNotice.prototype.onResize=function()
	{
		var mapDiv=this.gantt.getLayout("mapBody");
		this.div.style.left=(SFEvent.getPageOffset(mapDiv,this.gantt.getContainer())[0]+1)+"px"
		this.div.style.bottom=this.gantt.footHeight+5+"px"
	}
	window.SFGanttTimeScrollNotice=SFGanttTimeScrollNotice;