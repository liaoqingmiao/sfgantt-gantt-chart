	/**
	这是一个甘特图功能控件，本控件是用来提供鼠标指向实时提示的功能支持
	@private
	@extends SFGanttControl
	@class
	*/
	function SFGanttTooltipControl()
	{
	}
	SFGanttTooltipControl.prototype=new window.SFGanttControl();
	/**
	功能控件的初始化，每个插件的实现都会重写此方法
	@private
	@param {SFGantt} gantt
	@returns {Bool} 如果初始化成功，返回true,否则返回false
	*/
	SFGanttTooltipControl.prototype.initialize=function(gantt)
	{
		if(gantt.disableTooltip){return false;}
		SFConfig.applyProperty(this,gantt.config.getConfigObj("SFTooltip"));
		var div=gantt.container.ownerDocument.createElement("div");
		SFGlobal.setProperty(div.style,{position:'absolute',zIndex:650});
		SFGlobal.setProperty(div.style,this.divStyle);
		var container=gantt.container;
		SFGlobal.setProperty(this,{gantt:gantt,div:div,container:container});
		this.setEnable(true);
		SFGlobal.setProperty(gantt,{
			getTooltip:SFEvent.getCallback(this,this.getTooltip),
			setTooltip:SFEvent.getCallback(this,this.setTooltip)
		});
		return true;
	}
	/**
	鼠标在甘特图上划过的时候进行的响应，开始准备显示提示
	@private
	@param {Event} e 浏览器鼠标事件
	*/
	SFGanttTooltipControl.prototype.onMouseOver=function(e)
	{
		var target=e.target;
		while(target)
		{
			if(target._SF_E_ && target._SF_E_ .tooltip && target._SF_E_ .tooltip(this,e))
			{
				SFEvent.cancelBubble(e);
				this.show(SFEvent.getEventRelative(e,this.container),target);
				return;
			}
			target=target.parentNode;
		}
	}
	/**
	启用或禁止所有tooltip响应
	@private
	@param {Bool} enable
	*/
	SFGanttTooltipControl.prototype.setEnable=function(enable)
	{
		if(enable && !this.listeners)
		{
			this.listeners=[
				SFEvent.bind(this.container,"mouseover",this,this.onMouseOver)
			];
		}
		else if(!enable && this.listeners)
		{
			SFEvent.removeListener(this.listeners[0]);
			delete this.listeners;
		}
	}
	/**
	设置提示的内容
	@private
	@param {HtmlElement} content
	*/
	SFGanttTooltipControl.prototype.setContent=function(content)
	{
		SFEvent.deposeNode(this.div,true);
		this.div.appendChild(content);
	}
	/**
	获取提示的内容层
	@private
	@returns {HtmlElement}
	*/
	SFGanttTooltipControl.prototype.getContent=function()
	{
		return this.div;
	}
	/**
	显示实时提示
	@private
	@param {Number[]} position 显示提示的位置，是相对于甘特图左上角的位置
	@param {HtmlElement} div 显示的提示内容
	*/
	SFGanttTooltipControl.prototype.show=function(position,div)
	{
		div=div?div:this.div;
		this.container.appendChild(this.div);
		var left=position[0]+5,top=position[1]+5;
		if(!this.position)
		{
			if(left+this.div.offsetWidth>this.container.offsetWidth){left=position[0]-this.div.offsetWidth-2;}
			if(top+this.div.offsetHeight>this.container.offsetHeight){top=position[1]-this.div.offsetHeight-2;}
		}
		SFGlobal.setProperty(this.div.style,{left:left+"px",top:top+"px"});
		this.container._ganttTip=this;
		this.hl=SFEvent.bind(div,"mouseout",this,function(e)
		{
			if(!this.listeners){return;}//暂时设置在暂停时不允许隐藏
			this.hidden();
		})
	}
	/**
	隐藏实时提示
	@private
	*/
	SFGanttTooltipControl.prototype.hidden=function()
	{
		if(this.div.parentNode==this.container)
		{
			this.container.removeChild(this.div);
		}
		this.container._ganttTip=null;
		this.bindObject=null;
		SFEvent.removeListener(this.hl);
	}
	/**
	设置在div被右键点击的时候弹出handle定义的菜单
	@name SFGantt.prototype.setTooltip
	@private
	@function
	@param {HtmlElement} div
	@param {Function} handle 确定如何显示提示的函数
	*/
	SFGanttTooltipControl.prototype.setTooltip=function(div,handle)
	{
		if(!div._SF_E_){div._SF_E_=[];}
		div._SF_E_.tooltip=handle;
	}
	/**
	返回甘特图的实时提示控件
	@name SFGantt.prototype.getTooltip
	@private
	@function
	@returns {SFGanttTooltipControl}
	*/
	SFGanttTooltipControl.prototype.getTooltip=function()
	{
		return this;
	}
	/**
	在功能控件被移除时执行的方法
	@private
	*/
	SFGanttTooltipControl.prototype.remove=function()
	{
		this.setEnable(false);
		this.hidden();
		var gantt=this.gantt;
		delete gantt.getTooltip
		delete gantt.setTooltip
		delete this.container
		SFGanttControl.prototype.remove.apply(this,arguments);
	}
	window.SFGanttTooltipControl=SFGanttTooltipControl;