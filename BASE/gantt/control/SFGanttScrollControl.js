	/**
	这是一个甘特图功能控件，本控件负责管理甘特图的滚动逻辑，在滚动时，对滚动进行性能控制，并将滚动参数包装，触发scroll事件
	@private
	@extends SFGanttControl
	@class
	*/
	function SFGanttScrollControl()
	{
	}
	SFGanttScrollControl.prototype=new window.SFGanttControl();
	/**
	@private
	功能控件的初始化，每个插件的实现都会重写此方法
	@param {SFGantt} gantt
	@returns {Bool} 如果初始化成功，返回true,否则返回false
	*/
	SFGanttScrollControl.prototype.initialize=function(gantt)
	{
		this.gantt=gantt;
		if(gantt.disableScroll || !gantt.getLayout || !gantt.showScroller){return false;}
		var container=gantt.getLayout("bodyScroll");
		container.style.overflowY='scroll';
		if(!container){return false;}
		this.listeners=[
			SFEvent.bind(container,"scroll",this,this.onScroll)
		]
		return true;
	}
	/**
	在甘特图滚动的时候执行的操作,实际上对列表的维护进行延缓处理
	@private
	@param {Event} e 浏览器的滚动事件
	*/
	SFGanttScrollControl.prototype.onScroll=function(e)
	{
		SFEvent.cancelBubble(e);
		if(!this.timeout){this.timeout=window.setInterval(SFEvent.getCallback(this,this.onTime),128);}
		var scrollObj=this.scrollObj?this.scrollObj:this.getScrollObj();
		scrollObj.scrollTop=this.gantt.getLayout("bodyScroll").scrollTop;
		scrollObj.changed=true;
		scrollObj.idleTimes=0;
	}
	/**
	在甘特图滚动的时候延时处理的操作
	@private
	*/
	SFGanttScrollControl.prototype.onTime=function()
	{
		var scrollObj=this.scrollObj,gantt=this.gantt;
		if(!scrollObj || !scrollObj.changed)
		{
			if(scrollObj)
			{
				scrollObj.idleTimes++;
				if(scrollObj.idleTimes>8)
				{
					window.clearInterval(this.timeout);
					delete this.timeout
				}
			}
			return;
		}
		scrollObj.changed=false;
		if(gantt.getTooltip){gantt.getTooltip().hidden();}
		var scrollTop=scrollObj.scrollTop;
		this.updateScroll(scrollObj,1,scrollTop);
		this.updateScroll(scrollObj,3,scrollTop+this.gantt.getLayout("bodyScroll").clientHeight*1.5);
		//如果已经定义了延缓操作,则先清除
		SFEvent.trigger(this.gantt,"scroll",[scrollTop,scrollObj]);
	}
	/**
	计算滚动时当前视图对应的元素范围
	@param {Json} scrollObj 滚动状态对象
	@param {Number} index 计算的项的索引
	@param {Number} scrollTop 该项的滚动高度
	@private
	*/
	SFGanttScrollControl.prototype.updateScroll=function(scrollObj,index,scrollTop)
	{
		var gantt=this.gantt,element=scrollObj.spanElements[index];
		var distance=scrollTop-scrollObj.spanHeights[index];
		var dir=distance>0;
		while(element)
		{
			if(!element.data)
			{//如果此元素被删除
				delete this.scrollObj;
				this.onScroll();
			}
			if(dir)
			{
				if(distance<gantt.getElementHeight(element)){break;}
				var newElement=element.getNextView();
				if(!newElement){break;}
				gantt.getElementDrawObj(newElement);
				element=newElement;
				distance-=gantt.getElementHeight(element);
			}
			else
			{
				if(distance>0){break;}
				var newElement=element.getPreviousView();
				if(!newElement){break;}
				gantt.getElementDrawObj(newElement);
				element=newElement;
				distance+=gantt.getElementHeight(newElement);
			}
		}
		scrollObj.spanHeights[index]=scrollTop-distance;
		scrollObj.spanElements[index]=element;
	}
	/**
	获得或创建滚动状态对象
	@returns {Json}
	@private
	*/
	SFGanttScrollControl.prototype.getScrollObj=function()
	{
		var gantt=this.gantt,element=gantt.getViewElements()[0],height=gantt.getViewTop();
		return this.scrollObj={
			lastTime:new Date().valueOf(),
			spanElements:[element,element,element,element],
			spanHeights:[height,height,height,height]
		};
	}
	window.SFGanttScrollControl=SFGanttScrollControl;