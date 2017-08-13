//	在实体被注册或显示的时候添加这个实体的高度
//	在实体被取消或隐藏的时候，减去这个实体的高度
//	在实体高度变化的时候，高度随之变化
//	目前此控件存在一个BUG，就是假如在甘特图初始化之前data已经读取了一些数据，则已经读取的数据的高度不会被计算进去
//	此控件独自管理甘特图的heightchange事件,通过此事件和其他的程序(SFGanttLayoutControl)交互,影响其滚动条的逻辑
	/**
	这是一个甘特图功能控件，此控件主要负责在显示内容范围变化的时候自动确定甘特图图表的高度，
	@private
	@extends SFGanttControl
	@class
	*/
	function SFGanttBodyHeightControl(config)
	{
	}
	SFGanttBodyHeightControl.prototype=new window.SFGanttControl();
	/**
	@private
	功能控件的初始化，每个插件的实现都会重写此方法
	@param {SFGantt} gantt
	@returns {Bool} 如果初始化成功，返回true,否则返回false
	*/
	SFGanttBodyHeightControl.prototype.initialize=function(gantt,container)
	{
		this.listeners=[
			SFEvent.bind(this.gantt=gantt,"heightspanchange",this,this.onChange)
		];
		return true;
	}
	/**
	@private
	在甘特图的显示范围发生变化时执行的响应
	@param {Number[]} heightSpan 甘特图目前显示的内容范围
	*/
	SFGanttBodyHeightControl.prototype.onChange=function(heightSpan)
	{
		if(!this.timeout){this.timeout=window.setInterval(SFEvent.getCallback(this,this.onTime),64);}
		this.changed=true;
		this.idleTimes=0;
		this.bodyHeight=heightSpan[1];
	}
	/**
	@private
	在甘特图显示范围持续变化时执行的响应
	*/
	SFGanttBodyHeightControl.prototype.onTime=function()
	{
		if(!this.changed)
		{
			this.idleTimes++;
			if(this.idleTimes>16)
			{
				window.clearInterval(this.timeout);
				delete this.timeout
			}
			return;
		}
		this.changed=false;
		this.setBodyHeight();
	}
	/**
	@private
	重设甘特图图表层的高度
	*/
	SFGanttBodyHeightControl.prototype.setBodyHeight=function()
	{
		var mapBody=this.gantt.getLayout("mapBody");
		if(mapBody){mapBody.style.height=this.bodyHeight+100+"px";}
	}
	/**
	@private
	在功能控件被移除时执行的方法
	*/
	SFGanttBodyHeightControl.prototype.remove=function()
	{
		if(this.timeout){window.clearInterval(this.timeout);}
		SFGanttControl.prototype.remove.apply(this,arguments);
	}
	window.SFGanttBodyHeightControl=SFGanttBodyHeightControl;