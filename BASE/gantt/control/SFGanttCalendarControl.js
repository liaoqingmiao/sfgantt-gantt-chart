	/**
	这是一个甘特图功能控件，本控件用来管理日历的显示，仅仅实现一个功能，就是在缩放等级变化的时候确定当前显示什么日历最合适，也就是实现getCalList方法
	@private
	@extends SFGanttControl
	@class
	*/
	function SFGanttCalendarControl()
	{
	}
	SFGanttCalendarControl.prototype=new window.SFGanttControl();
	/**
	@private
	功能控件的初始化，每个插件的实现都会重写此方法
	@param {SFGantt} gantt
	@returns {Bool} 如果初始化成功，返回true,否则返回false
	*/
	SFGanttCalendarControl.prototype.initialize=function(gantt)
	{
		this.gantt=gantt;
		var formats=gantt.config.getConfig("SFGanttCalendarItem/formats");
		var items={
			Minute15:	new SFGanttCalendarItem("Minute",	15,	formats.Minute15),
			Hour:		new SFGanttCalendarItem("Hour",		1,	formats.Hour),
			Hour2:		new SFGanttCalendarItem("Hour",		2,	formats.Hour2),
			Hour6:		new SFGanttCalendarItem("Hour",		6,	formats.Hour6),
			Dat:		new SFGanttCalendarItem("Dat",		1,	formats.Dat),
			Dat1:		new SFGanttCalendarItem("Dat",		1,	formats.Dat1),
			Day:		new SFGanttCalendarItem("Day",		1,	formats.Day),
			Day3:		new SFGanttCalendarItem("Dat",		3,	formats.Day3),
			Day7:		new SFGanttCalendarItem("Day",		7,	formats.Day7),
			Week:		new SFGanttCalendarItem("Week",		1,	formats.Week),
			Month:		new SFGanttCalendarItem("Month",	1,	formats.Month),
			Month1:		new SFGanttCalendarItem("Month",	1,	formats.Month1),
			Quarter:	new SFGanttCalendarItem("Month",	3,	formats.Quarter),
			Quarter1:	new SFGanttCalendarItem("Month",	3,	formats.Quarter1),
			Quarter2:	new SFGanttCalendarItem("Month",	6,	formats.Quarter2),
			Year:		new SFGanttCalendarItem("Year",		1,	formats.Year),
			Year1:		new SFGanttCalendarItem("Year",		1,	formats.Year1),
			Year5:		new SFGanttCalendarItem("Year",		5,	formats.Year5),
			Year10:		new SFGanttCalendarItem("Year",		10,	formats.Year10)
		};
		this.levels=[
			{scale:	3*60000/6,	cals:	[items.Minute15,items.Hour,	items.Dat]},	//每3分钟
			{scale:	30*60000/6,	cals:	[items.Hour2,	items.Dat,	items.Week]},	//每30分钟
			{scale:	3600000/6,	cals:	[items.Hour6,	items.Dat,	items.Week]},	//每1小时
			{scale:	4*3600000/6,	cals:	[items.Day,	items.Week,	items.Month]},	//每4小时
			{scale:	12*3600000/6,	cals:	[items.Day3,	items.Month,	items.Quarter]},//每12小时
			{scale:	24*3600000/6,	cals:	[items.Day7,	items.Month,	items.Year]},	//每1天
			{scale:	96*3600000/6,	cals:	[items.Month1,	items.Quarter,	items.Year]},	//每4天
			{scale:	192*3600000/6,	cals:	[items.Month1,	items.Year,	items.Year]},	//每8天
			{scale:	576*3600000/6,	cals:	[items.Quarter1,items.Year,	items.Year5]},	//每24天
			{scale:	1728*3600000/6,	cals:	[items.Quarter2,items.Year1,	items.Year10]}	//每72天
		];
		SFGlobal.setProperty(gantt,{
			getCalLevels:SFEvent.getCallback(this,this.getCalLevels),
			setCalLevels:SFEvent.getCallback(this,this.setCalLevels),
			getCalList:SFEvent.getCallback(this,this.getCalList)
		});
		this.listeners=[
			SFEvent.bind(gantt,"initialize",this,this.onScaleChange),
			SFEvent.bind(gantt,"afterscalechange",this,this.onScaleChange)
		];
		this.onScaleChange();
		return true;
	}
	/**
	设置甘特图的日历显示等级
	@name SFGantt.prototype.setCalLevels
	@private
	@function
	@param {Json[]} levels
	*/
	SFGanttCalendarControl.prototype.setCalLevels=function(levels)
	{
		this.levels=levels
	}
	/**
	获取甘特图的日历显示等级
	@name SFGantt.prototype.getCalLevels
	@private
	@function
	@returns {Json[]}
	*/
	SFGanttCalendarControl.prototype.getCalLevels=function()
	{
		return this.levels
	}
	/**
	返回当前甘特图使用的日历列表
	@name SFGantt#getCalList
	@private
	@function
	@returns {SFGanttCalendarItem[]}
	*/
	SFGanttCalendarControl.prototype.getCalList=function()
	{
		return this.calList;
	}
	/**
	在缩放等级变化的时候自动选择当前的日历列表
	@private
	*/
	SFGanttCalendarControl.prototype.onScaleChange=function()
	{
		var scale=this.gantt.getScale(),levels=this.levels,i;
		if(!scale){return;}
		for(i=levels.length-1;i>=0;i--){if(scale>levels[i].scale){i++;break;}}
		i=Math.min(Math.max(i,0),levels.length-1)
		this.calList=levels[i].cals;
	}
	/**
	@private
	在功能控件被移除时执行的方法
	*/
	SFGanttCalendarControl.prototype.remove=function()
	{
		var gantt=this.gantt;
		delete gantt.getCalList
		SFGanttControl.prototype.remove.apply(this,arguments);
	}

	/**
	这个对象代表甘特图之中的日历项，通常来讲，一个日历项代表甘特图上日历一行的显示
	@private
	@param {String} unit 日历项的单元名称，当前支持如下单元
	<ul>
		<li>Minute	:	分钟</li>
		<li>Hour	:	小时</li>
		<li>Dat		:	日期，按月显示</li>
		<li>Day		:	日期，按星期显示</li>
		<li>Week	:	周</li>
		<li>Month	:	月</li>
		<li>Year	:	年</li>
	</ul>
	@param {Number} num 数目，例如这个日历是以8个小时为一段，则unit参数为"Hour",num参数为8
	@param {String} format 日历段的显示格式
	@class
	*/
	function SFGanttCalendarItem(unit,num,format)
	{
		this.unit=unit;
		this.number=num;
		this.format=format;
	}
	/**
	日历段的显示文本
	@param {Date} time 当前的时间戳记
	@returns {String}
	@private
	*/
	SFGanttCalendarItem.prototype.showHead=function(time)
	{
		var config=window._SFGantt_config.SFGlobal;
		return SFGlobal.getDateString(time,this.format,config);
	}
	/**
	获得该时间在日历上的对应起点
	@param {Date} time 当前的时间戳记
	@returns {Date}
	@private
	*/
	SFGanttCalendarItem.prototype.getFloorTime=function(time)
	{
		switch(this.unit)
		{
			case "Minute":
				var flag=time.getMinutes()%this.number;
				return new Date(time.getFullYear(),time.getMonth(),time.getDate(),time.getHours(),time.getMinutes()-flag);
			case "Hour":
				var flag=time.getHours()%this.number;
				return new Date(time.getFullYear(),time.getMonth(),time.getDate(),time.getHours()-flag);
			case "Dat":
				var flag=(time.valueOf()-time.getTimezoneOffset()*60*1000)%(this.number*24*60*60*1000);
				return new Date(time.valueOf()-flag);
			case "Day":
				var flag=time.getDay()%this.number;
				var newTime=new Date(time.valueOf()-flag*24*60*60*1000);
				return new Date(newTime.getFullYear(),newTime.getMonth(),newTime.getDate());
			case "Week":
				var flag=time.getDay();
				var newTime=new Date(time.valueOf()-flag*24*60*60*1000);
				return new Date(newTime.getFullYear(),newTime.getMonth(),newTime.getDate());
			case "Month":
				var flag=time.getMonth()%this.number;
				return new Date(time.getFullYear(),time.getMonth()-flag);
			case "Year":
				var flag=time.getFullYear()%this.number;
				return new Date(time.getFullYear()-flag);
			default:
				return time;
		}
	}
	/**
	获得该时间在日历上的下一点
	@param {Date} time 当前的时间戳记
	@returns {Date}
	@private
	*/
	SFGanttCalendarItem.prototype.getNextTime=function(time)
	{
		switch(this.unit)
		{
			case "Minute":
				return new Date(time.valueOf()+this.number*60*1000);
			case "Hour":
				return new Date(time.valueOf()+this.number*60*60*1000);
			case "Dat":
			case "Day":
				return new Date(time.valueOf()+this.number*24*60*60*1000);
			case "Week":
				return new Date(time.valueOf()+this.number*7*24*60*60*1000);
			case "Month":
				var year=time.getFullYear(),month=time.getMonth()+this.number;
				if(month==12)
				{
					year++;
					month=0;
				}
				return new Date(year,month);
			case "Year":
				var year=time.getFullYear()+this.number;
				var t=new Date(0);
				t.setYear(year);
				return t;
			default:
				return time;
		}
	}
	window.SFGanttCalendarControl=SFGanttCalendarControl;
	window.SFGanttCalendarItem=SFGanttCalendarItem;