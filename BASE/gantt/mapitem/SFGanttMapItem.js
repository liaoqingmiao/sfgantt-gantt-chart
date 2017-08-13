	/**
	甘特图图表绘制项目的基类，所有的图表绘制项目都继承此类
	@private
	@class
	*/
	function SFGanttMapItem()
	{
	}
	/**
	@private
	图表绘制项目的初始化，每个绘制项目的实现都会重写此方法
	@param {SFGanttTasksMap} control
	@returns {Bool} 如果初始化成功，返回true,否则返回false
	*/
	SFGanttMapItem.prototype.initialize=function(){return false;};
	/**
	@private
	开始绘制指定任务
	@param {SFDataTask} task 正在绘制的任务
	@param {Json} mapObj 绘制记录对象
	@param {Number} scale 甘特图的缩放比例
	*/
	SFGanttMapItem.prototype.show=function(){};
	/**
	@private
	在地图缩放比例变化时执行的响应
	@param {SFDataTask} task 正在绘制的任务
	@param {Json} mapObj 绘制记录对象
	@param {Number} scale 甘特图的缩放比例
	*/
	SFGanttMapItem.prototype.onScale=function(){};
	/**
	@private
	在任务属性变化时执行的响应
	@param {SFDataTask} task 正在绘制的任务
	@param {Json} mapObj 绘制记录对象
	@param {String[]} changedFields 变化的属性数组
	*/
	SFGanttMapItem.prototype.onUpdate=function(){};
	/**
	@private
	鼠标在任务上按下时执行的响应
	@param {SFDataTask} task 正在绘制的任务
	@param {Json} mapObj 绘制记录对象
	@param {Event} e 浏览器鼠标事件
	*/
	SFGanttMapItem.prototype.onMouseDown=function(){};
	/**
	@private
	鼠标在任务上划过时显示的显示实时提示信息
	@param {SFDataTask} task 正在绘制的任务
	@param {Json} mapObj 绘制记录对象
	@param {SFGanttTooltipControl} tooltip 甘特图的实时提示控件
	@param {Event} e 浏览器鼠标事件
	*/
	SFGanttMapItem.prototype.getTooltip=function(){};
	/**
	@private
	清除对该任务的绘制
	@param {SFDataTask} task 需要清除绘制的任务
	@param {Json} mapObj 绘制记录对象
	*/
	SFGanttMapItem.prototype.remove=function(){}
	/**
	@private
	销毁此对象以释放资源
	*/
	SFGanttMapItem.prototype.depose=function(){};
	window.SFGanttMapItem=SFGanttMapItem;