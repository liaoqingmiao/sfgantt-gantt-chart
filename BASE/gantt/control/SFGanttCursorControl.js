	/**
	这是一个甘特图功能控件，本控件用来扩展甘特图的一个功能，只是给甘特图附加一个setCursor的方法
	只有在设置带图标文件的鼠标样式的时候，才需要调用甘特图的setCursor方法
	@private
	@extends SFGanttControl
	@class
	*/
	function SFGanttCursorControl()
	{
	}
	SFGanttCursorControl.prototype=new window.SFGanttControl();
	/**
	@private
	功能控件的初始化，每个插件的实现都会重写此方法
	@param {SFGantt} gantt
	@returns {Bool} 如果初始化成功，返回true,否则返回false
	*/
	SFGanttCursorControl.prototype.initialize=function(gantt)
	{
		if(gantt.disableCursor){return false;}
		this.gantt=gantt;
		gantt.setCursor=SFEvent.getCallback(gantt,SFGanttCursorControl.setCursor);
		return true;
	}
	/**
	设置层的鼠标样式
	@private
	@name SFGantt.prototype.setCursor
	@function
	@param {HtmlElement} obj
	@param {String} style 鼠标样式名称或URL
	*/
	SFGanttCursorControl.setCursor=function(obj,style)
	{
		if(style.indexOf(",")>0)
		{
			var styles=style.split(",");
			for(var i=0;i<styles.length;i++)
			{
				if(this.setCursor(obj,styles[i])){return true;}
			}
			return false;
		}
		try
		{
			if(style.toLowerCase().indexOf(".cur")>0)
			{
				style="url("+this.imgPath+"cursor/"+style+"),auto";
			}
			style=style.toLowerCase();
			if(style=="hand" && !document.all)
			{
				style="pointer";
			}
			obj.style.cursor = style;
			return true;
		}
		catch(e){return false;}
	}
	/**
	@private
	在功能控件被移除时执行的方法
	*/
	SFGanttCursorControl.prototype.remove=function()
	{
		var gantt=this.gantt;
		delete gantt.setCursor;
		delete this.gantt
	}
	window.SFGanttCursorControl=SFGanttCursorControl;