	/**
	甘特图数据插件的基类，所有的数据插件都继承此类
	@class
	*/
	function SFDataComponent(){}
	/**
	@private
	数据插件的初始化，每个插件的实现都会重写此方法
	@param {SFData} data
	*/
	SFDataComponent.prototype.initialize=function(){}
	/**
	@private
	移除此插件
	*/
	SFDataComponent.prototype.remove=function(){}
	/**
	@private
	销毁此插件以释放资源
	*/
	SFDataComponent.prototype.depose=function(){this.remove();}
	/**
	这是一个数据插件，本数据插件用来实现在任务时间变化的时候更新父任务的时间
	此插件会默认加载，不过可以通过设置"SFData/autoCalculateTime"的配置项为false来禁止此插件的加载
	@extends SFDataComponent
	@class
	*/
	function SFDataCalculateTimeComponent(){}
	SFDataCalculateTimeComponent.prototype=new SFDataComponent();
	/**
	@private
	数据插件的初始化，每个插件的实现都会重写此方法
	@param {SFData} data
	*/
	SFDataCalculateTimeComponent.prototype.initialize=function(data)
	{
		/**
		是否自动计算概要任务的时间，如果这个值设置为false,拖动一个任务的时间，对应的概要任务不会自动更新
		@name SFConfig.configItems.SFData_autoCalculateTime
		@type Bool
		@default true
		*/
		if(!data.autoCalculateTime){return false;}
		this.listeners=[
			SFEvent.bind(data,"aftertaskchange",this,this.onTaskChange),
			SFEvent.bind(data,"aftertaskdelete",this,this.onTaskDelete),
			SFEvent.bind(data,"aftertaskmove",this,this.onTaskMove)
		];
		return true;
	}
	/**
	@private
	在任务被更改时执行，假如更改了时间，则重新计算父任务的时间
	@param {SFDataTask} task 被更改的任务
	@param {String} name 更改的属性名称
	@param {variant} value 更改后的值，任意类型
	*/
	SFDataCalculateTimeComponent.prototype.onTaskChange=function(task,name,value)
	{
		if(name!="Start" && name!="Finish"){return;}
		if(task.getParentTask()){task.getParentTask().checkTime();}
	}
	/**
	@private
	在任务被删除时执行，重新计算父任务的时间
	@param {SFDataTask} task 被删除的任务
	@param {SFDataTask} pTask 被删除任务的父任务
	*/
	SFDataCalculateTimeComponent.prototype.onTaskDelete=function(task,pTask)
	{
		if(pTask){pTask.checkTime();}
	}
	/**
	@private
	在任务移动时执行，重新计算父任务的时间
	@param {SFDataTask} task 被移动的任务
	@param {SFDataTask} pTask 被移动任务原来位置的父任务
	*/
	SFDataCalculateTimeComponent.prototype.onTaskMove=function(task,pTask)
	{
		if(pTask){pTask.checkTime();}
		if(task.getParentTask()){task.getParentTask().checkTime();}
	}
	/**
	这是一个数据插件，本数据插件用来实现完整的大纲级别的支持，加载本组件之后，将会自动的分配和更新大纲级别
	@extends SFDataComponent
	@class
	*/
	function SFDataOutlineComponent(){}
	SFDataOutlineComponent.prototype=new SFDataComponent();
	/**
	@private
	数据插件的初始化，每个插件的实现都会重写此方法
	@param {SFData} data
	*/
	SFDataOutlineComponent.prototype.initialize=function(data)
	{
		this.listeners=[];
		var modules=data.getModules();
		for(var i=modules.length-1;i>=0;i--)
		{
			if(!data["getRoot"+modules[i]]){continue;}
			var module=modules[i].toLowerCase();
			this.listeners=this.listeners.concat(
				[
					SFEvent.bind(data,module+"register",this,this.onElementRegister),
					SFEvent.bind(data,"after"+module+"add",this,this.onElementAdd),
					SFEvent.bind(data,"after"+module+"delete",this,this.onElementDelete),
					SFEvent.bind(data,"after"+module+"move",this,this.onElementMove)
				]
			);
		}
	}
	/**
	@private
	更新元素和子元素的大纲级别，这是一个递归执行的函数
	@param {SFElement} element 元素
	@param {Bool} toChild 是否还要更新子任务的大纲级别
	*/
	SFDataOutlineComponent.prototype.setOutline=function(element,toChild)
	{
		var parent=element.getParent(),number="0",level=0;
		if(parent)
		{
			number=(parent.OutlineLevel==0)?""+element.getSiblingIndex():parent.OutlineNumber+"."+element.getSiblingIndex();
			level=parent.OutlineLevel+1;
		}
		var changed=(number!=element["OutlineNumber"]);
		element.setProperty("OutlineNumber",number);
		element.setProperty("OutlineLevel",level);
		if(toChild && changed && element.Summary)
		{
			for(var child=element.getFirstChild();child;child=child.getNextSibling())
			{
				this.setOutline(child,true);
			}
		}
	}
	/**
	@private
	在元素被注册的时候初始化元素的大纲
	@param {SFElement} element 元素
	*/
	SFDataOutlineComponent.prototype.onElementRegister=function(element)
	{//初始化大纲级别的值
		this.setOutline(element,false);
	}
	/**
	@private
	在元素被增加的时候更新后续元素的大纲
	@param {SFElement} element 元素
	*/
	SFDataOutlineComponent.prototype.onElementAdd=function(element)
	{
		for(var t=element;t;t=t.getNextSibling())
		{
			this.setOutline(t,true);
		}
	}
	/**
	@private
	在元素被删除的时候更新后续元素的大纲
	@param {SFElement} element 元素
	@param {SFElement} parent 被删除元素的父元素
	@param {SFElement} pt 被删除元素的前一个兄弟元素
	*/
	SFDataOutlineComponent.prototype.onElementDelete=function(element,parent,pt)
	{
		if(!parent){return;}
		for(var t=pt?pt.getNextSibling():parent.getFirstChild();t;t=t.getNextSibling())
		{
			this.setOutline(t,true);
		}
	}
	/**
	@private
	在元素被移动的时候更新原位置和新位置的大纲
	@param {SFElement} element 被移动的元素
	@param {SFElement} parentElement 被移动元素原位置的父元素
	@param {SFElement} previousSibling 被移动元素的原位置前一个兄弟元素
	*/
	SFDataOutlineComponent.prototype.onElementMove=function(element,parentElement,previousSibling)
	{
		if(parentElement)
		{
			for(var t=previousSibling?previousSibling.getNextSibling():parentElement.getFirstChild();t;t=t.getNextSibling())
			{
				this.setOutline(t,true);
			}
		}
		for(var t=element;t;t=t.getNextSibling())
		{
			this.setOutline(t,true);
		}
	}
	/**
	这是一个数据插件，本数据插件用来实现完整的ID字段的支持，加载本组件之后，将会自动的分配和更新ID
	@extends SFDataComponent
	@class
	*/
	function SFDataIDComponent(){}
	SFDataIDComponent.prototype=new SFDataComponent();
	/**
	@private
	数据插件的初始化，每个插件的实现都会重写此方法
	@param {SFData} data
	*/
	SFDataIDComponent.prototype.initialize=function(data)
	{
		this.listeners=[];
		var modules=data.getModules();
		for(var i=modules.length-1;i>=0;i--)
		{
			if(!data["getRoot"+modules[i]]){continue;}
			var module=modules[i].toLowerCase();
			this.listeners=this.listeners.concat(
				[
					SFEvent.bind(data,module+"register",this,this.onElementRegister),
					SFEvent.bind(data,"after"+module+"add",this,this.onElementAdd),
					SFEvent.bind(data,"after"+module+"delete",this,this.onElementDelete),
					SFEvent.bind(data,"after"+module+"move",this,this.onElementMove)
				]
			);
		}
	}
	/**
	@private
	更新元素和后续元素的ID
	@param {SFElement} element 元素
	*/
	SFDataIDComponent.prototype.setID=function(element)
	{
		var id=element.getParent()?element.getPrevious().ID+1:0;
		if(!isNaN(id) && id!=element.ID)
		{
			element.setProperty("ID",id);
			return true;
		}
		return false;
	}
	/**
	@private
	在元素被注册的时候初始化元素的ID
	@param {SFElement} element 元素
	*/
	SFDataIDComponent.prototype.onElementRegister=function(element)
	{
		this.setID(element);
	}
	/**
	@private
	在元素被增加的时候更新后续元素的ID
	@param {SFElement} element 元素
	*/
	SFDataIDComponent.prototype.onElementAdd=function(element)
	{
		for(var t=element.getNext();t;t=t.getNext())
		{
			if(!this.setID(t)){break;}
		}
	}
	/**
	@private
	在元素被删除的时候更新后续元素的ID
	@param {SFElement} element 元素
	@param {SFElement} parent 被删除元素的父元素
	@param {SFElement} pt 被删除元素的前一个兄弟元素
	*/
	SFDataIDComponent.prototype.onElementDelete=function(element,parent,pt)
	{
		if(!parent){return;}
		for(var t=pt?pt.getNext():parent.getNext();t;t=t.getNext())
		{
			if(!this.setID(t)){break;}
		}
	}
	/**
	@private
	在元素被移动的时候更新ID
	@param {SFElement} element 被移动的元素
	@param {SFElement} parentElement 被移动元素原位置的父元素
	@param {SFElement} previousSibling 被移动元素的原位置前一个兄弟元素
	*/
	SFDataIDComponent.prototype.onElementMove=function(element,parentElement,previousSibling)
	{
		var ele,elements=[element];
		if(parentElement){elements.push(previousSibling?previousSibling.getLastDescendant().getNext():parentElement.getNext());}
		elements.sort(function(a,b)
		{
			if(!a || !b){return 0;}
			return a.data.compareElement(a,b);
		});
		while(elements.length>0)
		{
			for(var t=elements.pop();t;t=t.getNext())
			{
				if(!this.setID(t)){break;}
			}
		}
	}
	/**
	这是一个数据插件，本数据插件用来实现ReadOnly字段的支持，加载本组件之后，将会自动保护特定的字段不允许被修改,
	此插件会默认加载，不过可以通过"SFData/ignoreReadOnly"的配置项为true来禁止此插件的加载,
	并可以通过"SFData/taskReadonlyIgnoreProperty"等配置项来设置哪些字段的更改不受ReadOnly影响
	@extends SFDataComponent
	@class
	*/
	function SFDataReadOnlyComponent(){}
	SFDataReadOnlyComponent.prototype=new SFDataComponent();
	/**
	@private
	数据插件的初始化，每个插件的实现都会重写此方法
	@param {SFData} data
	*/
	SFDataReadOnlyComponent.prototype.initialize=function(data)
	{
		if(data.ignoreReadOnly){return false;}
		this.listeners=[]
		var modules=data.getModules();
		this.ignoreFields={};
		for(var i=modules.length-1;i>=0;i--)
		{
			var module=modules[i].toLowerCase();
			var ps=data[module+"ReadonlyIgnoreProperty"];
			this.ignoreFields[module]=ps?ps.split(","):[];
			this.listeners=this.listeners.concat(
				[
					SFEvent.bind(data,"before"+module+"change",this,this.onElementChange),
					SFEvent.bind(data,"before"+module+"delete",this,this.onElementAction),
					SFEvent.bind(data,"before"+module+"move",this,this.onElementAction)
				]
			);
		}
		return true;
	}
	/**
	@private
	在元素被更改前时执行，假如该任务被设置为只读，则禁止此修改
	@param {Json} returnObj 事件返回结果对象
	@param {SFDataElement} element 被修改的元素
	@param {String} name 被修改的字段名称
	*/
	SFDataReadOnlyComponent.prototype.onElementChange=function(returnObj,element,name)
	{
		if(SFGlobal.findInArray(this.ignoreFields[element.elementType.toLowerCase()],name)){return;}
		if(element["ReadOnly"]){returnObj.returnValue=false;}
	}
	/**
	@private
	在元素被删除或移动前时执行，假如该任务被设置为只读，则禁止此操作
	@param {Json} returnObj 事件返回结果对象
	@param {SFDataElement} element 被操作的元素
	*/
	SFDataReadOnlyComponent.prototype.onElementAction=function(returnObj,element)
	{
		if(element["ReadOnly"]){returnObj.returnValue=false;}
	}

	window.SFDataComponent=SFDataComponent;
	window.SFDataCalculateTimeComponent=SFDataCalculateTimeComponent;
	window.SFDataOutlineComponent=SFDataOutlineComponent;
	window.SFDataIDComponent=SFDataIDComponent;
	window.SFDataReadOnlyComponent=SFDataReadOnlyComponent;
	//window.SFDataCollapseComponent=SFDataCollapseComponent;