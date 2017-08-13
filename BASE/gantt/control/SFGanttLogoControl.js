	/**
	这是一个甘特图功能控件，本控件实现在甘特图上显示LOGO
	@private
	@extends SFGanttControl
	@class
	*/
	function SFGanttLogoControl()
	{
	}
	SFGanttLogoControl.prototype=new window.SFGanttControl();
	/**
	功能控件的初始化，每个插件的实现都会重写此方法
	@private
	@param {SFGantt} gantt
	@returns {Bool} 如果初始化成功，返回true,否则返回false
	*/
	SFGanttLogoControl.prototype.initialize=function(gantt)
	{
		this.gantt=gantt;
		var logo=this.div=gantt.createImage("logo",{size:[gantt.idCellWidth,gantt.headHeight]});
		SFGlobal.setProperty(logo.style,{position:'absolute',zIndex:200});
		if(gantt.setTooltip){gantt.setTooltip(logo,SFEvent.getCallback(this,this.getLogoTooltip));}
		gantt.container.appendChild(logo);
		if(gantt.setContextMenu){gantt.setContextMenu(logo,function(menu){menu.type="logo";return true});}
		return true;
	}
	/**
	鼠标在LOGO上滑过时显示提示信息
	@private
	@param {SFGanttTooltipControl} tooltip 甘特图的实时提示控件
	@param {Event} e 浏览器的鼠标事件
	@returns {Bool} 如果需要显示提示，返回true,否则返回false
	*/
	SFGanttLogoControl.prototype.getLogoTooltip=function(tooltip)
	{
		if(tooltip && tooltip.bindObject==this){return false;}
		var div=this.div.ownerDocument.createElement("div")
		div.innerHTML='<%Copyright%>';
		tooltip.setContent(div);
		tooltip.bindObject=this;
		return true;
	}
	window.SFGanttLogoControl=SFGanttLogoControl;