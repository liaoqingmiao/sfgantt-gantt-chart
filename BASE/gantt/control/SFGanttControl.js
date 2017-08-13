	/**
	甘特图功能控件的基类，所有的功能控件都继承此类
	@class
	*/
	function SFGanttControl(){}
	/**
	@private
	功能控件的初始化，每个插件的实现都会重写此方法
	@param {SFGantt} gantt
	@returns {Bool} 如果初始化成功，返回true,否则返回false
	*/
	SFGanttControl.prototype.initialize=function(){return false;}
	/**
	@private
	在功能控件被移除时执行的方法
	*/
	SFGanttControl.prototype.remove=function()
	{
		var listener,listeners=this.listeners;
		if(listeners)
		{
			while(listener=listeners.pop()){SFEvent.removeListener(listener);}
		}
		SFEvent.deposeNode(this.div);
		delete this.listeners;
		delete this.gantt;
	}
	/**
	返回该控件是否已经添加到甘特图之中
	@returns {Bool} 
	*/
	SFGanttControl.prototype.isUsing=function()
	{
		return !!this.added;
	}
	/**
	销毁此功能控件以释放内存
	*/
	SFGanttControl.prototype.depose=function()
	{
		this.remove();
		SFEvent.clearListeners(this);
		for(var key in this){this[key]=null;}
	}
	window.SFGanttControl=SFGanttControl;