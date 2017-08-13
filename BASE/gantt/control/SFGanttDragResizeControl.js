	/**
	这是一个甘特图功能控件，本控件实现右下角的更改甘特图大小的按钮,拖动之后自动更新甘特图的大小
	@private
	@extends SFGanttControl
	@class
	*/
	function SFGanttDragResizeControl()
	{
	}
	SFGanttDragResizeControl.prototype=new window.SFGanttControl();
	/**
	@private
	功能控件的初始化，每个插件的实现都会重写此方法
	@param {SFGantt} gantt
	@returns {Bool} 如果初始化成功，返回true,否则返回false
	*/
	SFGanttDragResizeControl.prototype.initialize=function(gantt,container)
	{
		/**
		是否禁止通过甘特图右下角的图标拖动改变甘特图的大小，如果设置为true，则不会显示该三角图标
		@name SFConfig.configItems.SFGantt_disableDragResize
		@type Bool
		@default false
		*/
		if(gantt.disableDragResize){return false;}
		var resizeImg=this.div=gantt.createImage("resize");
		SFGlobal.setProperty(resizeImg.style,{position:'absolute',right:'0px',bottom:'0px',zIndex:200});
		SFGlobal.setCursor(resizeImg,'se-resize');
		this.listeners=[
			SFDragObject.setup(resizeImg,SFEvent.getCallback(this,this.onMove),{container:gantt.getContainer()})
		];
		container.appendChild(resizeImg);
		this.gantt=gantt;
		return true;
	}
	/**
	@private
	在拖拽更改甘特图大小的过程之中持续触发的函数
	@param {Number[]} startPoint 拖拽起始点位置
	@param {Number[]} point 拖拽当前点位置
	@param {String} type 当前触发的类型
	*/
	SFGanttDragResizeControl.prototype.onMove=function(startPoint,point,type)
	{
		var gantt=this.gantt;
		if(type=="start"){this.startSize=gantt.getViewSize();return;}
		var size=[this.startSize[0]+point[0]-startPoint[0],this.startSize[1]+point[1]-startPoint[1]];
		if(gantt.setViewSize(size))
		{
			SFGlobal.setProperty(gantt.getContainer().style,{width:size[0]+"px",height:size[1]+"px"});
		}
	}
	window.SFGanttDragResizeControl=SFGanttDragResizeControl;