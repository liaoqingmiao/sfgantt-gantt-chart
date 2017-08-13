	/**
	这是一个甘特图功能控件，本控件用来扩展甘特图的一个功能，只是给甘特图附加一个setCursor的方法
	只有在设置带图标文件的鼠标样式的时候，才需要调用甘特图的setCursor方法
	@private
	@extends SFGanttControl
	@class
	*/
	function SFGanttDrawControl()
	{
	}
	SFGanttDrawControl.prototype=new window.SFGanttControl();
	/**
	@private
	功能控件的初始化，每个插件的实现都会重写此方法
	@param {SFGantt} gantt
	@returns {Bool} 如果初始化成功，返回true,否则返回false
	*/
	SFGanttDrawControl.prototype.initialize=function(gantt)
	{
		this.gantt=gantt;
		/**
		默认的列表每一项的高度
		@name SFConfig.configItems.SFGantt_itemHeight
		@type Number
		@default 24
		*/
		this.itemHeight=gantt.itemHeight;
		this.inline=gantt.inline;
		this.hideSummary=gantt.hideSummary;
		gantt.getElementDrawObj=SFEvent.getCallback(this,this.getElementDrawObj);
		gantt.removeElementDrawObj=SFEvent.getCallback(this,this.removeElementDrawObj);
		gantt.getElementHeight=SFEvent.getCallback(this,this.getElementHeight);
		this.listeners=[SFEvent.bind(gantt,gantt.elementType.toLowerCase()+"change",this,this.onElementChange)]
		return true;
	}
	/**
	获得元素的绘制对象，一个绘制对象记录了元素在甘特图上对应的所有HTML界面元素
	@name SFGantt.prototype.getElementDrawObj
	@function
	@private
	@param {SFDataElement} element 数据元素
	@returns {Json}
	*/
	SFGanttDrawControl.prototype.getElementDrawObj=function(element)
	{
		var tagName=this.getTagName();
		if(!element[tagName])
		{
			//_height代表占用高度,height代表实际显示高度
			var _height=this.getElementHeight(element),height=(this.hideSummary && element.Summary)?0:(this.inline?this.itemHeight:_height);
			element[tagName]={height:height,_height:_height};
		}
		return element[tagName];
	}
	/**
	移除元素的绘制对象
	@name SFGantt.prototype.removeElementDrawObj
	@function
	@private
	@param {SFDataElement} element 数据元素
	*/
	SFGanttDrawControl.prototype.removeElementDrawObj=function(element)
	{
		var tagName=this.getTagName();
		delete element[tagName];
	}
	/**
	获取元素的绘制对象属性名称，采用索引顺次增加，主要是考虑到将一份数据采用多个甘特图显示的情况
	@private
	@returns {String}
	*/
	SFGanttDrawControl.prototype.getTagName=function()
	{
		if(!this.tagName)
		{
			if(!SFGantt._tagIndex){SFGantt._tagIndex=0;}
			this.tagName="drawObj_"+(SFGantt._tagIndex++);
		}
		return this.tagName;
	}
	/**
	获得元素的绘制高度
	@name SFGantt.prototype.getElementHeight
	@function
	@private
	@param {SFDataElement} 数据元素
	@returns {Number} 像素单位的元素显示高度
	*/
	SFGanttDrawControl.prototype.getElementHeight=function(element)
	{
		var itemHeight,pElement;
		if(element.Summary && this.hideSummary){return 0;}
		if(this.inline)
		{
			if(!element.Summary && element.Start && element.Finish && (pElement=element.getPreviousSibling()) && !pElement.Summary && pElement.Start && pElement.Finish && pElement.Finish<element.Start)
			{
				var returnObj={returnValue:true};
				SFEvent.trigger(this.gantt,"beforeinline",[returnObj,element,pElement]);
				if(returnObj.returnValue){return 0;}
			}
			return this.itemHeight;
		}
		return (itemHeight=element.LineHeight)?itemHeight:this.itemHeight;
	}
	/**
	在一行显示的情况下，任务的起止时间变化时进行行列调整
	@private
	@param {SFDataElement} element 被更改的元素
	@param {String[]} changedFields 更改的属性列表
	*/
	SFGanttDrawControl.prototype.onElementChange=function(element,changedFields)
	{
		var gantt=this.gantt;
		if(gantt.inline)
		{
			if(!SFGlobal.findInArray(changedFields,"Start") && !SFGlobal.findInArray(changedFields,"Finish")){return;}
			var startElement=null;
			//如果当前任务需要重新处理
			
			if(gantt.getElementDrawObj(element)._height!=gantt.getElementHeight(element))
			{
				startElement=element;
			}
			else
			{
				var nextElement=element.getNextSibling();
				if(nextElement && gantt.getElementDrawObj(nextElement)._height!=gantt.getElementHeight(nextElement))
				{
					startElement=nextElement;
				}
			}
			for(var t=startElement;t;t=t.getNextSibling())
			{
				if(gantt.getElementDrawObj(t)._height==gantt.getElementHeight(t)){break;}
				SFEvent.trigger(gantt,"elementheightchanged",[t,gantt.getElementHeight(t),gantt.getElementDrawObj(t)._height]);
			}
		}
		if(SFGlobal.findInArray(changedFields,"LineHeight"))
		{
			SFEvent.trigger(gantt,"elementheightchanged",[element,element.LineHeight,gantt.getElementDrawObj(element)._height]);
		}
	}
	/**
	@private
	在功能控件被移除时执行的方法
	*/
	SFGanttDrawControl.prototype.remove=function()
	{
		var gantt=this.gantt;
		delete gantt.getElementHeight;
		delete gantt.removeElementDrawObj;
		delete gantt.getElementDrawObj;
		delete this.gantt
	}
	window.SFGanttDrawControl=SFGanttDrawControl;