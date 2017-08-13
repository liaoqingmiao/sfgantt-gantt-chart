	/**
	这是一个甘特图功能控件，本控件用来实现选择功能，管理甘特图之中的所有被选中的实体列表，并实现一系列方法以操作选中的列表，很多控件使用了这个功能，却通过是否支持的判断避免了对此控件的依赖
	@private
	@extends SFGanttControl
	@class
	*/
	function SFGanttElementSelectControl()
	{
		this.selectedElements=[];
	}
	SFGanttElementSelectControl.prototype=new window.SFGanttControl();
	/**
	@private
	功能控件的初始化，每个插件的实现都会重写此方法
	@param {SFGantt} gantt
	@returns {Bool} 如果初始化成功，返回true,否则返回false
	*/
	SFGanttElementSelectControl.prototype.initialize=function(gantt,container)
	{
		if(gantt.disableSelect){return false;}
		this.gantt=gantt;
		var elementType=gantt.elementType;
		SFGlobal.setProperty(gantt,{
			getFocusElement:gantt["getFocus"+elementType]=SFEvent.getCallback(this,this.getFocusElement),
			getSelectedElements:gantt["getSelected"+elementType+"s"]=SFEvent.getCallback(this,this.getSelectedElements),
			setSelectedElement:gantt["setSelected"+elementType]=SFEvent.getCallback(this,this.setSelectedElement),
			clearSelectedElement:gantt["clearSelected"+elementType]=SFEvent.getCallback(this,this.clearSelectedElement)
		});
		this.listeners=[
			SFEvent.bind(gantt,elementType.toLowerCase()+"mousedown",this,this.onElementClick),
			SFEvent.bind(gantt,"initialize",this,this.onGanttInit)
		];
		return true;
	}
	/**
	在甘特图初始化时，进行必须的事件绑定
	@private
	*/
	SFGanttElementSelectControl.prototype.onGanttInit=function()
	{
		var gantt=this.gantt,data=gantt.getData(),el=gantt.elementType.toLowerCase();
		this.listeners=this.listeners.concat([
			SFEvent.bind(data,el+"register",this,this.onRegister),
			SFEvent.bind(data,el+"unregister",this,this.onUnRegister),
			SFEvent.bind(data,"after"+el+"change",this,this.onElementChange)
		]);
	}
	/**
	在元素被注册是判断元素是否被选中，如果是，则添加到选中的元素列表
	@private
	@param {SFDataElement} element
	*/
	SFGanttElementSelectControl.prototype.onRegister=function(element)
	{
		if(element.Selected){this.selectedElements.push(element);}
	}
	/**
	在元素被注销时将其从选中的元素列表之中删除
	@private
	@param {SFDataElement} element
	*/
	SFGanttElementSelectControl.prototype.onUnRegister=function(element)
	{
		if(element.Selected){SFGlobal.deleteInArray(this.selectedElements,element);}
	}
	/**
	在元素被单击时切换元素的选中状态
	@private
	@param {SFDataElement} element
	@param {Event} e 浏览器的鼠标事件
	*/
	SFGanttElementSelectControl.prototype.onElementClick=function(element,e)
	{
		if(!e || SFEvent.getEventButton(e)==2)//如果是右键
		{
			if(!element.Selected)//如果该项没有被选中
			{
				this.clearSelectedElement();
				element.setProperty("Selected",true);
			}
		}
		else
		{
			var selectedElements=this.selectedElements;
			if(e.shiftKey && selectedElements[0])
			{
				var lastElement=selectedElements[selectedElements.length-1]
				var flag=this.gantt.data.compareElement(lastElement,element)>0;
				var t=lastElement;
				while(t)
				{
					t=flag?t.getNextView():t.getPreviousView();
					if(t){t.setProperty("Selected",true);}
					if(t==element){return;}
				}
			}
			else if(e.ctrlKey)
			{
				element.setProperty("Selected",!element.Selected);
			}
			else
			{
				this.clearSelectedElement();
				element.setProperty("Selected",true);
			}
		}
	}
	/**
	在元素属性变化时判断是否变化了元素的选中状态，如果是，则做出响应
	@private
	@param {SFDataElement} element
	@param {String} name 变化的属性名称
	@param {variant} value 变化后的属性值
	*/
	SFGanttElementSelectControl.prototype.onElementChange=function(element,name,value)
	{
		if(name=="Selected")
		{
			var el=this.gantt.elementType.toLowerCase();
			/** 
				@event
				@name SFGantt#taskfocus
				@description 在任务甘特图上的一个任务被选中时触发
				@param {SFDataTask} task 被选中的任务.
			 */
			/** 
				@event
				@name SFGantt#taskblur
				@description 在任务甘特图上的一个任务被取消选中时触发
				@param {SFDataTask} task 被取消选中的任务.
			 */
			/** 
				@event
				@name SFGantt#resourcefocus
				@description 在资源甘特图上的一个资源被选中时触发
				@param {SFDataResource} resource 被选中的任务.
			 */
			/** 
				@event
				@name SFGantt#resourceblur
				@description 在资源甘特图上的一个资源被取消选中时触发
				@param {SFDataResource} resource 被取消选中的任务.
			 */
			SFEvent.trigger(this.gantt,el+(value?"focus":"blur"),[element]);
			if(value){this.selectedElements.push(element);}
			else{SFGlobal.deleteInArray(this.selectedElements,element);}
		}
	}
	/**
	获取当前的焦点元素，目前就是选中的元素的最后一个
	@function
	@name SFGantt.prototype.getFocusElement
	@returns {SFDataElement}
	*/
	SFGanttElementSelectControl.prototype.getFocusElement=function()
	{
		return this.selectedElements[this.selectedElements.length-1];
	}
	/**
	返回当前所有选中的元素数组
	@function
	@name SFGantt.prototype.getSelectedElements
	@returns {SFDataElement[]}
	*/
	SFGanttElementSelectControl.prototype.getSelectedElements=function()
	{
		return this.selectedElements;
	}
	/**
	设置当前选中的元素，这会将其他的元素全部取消选中，而仅仅选中此元素
	@function
	@name SFGantt.prototype.setSelectedElement
	@param {SFDataElement} element 需要被选中的元素
	*/
	SFGanttElementSelectControl.prototype.setSelectedElement=function(element)
	{
		if(this.selectedElements && this.selectedElements[0]==element && !this.selectedElements[1]){return;}
		this.clearSelectedElement();
		element.setProperty("Selected",true);
	}
	/**
	清空当前所有被选中的元素
	@function
	@name SFGantt.prototype.clearSelectedElement
	*/
	SFGanttElementSelectControl.prototype.clearSelectedElement=function()
	{
		var element,elements=this.selectedElements;
		while(element=elements.pop())
		{
			element.setProperty("Selected",false);
		}
	}
	/**
	@private
	在功能控件被移除时执行的方法
	*/
	SFGanttElementSelectControl.prototype.remove=function()
	{
		var gantt=this.gantt;
		delete gantt.getFocusElement
		delete gantt.getSelectedElements
		delete gantt.setSelectedElement
		delete gantt.clearSelectedElement
		var elementType=gantt.elementType;
		delete gantt["getFocus"+elementType];
		delete gantt["getSelected"+elementType+"s"];
		delete gantt["setSelected"+elementType];
		delete gantt["clearSelected"+elementType];
		this.selectedElements=[];
		SFGanttControl.prototype.remove.apply(this,arguments);
	}
	window.SFGanttElementSelectControl=SFGanttElementSelectControl;