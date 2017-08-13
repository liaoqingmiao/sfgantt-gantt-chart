	/**
	甘特图数据适配器的基类，所有的数据适配器都继承此类
	@class
	*/
	function SFDataAdapter(){}
	/**
	@private
	数据源的初始化，每个数据源的实现都会重写此方法
	*/
	SFDataAdapter.prototype.initialize=function(){}
	/**
	移除此数据源，移除之后，SFData对象不再访问此数据源
	*/
	SFDataAdapter.prototype.remove=function(){}
	/**
	销毁此数据源以释放内存
	*/
	SFDataAdapter.prototype.depose=function()
	{
		if(this.listeners)
		{
			var listenr;
			while(listenr=this.listeners.pop()){SFEvent.removeListener(listenr)}
		}
	}
	/**
	@private
	返回数据源使用的工作日历对象，默认返回标准日历
	@returns {SFWorkingCalendar}
	*/
	SFDataAdapter.prototype.getCalendar=function(){return SFWorkingCalendar.getCalendar("Standard");}
	/**
	@private
	读取并返回根任务
	@returns {SFDataTask}
	*/
	SFDataAdapter.prototype.readRootTask=function(){}
	/**
	@private
	读取并返回指定任务的第一个子任务，如果不存在，则返回null
	@param {SFDataTask} task
	@returns {SFDataTask}
	*/
	SFDataAdapter.prototype.readTaskFirstChild=function(){}
	/**
	@private
	读取并返回指定任务的下一个同级任务，如果不存在，则返回null
	@param {SFDataTask} task
	@returns {SFDataTask}
	*/
	SFDataAdapter.prototype.readTaskNextSibling=function(){}
	/**
	@private
	读取并返回根资源
	@returns {SFDataResource}
	*/
	SFDataAdapter.prototype.readRootResource=function(){}
	/**
	@private
	读取并返回指定资源的第一个子资源，如果不存在，则返回null
	@param {SFDataResource} resource
	@returns {SFDataResource}
	*/
	SFDataAdapter.prototype.readResourceFirstChild=function(){}
	/**
	@private
	读取并返回指定资源的下一个同级资源，如果不存在，则返回null
	@param {SFDataResource} resource
	@returns {SFDataResource}
	*/
	SFDataAdapter.prototype.readResourceNextSibling=function(){}
	/**
	@private
	读取并返回指定任务的第一个链接，如果不存在，则返回null
	@param {SFDataTask} task
	@returns {SFDataLink}
	*/
	SFDataAdapter.prototype.readTaskFirstLink=function(){}
	/**
	@private
	读取并返回指定任务的下一个链接，如果不存在，则返回null
	@param {SFDataTask} task
	@param {SFDataLink} link
	@returns {SFDataLink}
	*/
	SFDataAdapter.prototype.readTaskNextLink=function(){}
	/**
	@private
	读取并返回指定任务的第一个资源分配，如果不存在，则返回null
	@param {SFDataTask} task
	@returns {SFDataAssignment}
	*/
	SFDataAdapter.prototype.readTaskFirstAssignment=function(){}
	/**
	@private
	读取并返回指定任务的下一个资源分配，如果不存在，则返回null
	@param {SFDataTask} task
	@param {SFDataAssignment} assignment
	@returns {SFDataAssignment}
	*/
	SFDataAdapter.prototype.readTaskNextAssignment=function(){}
	/**
	@private
	读取并返回指定资源的第一个分配，如果不存在，则返回null
	@param {SFDataResource} resource
	@returns {SFDataAssignment}
	*/
	SFDataAdapter.prototype.readResourceFirstAssignment=function(){}
	/**
	@private
	读取并返回指定资源的下一个资源分配，如果不存在，则返回null
	@param {SFDataResource} resource
	@param {SFDataAssignment} assignment
	@returns {SFDataAssignment}
	*/
	SFDataAdapter.prototype.readResourceNextAssignment=function(){}
	/**
	@private
	更新指定任务的属性
	@param {SFDataTask} task
	@param {String} proName 属性名称
	@param {variant} value 属性的值
	*/
	SFDataAdapter.prototype.updateTask=function(){}
	/**
	@private
	在指定的位置插入新任务并返回
	@param {SFDataTask} parent 新任务的父任务
	@param {SFDataTask} pTask 新任务的上一个同级任务，如果新任务是父任务的第一个子任务，则为null
	@returns {SFDataTask}
	*/
	SFDataAdapter.prototype.addTask=function(){return new SFDataTask();}
	/**
	@private
	删除指定的任务
	@param {SFDataTask} task 需要删除的任务
	*/
	SFDataAdapter.prototype.deleteTask=function(){}
	/**
	@private
	移动任务到指定的位置
	@param {SFDataTask} task 需要移动的任务
	@param {SFDataTask} parent 新位置的父任务
	@param {SFDataTask} pTask 新位置的上一个同级任务，如果新位置是父任务的第一个子任务，则为null
	*/
	SFDataAdapter.prototype.moveTask=function(){}
	/**
	@private
	更新指定资源的属性
	@param {SFDataResource} resource
	@param {String} proName 属性名称
	@param {variant} value 属性的值
	*/
	SFDataAdapter.prototype.updateResource=function(){}
	/**
	@private
	在指定的位置插入新资源并返回
	@param {SFDataResource} parent 新资源的父资源
	@param {SFDataResource} pResource 新资源的上一个同级资源，如果新资源是父资源的第一个子资源，则为null
	@returns {SFDataResource}
	*/
	SFDataAdapter.prototype.addResource=function(){return new SFDataResource();}
	/**
	@private
	删除指定的资源
	@param {SFDataResource} resource 需要删除的资源
	*/
	SFDataAdapter.prototype.deleteResource=function(){}
	/**
	@private
	移动资源到指定的位置
	@param {SFDataResource} resource 需要移动的资源
	@param {SFDataResource} parent 新位置的父资源
	@param {SFDataResource} pResource 新位置的上一个同级资源，如果新位置是父资源的第一个子资源，则为null
	*/
	SFDataAdapter.prototype.moveResource=function(){}
	/**
	@private
	更新指定链接的属性
	@param {SFDataLink} link
	@param {String} proName 属性名称
	@param {variant} value 属性的值
	*/
	SFDataAdapter.prototype.updateLink=function(){}
	/**
	@private
	在指定的任务之间添加链接并返回
	@param {SFDataTask} selfTask 链接的后置任务
	@param {SFDataTask} preTask 链接的前置任务
	@param {Number} type 链接的类型，请参看{@link SFDataLink#Type}
	@returns {SFDataLink}
	*/
	SFDataAdapter.prototype.addLink=function(){return new SFDataLink();}
	/**
	@private
	删除指定的链接
	@param {SFDataLink} link 需要删除的链接
	*/
	SFDataAdapter.prototype.deleteLink=function(){}
	/**
	@private
	更新指定资源分配的属性
	@param {SFDataAssignment} assignment
	@param {String} proName 属性名称
	@param {variant} value 属性的值
	*/
	SFDataAdapter.prototype.updateAssignment=function(){}
	/**
	@private
	添加一个资源分配并返回
	@param {SFDataTask} task 分配的任务
	@param {SFDataResource} resource 分配的资源
	@param {Number} unit 资源的占用比例，0-1的小数
	@returns {SFDataAssignment}
	*/
	SFDataAdapter.prototype.addAssignment=function(){return new SFDataAssignment();}
	/**
	@private
	删除指定的资源分配
	@param {SFDataAssignment} assignment 需要删除的资源分配
	*/
	SFDataAdapter.prototype.deleteAssignment=function(){}
	window.SFDataAdapter=SFDataAdapter;