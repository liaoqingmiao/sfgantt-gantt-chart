	/**
	数据元素对象，是任务、链接、资源和资源分配等元素的基类
	@class
	*/
	function SFDataElement(){}
	/**
	获取元素的属性
	@param {String} name 属性的名称
	@returns {variant} 返回属性的值
	*/
	SFDataElement.prototype.getProperty=function(name){return this[name];}
	/**
	设置元素的属性
	@param {String} name 属性的名称
	@param {variant} value 属性的新值
	*/
	SFDataElement.prototype.setProperty=function(name,value)
	{
		var a=(typeof(this[name])=="object" && value)?this[name].valueOf():this[name];
		var b=(typeof(value)=="object" && value)?value.valueOf():value;
		if(a==b){return true;}
		if(!this.canSetProperty(name,value)){return false;}
		var beforeValue=this[name];
		this[name]=value;
		if(!this.data){return true}//如果没有完成初始化，则直接退出
		if(this.data["update"+this.elementType]){this.data["update"+this.elementType](this,name,value);}
		 //如果是UID变化，则重新注册UID
		 if(name=="UID")
		 {
		 	 var uids=this.data.elementUids[this.elementType];
		 	 if(beforeValue){delete uids[beforeValue];}
		 	 if(value){uids[value]=this;}
		 }
		SFEvent.trigger(this.data,"after"+this.elementType.toLowerCase()+"change",[this,name,value,beforeValue]);
		var bp={},ap={};
		bp[name]=beforeValue;
		ap[name]=value
		/** 
			@event
			@name SFData#aftertaskchange
			@description 在任务属性修改之后触发
			@param {Json} returnObj 如果设置returnObj.returnValue=false,则代表修改此属性，此属性就不会被修改.
			@param {SFDataTask} task 表示被修改的任务.
			@param {String} name 修改字段的名称.
			@param {variant} value 修改后的新值，任意类型
			@param {variant} beforeValue 修改之前的旧值，任意类型
		 */
		/** 
			@event
			@name SFData#afterresourcechange
			@description 在资源属性修改之后触发
			@param {Json} returnObj 如果设置returnObj.returnValue=false,则代表修改此属性，此属性就不会被修改.
			@param {SFDataResource} resource 表示被修改的资源.
			@param {String} name 修改字段的名称.
			@param {variant} value 修改后的新值，任意类型
			@param {variant} beforeValue 修改之前的旧值，任意类型
		 */
		/** 
			@event
			@name SFData#afterlinkchange
			@description 在链接属性修改之后触发
			@param {Json} returnObj 如果设置returnObj.returnValue=false,则代表修改此属性，此属性就不会被修改.
			@param {SFDataLink} link 表示被修改的链接.
			@param {String} name 修改字段的名称.
			@param {variant} value 修改后的新值，任意类型
			@param {variant} beforeValue 修改之前的旧值，任意类型
		 */
		/** 
			@event
			@name SFData#afterassignmentchange
			@description 在资源分配属性修改之后触发
			@param {Json} returnObj 如果设置returnObj.returnValue=false,则代表修改此属性，此属性就不会被修改.
			@param {SFDataAssignment} assignment 表示被修改的资源分配.
			@param {String} name 修改字段的名称.
			@param {variant} value 修改后的新值，任意类型
			@param {variant} beforeValue 修改之前的旧值，任意类型
		 */
		SFEvent.trigger(this.data,"after"+this.elementType.toLowerCase()+"update",[this,[name],ap,bp]);
		return true;
	}
	/**
	判断元素的指定属性是否可写，例如元素如果被设置为ReadOnly，则所有的字段都不可写
	@param {String} name 属性的名称
	@param {variant} [value] 如果加上这个参数，还可以判断是否将该属性可以设置为指定的值
	@returns {Bool} 如果可写，则为true
	*/
	SFDataElement.prototype.canSetProperty=function(name,value)
	{
		//如果一个实例还没有完成初始化，则直接退出
		if(!this.data){return true;}
		/** 
			@event
			@name SFData#beforetaskchange
			@description 在任务属性被修改之前触发
			@param {Json} returnObj 如果设置returnObj.returnValue=false,则代表修改此属性，此属性就不会被修改.
			@param {SFDataTask} task 表示被修改的任务.
			@param {String} name 修改字段的名称.
			@param {variant} value 修改后的新值，任意类型
		 */
		/** 
			@event
			@name SFData#beforeresourcechange
			@description 在资源属性被修改之前触发
			@param {Json} returnObj 如果设置returnObj.returnValue=false,则代表修改此属性，此属性就不会被修改.
			@param {SFDataResource} resource 表示被修改的资源.
			@param {String} name 修改字段的名称.
			@param {variant} value 修改后的新值，任意类型
		 */
		/** 
			@event
			@name SFData#beforelinkchange
			@description 在链接属性被修改之前触发
			@param {Json} returnObj 如果设置returnObj.returnValue=false,则代表修改此属性，此属性就不会被修改.
			@param {SFDataLink} link 表示被修改的链接.
			@param {String} name 修改字段的名称.
			@param {variant} value 修改后的新值，任意类型
		 */
		/** 
			@event
			@name SFData#beforeassignmentchange
			@description 在资源分配属性被修改之前触发
			@param {Json} returnObj 如果设置returnObj.returnValue=false,则代表修改此属性，此属性就不会被修改.
			@param {SFDataAssignment} assignment 表示被修改的资源分配.
			@param {String} name 修改字段的名称.
			@param {variant} value 修改后的新值，任意类型
		 */
		return this.data.checkEvent("before"+this.elementType.toLowerCase()+"change",[this,name,value]);
	}
	/**
	树形结构数据元素对象，是任务、资源的基类
	@class
	@extends SFDataElement
	*/
	function SFDataTreeElement(){}
	SFDataTreeElement.prototype=new SFDataElement();
	/**
	获得指定元素的第一个子元素
	@returns {SFDataTreeElement}
	*/
	SFDataTreeElement.prototype.getFirstChild=function()
	{
		if(typeof(this.firstChild)=="undefined")
		{
			this.firstChild=this.data.readElementFirstChild(this.elementType,this);
		}
		return this.firstChild;
	}
	/**
	获得指定元素的父元素
	@returns {SFDataTreeElement}
	*/
	SFDataTreeElement.prototype.getParent=function()
	{
		return this.parent;
	}
	/**
	获得指定元素的上一个同级元素
	@returns {SFDataTreeElement}
	*/
	SFDataTreeElement.prototype.getPreviousSibling=function()
	{
		return this.previousSibling;
	}
	/**
	获得指定元素的下一个同级元素
	@param {Bool} autoUp 是否自动向上递归，如果为true,在下一个同级元素不存在的时候自动找父元素的下一个同级元素
	@returns {SFDataTreeElement}
	*/
	SFDataTreeElement.prototype.getNextSibling=function(autoUp)
	{
		if(typeof(this.nextSibling)=="undefined")
		{
			this.nextSibling=this.data.readElementNextSibling(this.elementType,this);
		}
		if(!this.nextSibling && autoUp)
		{
			var parent=this.getParent();
			if(parent)
			{
				return parent.getNextSibling(autoUp);
			}
		}
		return this.nextSibling;
	}
	/**
	获得元素指定级别的上级元素
	@param {Number} level 级别，和OutlineNumber属性的定义一致
	@returns {SFDataTreeElement}
	*/
	SFDataTreeElement.prototype.getAncestor=function(level)
	{
		var cLevel=this.getOutlineLevel();
		var element=this;
		while(cLevel>level)
		{
			element=element.getParent();
			cLevel--;
		}
		return element;
	}
	/**
	获得元素的上一个元素
	@returns {SFDataTreeElement}
	*/
	SFDataTreeElement.prototype.getPrevious=function()
	{
		var element=this.getPreviousSibling();
		return element?element.getLastDescendant():this.getParent();
	}
	/**
	获得元素的下一个元素
	@returns {SFDataTreeElement}
	*/
	SFDataTreeElement.prototype.getNext=function()
	{
		if(this==this.data.getRootElement(this.elementType)){return this.getFirstChild();}//
		if(this.Summary)
		{
			var element=this.getFirstChild();
			if(element){return element;}
		}
		var element=this.getNextSibling();//首先考虑下一个是nextSibling的情况
		if(element){return element;}
		//最后考虑下一个是上级的nextSibling的情况
		for(var pElement=this.getParent();pElement;pElement=pElement.getParent())
		{
			element=pElement.getNextSibling();
			if(element){return element;}
		}
		return null;
	}
	/**
	获得元素的最后一个子元素
	@returns {SFDataTreeElement}
	*/
	SFDataTreeElement.prototype.getLastChild=function()
	{
		var lastChild=null;
		for(var child=this.getFirstChild();child;child=child.getNextSibling())
		{
			lastChild=child;
		}
		return lastChild;
	}
	/**
	获得元素的最后一个子孙元素
	@param {Bool} onlyView 是否只返回没有被上级元素的Collapse属性折叠起来的元素
	@returns {SFDataTreeElement}
	*/
	SFDataTreeElement.prototype.getLastDescendant=function(onlyView)
	{
		if(!this.Summary || (onlyView && this.Collapse)){return this;}
		var lastChild=this.getLastChild();
		return lastChild?lastChild.getLastDescendant(onlyView):this;
	}
	/**
	获得当前没有被隐藏的下一个元素
	@returns {SFDataTreeElement}
	*/
	SFDataTreeElement.prototype.getNextView=function()
	{
	    return this.Collapse?this.getNextSibling(true):this.getNext();
	}
	/**
	获得当前没有被隐藏的上一个元素
	@returns {SFDataTreeElement}
	*/
	SFDataTreeElement.prototype.getPreviousView=function()
	{
		var t=this.getPreviousSibling();
		if (t){return t.getLastDescendant(true)}
		t=this.getParent();
		if(t && t.getOutlineLevel()>0){return t;}
		return null;
	}
	/**
	判断元素是否被隐藏(被上级元素的Collapse属性折叠起来)
	@returns {Bool}
	*/
	SFDataTreeElement.prototype.isHidden=function()
	{
		if(!this.data){return true;}
		for(var t=this.getParentTask();t;t=t.getParentTask())
		{
			if(t.Collapse || !t.data)
			{
				return true;
			}
		}
		return false;
	}
	/**
	判断一个元素是否包含另一个元素
	@param {SFDataTreeElement} element
	@returns {Bool} 如果当前元素包含element元素，则返回true
	*/
	SFDataTreeElement.prototype.contains=function(element)
	{
		for(var p=element;p;p=p.getParent())
		{
			if(p==this){return true;}
		}
		return false;
	}
	/**
	返回当前的元素在兄弟元素之中的索引，例如如果改元素是其父元素的第一个子元素，则为1，如果是第二个子元素，则为2，依次类推
	@returns {Number}
	*/
	SFDataTreeElement.prototype.getSiblingIndex=function()
	{
		var index=0,c=this;
		while(c)
		{
			c=c.getPreviousSibling();
			index++;
		}
		return index;
	}
	/**
	计算并返回当前元素的大纲编号，这个返回值和OutlineNumber对应
	@param {SFData} [data] 对于还没有创建完成的元素，应该传递此参数预先计算大纲
	@returns {String}
	*/
	SFDataTreeElement.prototype.getOutlineNumber=function(data)
	{
		data=data?data:this.data;
		var t=this,root=data.getRootElement(this.elementType);
		if(t==root){return "0"}
		var arr=[];
		while (t && t!=root)
		{
			arr.unshift(t.getSiblingIndex())
			t=t.getParent()
		}
		return arr.join(".")
	}
	/**
	计算并返回当前元素的大纲数字，这个返回值和OutlineLevel对应
	@returns {Number}
	*/
	SFDataTreeElement.prototype.getOutlineLevel=function()
	{
		var t=this,num=-1;
		while (t)
		{
			num++
			t=t.getParent()
		}
		return num
	}
	/**
	任务对象的实体类型，代表数据之中的一个任务，当需要创建一个任务时，应该使用{@link SFData#addTask}而不是使用构造函数创建
	@class
	@extends SFDataTreeElement
	*/
	function SFDataTask()
	{
		this.elementType="Task";
		SFGlobal.setProperty(this,{SuccessorLinks:[],PredecessorLinks:[],Assignments:[]});
		SFGlobal.setProperty(this,{getParentTask:this.getParent,getNextTask:this.getNext,getPreviousTask:this.getPrevious,getAncestorTask:this.getAncestor,getNextViewTask:this.getNextView,getPreviousViewTask:this.getPreviousView,containsTask:this.contains});
	}
	SFDataTask.prototype=new SFDataTreeElement();
	/**
	此方法已经失效，无需调用
	@private
	@deprecate
	*/
	SFDataTask.prototype.update=function(){}
	/**
	检查概要任务的时间是否和子任务的时间一致，如果不一致，则更新概要任务的时间
	*/
	SFDataTask.prototype.checkTime=function()
	{
		var startDate=Number.MAX_VALUE,endDate=Number.MIN_VALUE;
		for(var child=this.getFirstChild();child;child=child.getNextSibling())
		{
			if(child.Start){startDate=Math.min(startDate,child.Start.valueOf());}
			if(child.Finish){endDate=Math.max(endDate,child.Finish.valueOf());}
		}
		if(startDate==Number.MAX_VALUE)//说明已经没有子节点了
		{
			//this.setProperty("Finish",this.Start);
		}
		else
		{
			this.setProperty("Start",new Date(startDate));
			this.setProperty("Finish",new Date(Math.max(startDate,endDate)));
		}
	}
	/**
	返回任务的所有前置链接数组
	@returns {SFDataLink[]}
	*/
	SFDataTask.prototype.getPredecessorLinks=function()
	{
		if(!this.linksRead)
		{
			this.data.readTaskLinks(this);
			this.linksRead=true;
		}
		return this.PredecessorLinks;
	}
	/**
	返回任务的所有后置链接数组
	@returns {SFDataLink[]}
	*/
	SFDataTask.prototype.getSuccessorLinks=function()
	{
		if(!this.linksRead)
		{
			this.data.readTaskLinks(this);
			this.linksRead=true;
		}
		return this.SuccessorLinks;
	}
	/**
	返回任务的所有前置任务数组
	@returns {SFDataTask[]}
	*/
	SFDataTask.prototype.getPredecessorTasks=function()
	{
		var tasks=[],links=this.getPredecessorLinks();
		for(var i=0;i<links.length;i++)
		{
			tasks.push(links[i].getPredecessorTask());
		}
		return tasks;
	}
	/**
	返回任务的所有后置任务数组
	@returns {SFDataTask[]}
	*/
	SFDataTask.prototype.getSuccessorTasks=function()
	{
		var tasks=[],links=this.getSuccessorLinks();
		for(var i=0;i<links.length;i++)
		{
			tasks.push(links[i].getSuccessorTask());
		}
		return tasks;
	}
	/**
	返回任务的所有资源分配数组
	@returns {SFDataAssignment[]}
	*/
	SFDataTask.prototype.getAssignments=function()
	{
		if(this.Summary){return [];}
		if(!this.assignmentsRead)
		{
			this.data.readTaskAssignments(this);
			this.assignmentsRead=true;
		}
		return this.Assignments;
	}
	/**
	给任务添加前置链接，并返回添加的链接，如果添加失败，则返回null
	@param {SFDataTask} objTask 链接的对象任务
	@param {Number} type 链接的类型，可参看{@link SFDataTask#Type}
	@returns {SFDataLink}
	*/
	SFDataTask.prototype.addPredecessorLink=function(objTask,type)
	{
		var link=this.data.addLink(this,objTask,type);
		return link;
	}
	/**
	给任务添加后置链接，并返回添加的链接，如果添加失败，则返回null
	@param {SFDataTask} objTask 链接的对象任务
	@param {Number} type 链接的类型，可参看{@link SFDataLink#Type}
	@returns {SFDataLink}
	*/
	SFDataTask.prototype.addSuccessorLink=function(objTask,type)
	{
		var link=this.data.addLink(objTask,this,type);
		return link;
	}
	/**
	给任务添加资源分配，并返回添加的分配对象，如果添加失败，则返回null
	@param {SFDataResource} resource 分配的资源
	@param {Number} unit 资源的分配比例，可参看{@link SFDataAssignment#Units}
	@returns {SFDataAssignment}
	*/
	SFDataTask.prototype.addAssignment=function(resource,unit)
	{
		var am=this.data.addAssignment(this,resource,unit);
		if(!am){return;}
		if(unit){am.setProperty("Units",unit);}
		return am;
	}
	/**
	计算工期并返回
	@param {String} [start] 任务开始时间
	 @param {String} [finish] 任务结束时间
	@returns {SFDataAssignment}
	*/
	SFDataTask.prototype.getDuration=function(start,finish)
	{
		start = start || this.Start;
		finish = finish || this.Finish;
		var cal=this.data.getCalendar(),startTime=start,lastDat=-1,num=0;
		while(startTime<finish)
		{
			var time=cal.getWorkTime(startTime);
			if(time[0]>=finish){break;}
			var day=[parseInt(((time[0]/1000/60)-time[0].getTimezoneOffset())/60/24),parseInt(((time[1]/1000/60)-time[1].getTimezoneOffset())/60/24)];
			num+=day[1]-day[0]+1;
			if(lastDat==day[0]){num--;}
			lastDat=day[1];
			startTime=time[1];
		}
		return num;
	}

	/**
	资源对象的实体类型，用来代表甘特数据之中的一个资源信息，当需要创建一个资源时，应该使用{@link SFData#addResource}而不是使用构造函数创建
	@class
	@extends SFDataTreeElement
	*/
	function SFDataResource()
	{
		this.elementType="Resource";
		SFGlobal.setProperty(this,{getParentResource:this.getParent,getNextResource:this.getNext,getPreviousResource:this.getPrevious,getAncestorResource:this.getAncestor,getNextViewResource:this.getNextView,getPreviousViewResource:this.getPreviousView,containsResource:this.contains});
		this.Assignments=[];
	}
	SFDataResource.prototype=new SFDataTreeElement();
	/**
	返回资源的所有分配数组
	@returns {SFDataAssignment[]}
	*/
	SFDataResource.prototype.getAssignments=function()
	{
		if(!this.assignmentsRead)
		{
			this.data.readResourceAssignments(this);
			this.assignmentsRead=true;
		}
		return this.Assignments;
	}
	/**
	为资源添加一个分配，并返回添加的分配对象，如果添加失败，则返回null
	@param {SFDataTask} task 分配的任务
	@param {Number} unit 资源的分配比例，可参看{@link SFDataAssignment#Units}
	@returns {SFDataAssignment}
	*/
	SFDataResource.prototype.addAssignment=function(task,unit)
	{
		var am=this.data.addAssignment(task,this);
		if(!am){return;}
		if(unit){am.setProperty("Units",unit);}
		return am;
	}
	/**
	链接对象的实体类型，用来代表甘特数据之中的一个任务间链接，当需要创建一个链接时，应该使用{@link SFData#addLink}而不是使用构造函数创建
	@class
	@extends SFDataElement
	*/
	function SFDataLink()
	{
		this.elementType="Link";
	}
	SFDataLink.prototype=new SFDataElement();
	/**
	获取链接的前置任务
	@returns {SFDataTask}
	*/
	SFDataLink.prototype.getPredecessorTask=function()
	{
		return this.PredecessorTask;
	}
	/**
	获取链接的后置任务
	@returns {SFDataTask}
	*/
	SFDataLink.prototype.getSuccessorTask=function()
	{
		return this.SuccessorTask;
	}
	/**
	资源分配对象的实体类型，用来代表甘特数据之中的一个资源分配信息，当需要创建一个资源分配时，应该使用{@link SFData#addAssignment}而不是使用构造函数创建
	@class
	@extends SFDataElement
	*/
	function SFDataAssignment()
	{
		this.elementType="Assignment";
	}
	SFDataAssignment.prototype=new SFDataElement();
	/**
	获取分配的任务
	@returns {SFDataTask}
	*/
	SFDataAssignment.prototype.getTask=function()
	{
		return this.task?this.task:this.data.getTaskByUid(this.TaskUID);
	}
	/**
	获取分配的资源
	@returns {SFDataResource}
	*/
	SFDataAssignment.prototype.getResource=function()
	{
		return this.resource?this.resource:this.data.getResourceByUid(this.ResourceUID);
	}
	window.SFDataElement=SFDataElement;
	window.SFDataTreeElement=SFDataTreeElement;
	window.SFDataTask=SFDataTask;
	window.SFDataResource=SFDataResource;
	window.SFDataLink=SFDataLink;
	window.SFDataAssignment=SFDataAssignment;