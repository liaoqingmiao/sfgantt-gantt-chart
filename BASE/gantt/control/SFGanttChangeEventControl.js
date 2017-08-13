	/**
	这是一个甘特图功能控件，本控件用来给甘特图实现change的事件，该事件是对数据的update事件进行缓存包装以提升性能
	@private
	@extends SFGanttControl
	@class
	*/
	function SFGanttChangeEventControl()
	{
	}
	SFGanttChangeEventControl.prototype=new window.SFGanttControl();
	/**
	@private
	功能控件的初始化，每个插件的实现都会重写此方法
	@param {SFGantt} gantt
	@returns {Bool} 如果初始化成功，返回true,否则返回false
	*/
	SFGanttChangeEventControl.prototype.initialize=function(gantt)
	{
		if(gantt.disableChangeEvent){return false;}
		this.listeners=[
			SFEvent.bind(this.gantt=gantt,"initialize",this,this.onGanttInit)
		]
		return true;
	}
	/**
	@private
	在甘特图初始化时绑定事件
	*/
	SFGanttChangeEventControl.prototype.onGanttInit=function()
	{
		var gantt=this.gantt;
		this.listeners=this.listeners.concat([
			SFEvent.bind(gantt.getData(),"after"+gantt.elementType.toLowerCase()+"update",this,this.onElementUpdate)
		]);
	}
	/**
	@private
	在元素发生变化时进行操作，将操作记录下来
	@param {SFDataElement} element 发生变化的元素
	@param {String} name 变化的属性名称
	@param {variant} value 变化后的属性值
	@param {String} bValue 变化前的属性值
	*/
	SFGanttChangeEventControl.prototype.onElementUpdate=function(element,name,value,bValue)
	{
		var ele,elements;
		if(!(elements=this.changedElements)){elements=this.changedElements=[];}
		if(ele=SFGlobal.findInArray(elements,element,function(a,b){return a.element==b}))
		{
			if(!SFGlobal.findInArray(ele.fields,name))
			{
				ele.fields.push(name);
			}
		}
		else
		{
			elements.push({element:element,fields:[name]})
		}
		if(!this.eut){this.eut=window.setInterval(SFEvent.getCallback(this,this.onTime),256);}
		this.changed=true;
		this.idleTimes=0;
	}
	/**
	@private
	在元素发生变化后延时操作
	*/
	SFGanttChangeEventControl.prototype.onTime=function()
	{
		if(!this.changed)
		{
			this.idleTimes++;
			if(this.idleTimes>4)
			{
				window.clearInterval(this.eut);
				delete this.eut
			}
			return;
		}
		this.changed=false;
		this.triggerUpdate();
	}
	/**
	@private
	触发记录的所有元素的change事件
	*/
	SFGanttChangeEventControl.prototype.triggerUpdate=function()
	{
		var element,elements=this.changedElements;
		while(element=elements.pop())
		{
			this.onElementChange(element.element,element.fields);
		}
	}
	/**
	@private
	触发指定元素的change事件
	@param {SFDataElement} element 元素
	@param {Array} changedFields 元素所有的更改过的记录
	*/
	SFGanttChangeEventControl.prototype.onElementChange=function(element,changedFields)
	{
		var gantt=this.gantt;
		/** 
			@event
			@name SFGantt#taskchange
			@private
			@description 在任务甘特图上的一个任务发生变化后触发
			@param {SFDataTask} task
			@param {String[]} changedFields 变化了的字段名称数组
		 */
		/** 
			@event
			@name SFGantt#resourcechange
			@private
			@description 在资源甘特图上的一个资源发生变化后触发
			@param {SFDataResource} resource
			@param {String[]} changedFields 变化了的字段名称数组
		 */
		SFEvent.trigger(this.gantt,gantt.elementType.toLowerCase()+"change",[element,changedFields]);
	}
	window.SFGanttChangeEventControl=SFGanttChangeEventControl;