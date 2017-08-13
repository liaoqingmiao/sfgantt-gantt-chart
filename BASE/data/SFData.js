	/**
	数据管理对象，对甘特数据的任务、资源、链接、分配进行管理
	@param {SFDataAdapter} adapter 数据适配器对象，该对象实现SFData和数据源之间的访问接口
	@param {SFConfig} [config] 配置参数，这些参数直接影响到数据的表现，其中的大部分设置之后在设置后不能更改
	@class
	*/
	function SFData(adapter,config)
	{
		config=config?config:new SFConfig();
		SFConfig.applyProperty(this,config.getConfigObj("SFData"));
		SFGlobal.setProperty(this,{modules:[],adapter:adapter,components:[],rootElement:{},lastElement:{},elementUids:{}});
		adapter.initialize();
		this.initialize();
	}
	/**
	数据模块的初始化
	@private
	*/
	SFData.prototype.initialize=function()
	{
		this.addTreeModule("Task");
		this.addTreeModule("Resource");
		this.addModule("Link");
		this.addModule("Assignment");

		/**
		在任务之间添加一个链接
		@param {SFDataTask} sucTask 链接的后置任务
		@param {SFDataTask} preTask 链接的前置任务
		@param {Number} [type=1] 链接的类型,有以下几种
			<ul>
				<li>0 : 完成-完成(FF);</li>
				<li>1 : 完成-开始(FS);</li>
				<li>2 : 开始-完成(SF);</li>
				<li>3 : 开始-开始(SS);</li>
			</ul>
		@returns {SFDataLink}
		*/
		this.addLink=function(sucTask,preTask,type)
		{
			/**
			判断是否允许添加新链接
			@name SFData.prototype.canAddLink
			@param {SFDataTask} sucTask 链接的后置任务.
			@param {SFDataTask} preTask 链接的前置任务.
			@param {Number} type 链接的类型,有以下几种
				<ul>
					<li>0 : 完成-完成(FF);</li>
					<li>1 : 完成-开始(FS);</li>
					<li>2 : 开始-完成(SF);</li>
					<li>3 : 开始-开始(SS);</li>
				</ul>
			@returns {Bool} 如果能添加返回true,失败返回false
			@function
			*/
			/** 
				@event
				@name SFData#beforelinkadd
				@description 在新建一个链接之前触发。
				@param {Json} returnObj 如果设置returnObj.returnValue=false,则代表拒绝添加此链接，此链接就不会被添加.
				@param {SFDataTask} sucTask 链接的后置任务.
				@param {SFDataTask} preTask 链接的前置任务.
				@param {Number} type 链接的类型,有以下几种
					<ul>
						<li>0 : 完成-完成(FF);</li>
						<li>1 : 完成-开始(FS);</li>
						<li>2 : 开始-完成(SF);</li>
						<li>3 : 开始-开始(SS);</li>
					</ul>
			 */
			if(!this.checkEvent("beforelinkadd",[sucTask,preTask,type])){return false;}
			var link=this.adapter.addLink(sucTask,preTask,type);
			link.PredecessorTask=preTask;
			link.SuccessorTask=sucTask;
			link.Type=type;
			this.registerLink(link);
			/** 
				@event
				@name SFData#afterlinkadd
				@description 在新建一个链接之后触发。
				@param {SFDataLink} link 代表刚刚添加的新链接.
			 */
			SFEvent.trigger(this,"afterlinkadd",[link]);
			return link;
		}
		/**
		新建一个资源分配并返回该对象,如果新建失败，则返回null
		@param {SFDataTask} task 分配的任务
		@param {SFDataResource} resource 分配的资源
		@param {Number} unit 资源的占用比例，0-1的小数
		@returns {SFDataAssignment}
		*/
		this.addAssignment=function(task,resource,unit)
		{
			/**
			判断是否允许添加新资源分配
			@name SFData.prototype.canAddAssignment
			@param {SFDataTask} task 分配的任务.
			@param {SFDataTask} resource 分配的资源.
			@param {Number} unit 资源的占用比例，0-1的小数
			@returns {Bool} 如果能添加返回true,失败返回false
			@function
			*/
			/** 
				@event
				@name SFData#beforeassignmentadd
				@description 在新建一个资源分配之前触发。
				@param {Json} returnObj 如果设置returnObj.returnValue=false,则代表拒绝添加此资源分配，此资源分配就不会被添加.
				@param {SFDataTask} task 分配的任务.
				@param {SFDataTask} resource 分配的资源.
				@param {Number} unit 资源的占用比例，0-1的小数
			 */
			if(!this.checkEvent("beforeassignmentadd",[task,resource,unit])){return false;}
			var assignment=this.adapter.addAssignment(task,resource,unit);
			assignment.task=task;
			assignment.resource=resource;
			this.registerAssignment(assignment);
			/** 
				@event
				@name SFData#afterassignmentadd
				@description 在新建一个资源分配之后触发。
				@param {SFDataAssignment} assignment 代表刚刚添加的新资源分配.
			 */
			SFEvent.trigger(this,"afterassignmentadd",[assignment]);
			return assignment;
		}
		/**
		@private
		注册链接，不过这个函数并不真正将链接注册，因为链接的对应任务可能还没有被读取，
		如果链接确实还有前置或后置任务没有读取，则等到读取的时候再注册链接
		@param {SFDataLink} link 需要注册的链接
		*/
		this._registerLink=function(link)
		{
			if(!link.SuccessorTask){link.SuccessorTask=this.getTaskByUid(link.SuccessorUID,false);}
			if(!link.PredecessorTask){link.PredecessorTask=this.getTaskByUid(link.PredecessorUID,false);}
			if(link.SuccessorTask&&link.PredecessorTask)
			{
				this.registerLink(link);
				return;
			}
			if(!this.afterTaskLinks){this.afterTaskLinks={};}
			if(link.SuccessorUID && !link.SuccessorTask)
			{
				var uid=link.SuccessorUID;
				if(!this.afterTaskLinks[uid])this.afterTaskLinks[uid]=[];
				this.afterTaskLinks[uid].push(link);
			}
			if(link.PredecessorUID && !link.PredecessorTask)
			{
				var uid=link.PredecessorUID;
				if(!this.afterTaskLinks[uid])this.afterTaskLinks[uid]=[];
				this.afterTaskLinks[uid].push(link);
			}
		}
		/**
		@private
		读取指定任务的所有链接，对每个任务只会执行一次
		@param {SFDataTask} task 指定的任务
		*/
		this.readTaskLinks=function(task)
		{
			//在这里采用新的逻辑，如果链接对应的任务没有成功下载，则记录到数组之中
			//在后面任务下载完成之后，再重新处理
			for(var link=this.adapter.readTaskFirstLink(task);link;link=this.adapter.readTaskNextLink(task,link))
			{
				this._registerLink(link);
			}
		}
		/**
		@private
		读取指定任务的所有资源分配，对每个任务只会执行一次
		@param {SFDataTask} task 指定的任务
		*/
		this.readTaskAssignments=function(task)
		{
			for(var assignment=this.adapter.readTaskFirstAssignment(task);assignment;assignment=this.adapter.readTaskNextAssignment(task,assignment))
			{
				assignment.task=task;
				this.registerAssignment(assignment);
			}
		}
		/**
		@private
		读取指定资源的所有分配，对每个资源只会执行一次
		@param {SFDataResource} resource 指定的资源
		*/
		this.readResourceAssignments=function(resource)
		{
			for(var assignment=this.adapter.readResourceFirstAssignment(resource);assignment;assignment=this.adapter.readResourceNextAssignment(resource,assignment))
			{
				assignment.resource=resource;
				this.registerAssignment(assignment);
			}
		}
		//在任务注册的时候，进行链接的注册
		SFEvent.bind(this,"taskregister",this,function(task)
		{
			var uid=task.UID;
			if(uid && this.afterTaskLinks && this.afterTaskLinks[uid])
			{
				var arr=this.afterTaskLinks[uid],link;
				this.afterTaskLinks[uid]=null;
				delete this.afterTaskLinks[uid];
				while(link=arr.pop())
				{
					this._registerLink(link);
				}
			}
		});
		//在任务注销的时候，进行链接和资源分配的注销
		SFEvent.bind(this,"taskunregister",this,function(element)
		{
			var links=element.PredecessorLinks;
			for(var i=links.length-1;i>=0;i--)
			{
				this.unregisterLink(links[i]);
			}
			var links=element.SuccessorLinks;
			for(var i=links.length-1;i>=0;i--)
			{
				this.unregisterLink(links[i]);
			}
			var assignments=element.Assignments;
			for(var i=assignments.length-1;i>=0;i--)
			{
				this.unregisterAssignment(assignments[i]);
			}
		});
		//在资源注销的时候，进行资源分配的注销
		SFEvent.bind(this,"resourceunregister",this,function(element)
		{
			var assignments=element.Assignments;
			for(var i=assignments.length-1;i>=0;i--)
			{
				this.unregisterAssignment(assignments[i]);
			}
		});
		//在链接注册的时候，将链接添加到任务的链接数组之中
		SFEvent.bind(this,"linkregister",this,function(link)
		{
			link.SuccessorTask.PredecessorLinks.push(link);
			link.PredecessorTask.SuccessorLinks.push(link);
		});
		//在链接注销的时候，将链接从任务的链接数组之中移除
		SFEvent.bind(this,"linkunregister",this,function(link)
		{
			SFGlobal.deleteInArray(link.PredecessorTask.SuccessorLinks,link);
			SFGlobal.deleteInArray(link.SuccessorTask.PredecessorLinks,link);
		});
		//检查任务之间是否已经存在链接,如果已经存在链接，则不允许添加
		SFEvent.bind(this,"beforelinkadd",this,function(returnObj,sucTask,preTask)
		{
			if(!sucTask || !preTask){return;}
			var links=sucTask.getPredecessorLinks();
			for(var i=links.length-1;i>=0;i--)
			{
				if(links[i].PredecessorTask==preTask)
				{
					returnObj.returnValue=false;
					return;
				}
			}
			var links=sucTask.getSuccessorLinks();
			for(var i=links.length-1;i>=0;i--)
			{
				if(links[i].PredecessorTask==preTask)
				{
					returnObj.returnValue=false;
					return;
				}
			}
		});
		//在资源分配注册的时候，将资源分配添加到对应资源的分配数组之中
		SFEvent.bind(this,"assignmentregister",this,function(assignment)
		{
			(assignment.task=assignment.getTask()).Assignments.push(assignment);
			if((assignment.resource=assignment.getResource())){assignment.resource.Assignments.push(assignment);}
		});
		//在资源分配注销的时候，将资源分配从对应资源的分配数组之中移除
		SFEvent.bind(this,"assignmentunregister",this,function(assignment)
		{
			if(assignment.task)
			{
				SFGlobal.deleteInArray(assignment.task.Assignments,assignment);
				delete assignment.task;
			}
			if(assignment.resource)
			{
				SFGlobal.deleteInArray(assignment.resource.Assignments,assignment);
				delete assignment.resource;
			}
		});
		//添加系统集成的插件
		if(this.initComponents)
		{
			var arr=this.initComponents.split(",")
			for(var i=0;i<arr.length;i++)
			{
				this.addComponent(new window[arr[i]]());
			}
		}
	}
	/**
	@private
	给数据系统添加常规模块支持，如链接和资源分配
	@param {String} type 模块名称
	*/
	SFData.prototype.addModule=function(type)
	{
		this.modules.push(type);
		this.elementUids[type]={};
		this["get"+type+"ByUid"]=function(uid,force){return this.getElementByUid(type,uid,force);}
		this["update"+type]=function(element,property,value){return this.updateElement(type,element,property,value);}
		this["register"+type]=function(element){return this.registerElement(type,element);}
		this["unregister"+type]=function(element){return this.unregisterElement(type,element);}
		this["add"+type]=function(){var argu=[type];for(var i=0;i<arguments.length;i++){argu.push(arguments[i]);}return this.addElement(argu);}
		this["canAdd"+type]=function(){return this.checkEvent("before"+type+"add",arguments);}
		this["delete"+type]=function(element){return this.deleteElement(type,element);}
		this["canDelete"+type]=function(){return this.checkEvent("before"+type+"delete",arguments);}
	}
	/**
	@private
	给数据系统添加树形模块支持，如任务和资源
	@param {String} type 指定的模块名称
	*/
	SFData.prototype.addTreeModule=function(type)
	{
		this.addModule(type);
		this["getRoot"+type]=function(item){return this.getRootElement(type);}
		this["read"+type+"FirstChild"]=function(item){return this.readElementFirstChild(type,item);}
		this["read"+type+"NextSibling"]=function(item){return this.readElementNextSibling(type,item);}
		this["get"+type+"ByOutline"]=function(outline){return this.getElementByOutline(type,outline);}
		this["compare"+type]=function(sItem,eItem){return this.compareElement(sItem,eItem);}
		this["unregister"+type]=function(element){return this.unregisterTreeElement(type,element);}
		this["add"+type]=function(parent,pElement){return this.addTreeElement(type,parent,pElement);}
		this["delete"+type]=function(element){return this.deleteTreeElement(type,element);}
		this["move"+type]=function(element,pElement,preElement){return this.moveElement(type,element,pElement,preElement);}
		this["canMove"+type]=function(element,pElement,preElement){return this.canMoveElement(type,element,pElement,preElement);}

	}
	/**
	@private
	返回所有已经加载的模块
	@returns {String[]} 返回所有模块名称数组
	*/
	SFData.prototype.getModules=function(){return this.modules;}
	/**
	给数据系统添加插件
	@param {SFDataAdapter} comp 需要被添加的插件
	*/
	SFData.prototype.addComponent=function(comp)
	{
		if(SFGlobal.findInArray(this.components,comp)){return;}
		comp.initialize(this)
		this.components.push(comp);
	}
	/**
	将插件从系统之中移除
	@param {SFDataAdapter} comp 需要被删除的插件
	*/
	SFData.prototype.removeComponent=function(comp)
	{
		comp.remove(comp);
		SFGlobal.deleteInArray(this.components,comp);
	}
	/**
	@private
	返回当前数据使用的日历对象
	@returns {SFWorkingCalendar} 日历对象
	*/
	SFData.prototype.getCalendar=function()
	{
		return this.adapter.getCalendar();
	}
	/**
	@private
	触发指定事件，并返回结果，通常用在before类型的事件之中
	@params {String} eventName 事件名称
	@params {Array} argu 事件的参数数组
	@returns {Bool} 该事件的返回值
	*/
	SFData.prototype.checkEvent=function(eventName,argu)
	{
		var en=eventName;
		var returnObj={returnValue:true};
		var eventArgu=[returnObj];
		for(var i=0;i<argu.length;i++){eventArgu.push(argu[i]);}
		SFEvent.trigger(this,en,eventArgu);
		if(!returnObj.returnValue){return false;}
		return true;
	}
	/**
	@private
	销毁此实例以释放内存
	*/
	SFData.prototype.depose=function()
	{
		SFEvent.clearListeners(this);
		for(var key in this){this[key]=null;}
	}
	/**
	@private
	将一个元素注册到数据管理系统之中
	@param {String} type 数据类型
	@param {SFDataElement} item 需要被添加到系统的元素
	*/
	SFData.prototype.registerElement=function(type,item)
	{
		item.data=this;
		var uid=item.UID;
		if(uid){this.elementUids[type][uid]=item;}
		/** 
			@event
			@name SFData#taskregister
			@description 在一个任务对象注册到SFData(新建或数据读取完成)时触发。
			@param {SFDataTask} task 代表刚刚注册的任务对象.
		 */
		/** 
			@event
			@name SFData#resourceregister
			@description 在一个资源对象注册到SFData(新建或数据读取完成)时触发。
			@param {SFDataResource} resource 代表刚刚注册的资源对象.
		 */
		/** 
			@event
			@name SFData#linkregister
			@description 在一个链接对象注册到SFData(新建或数据读取完成)时触发。
			@param {SFDataLink} link 代表刚刚注册的链接对象.
		 */
		/** 
			@event
			@name SFData#assignmentregister
			@description 在一个资源分配对象注册到SFData(新建或数据读取完成)时触发。
			@param {SFDataAssignment} assignment 代表刚刚注册的资源分配对象.
		 */
		SFEvent.trigger(this,type.toLowerCase()+"register",[item]);
	}
	/**
	@private
	将一个元素从数据管理系统之中注销
	@param {String} type 数据类型
	@param {SFDataElement} item 需要被注销的元素
	*/
	SFData.prototype.unregisterElement=function(type,item)
	{
		var uid=item.UID;
		if(uid)
		{
			this.elementUids[type][uid]=null;
			delete this.elementUids[type][uid];
		}
		/** 
			@event
			@name SFData#taskunregister
			@description 在一个任务对象从SFData之中分离时触发(不再由SFData管理，在删除前会执行此操作)。
			@param {SFDataTask} task 代表已经分离的任务对象.
		 */
		/** 
			@event
			@name SFData#resourceunregister
			@description 在一个资源对象从SFData之中分离时触发(不再由SFData管理，在删除前会执行此操作)。
			@param {SFDataResource} resource 代表已经分离的资源对象.
		 */
		/** 
			@event
			@name SFData#linkunregister
			@description 在一个链接对象从SFData之中分离时触发(不再由SFData管理，在删除前会执行此操作)。
			@param {SFDataLink} link 代表已经分离的链接对象.
		 */
		/** 
			@event
			@name SFData#assignmentunregister
			@description 在一个资源分配对象从SFData之中分离时触发(不再由SFData管理，在删除前会执行此操作)。
			@param {SFDataAssignment} assignment 代表已经分离的资源分配对象.
		 */
		SFEvent.trigger(this,type.toLowerCase()+"unregister",[item]);
		item.data=null;
	}
	/**
	@private
	添加一个新的元素，添加元素的方法通常都被每个数据模块重写
	@param {String} type 数据类型
	@returns {SFDataElement} 添加的元素
	*/
	SFData.prototype.addElement=function(type)
	{
		var argu=[];
		for(var i=1;i<arguments.length;i++){argu.push(arguments[i]);}
		if(!this.checkEvent("before"+type.toLowerCase()+"add",argu)){return false;}
		var newElement=this.adapter["add"+type].apply(this.adapter,argu);
		//因为链接和资源分配的对象都已经重写，因此，此函数实际上无效
		//没有触发任何事件
		SFEvent.trigger(this,"after"+type.toLowerCase()+"add",[newElement]);
		this.registerElement(type,newElement);
		return newElement;
	}
	/**
	判断是否允许删除指定的链接
	@name SFData.prototype.canDeleteLink
	@param {SFDataLink} link 需要被删除的链接
	@returns {Bool} 如果允许返回true，不允许返回false
	@function
	*/
	/**
	判断是否允许删除指定的资源分配
	@name SFData.prototype.canDeleteAssignment
	@param {SFDataAssignment} assignment 需要被删除的资源分配
	@returns {Bool} 如果允许返回true，不允许返回false
	@function
	*/
	
	/**
	删除指定的链接
	@name SFData.prototype.deleteLink
	@param {SFDataLink} link 需要被删除的链接
	@returns {Bool} 成功返回true,失败返回false
	@function
	*/
	/**
	删除指定的资源分配
	@name SFData.prototype.deleteAssignment
	@param {SFDataAssignment} assignment 需要被删除的资源分配
	@returns {Bool} 成功返回true,失败返回false
	@function
	*/
	/**
	删除指定的元素
	@private
	@param {String} type 数据类型
	@param {SFDataElement} element 需要被删除的元素
	@returns {Bool} 成功返回true,失败返回false
	*/
	SFData.prototype.deleteElement=function(type,element)
	{
		/** 
			@event
			@name SFData#beforelinkdelete
			@description 在删除一个链接之前触发。
			@param {Json} returnObj 如果设置returnObj.returnValue=false,则代表拒绝删除此链接，此链接就不会被删除.
			@param {SFDataLink} link 代表即将删除的链接.
		 */
		/** 
			@event
			@name SFData#beforeassignmentdelete
			@description 在删除一个资源分配之前触发。
			@param {Json} returnObj 如果设置returnObj.returnValue=false,则代表拒绝删除此资源分配，此资源分配就不会被删除.
			@param {SFDataLink} link 代表即将删除的资源分配.
		 */
		if(!this.checkEvent("before"+type.toLowerCase()+"delete",[element])){return false;}
		this.unregisterElement(type,element);
		this.adapter["delete"+type](element);
		/** 
			@event
			@name SFData#afterlinkdelete
			@description 在删除一个链接之后触发。
			@param {SFDataLink} link 代表已经被删除的链接对象.
		 */
		/** 
			@event
			@name SFData#afterassignmentdelete
			@description 在删除一个资源分配之后触发。
			@param {SFDataAssignment} assignment 代表已经被删除的资源分配对象.
		 */
		SFEvent.trigger(this,"after"+type.toLowerCase()+"delete",[element]);
		return true;
	}
	/**
	返回文档根任务，文档根任务应该是ID=0并且在甘特图上不显示的一个任务
	@name SFData.prototype.getRootTask
	@returns {SFDataTask}
	@function
	*/
	/**
	返回文档根资源，文档根资源应该是ID=0并且在甘特图上不显示的一个资源
	@name SFData.prototype.getRootResource
	@returns {SFDataResource}
	@function
	*/
	/**
	返回文档根元素，文档根元素应该是ID=0并且在甘特图上不显示的一个元素
	@private
	@param {String} type 数据类型
	@returns {SFDataElement}
	*/
	SFData.prototype.getRootElement=function(type)
	{
		var t=this.rootElement[type]
		if(!t)
		{
			t=this.rootElement[type]=this.adapter["readRoot"+type]();
			if(t){this.registerElement(type,t);}
		}
		return t;
	}
	/**
	@private
	读取第一个子节点对象，只有在没有读取过的时候才进行读取
	@param {String} type 数据类型
	@param {SFDataElement} element 元素
	@returns {SFDataElement} 元素的第一个子元素
	*/
	SFData.prototype.readElementFirstChild=function(type,element)
	{
		if(!element.firstChild)
		{
			var t=element.firstChild=this.adapter["read"+type+"FirstChild"](element);
			if(t)
			{
				t.parent=element;
				this.registerElement(type,t);
			}
		}
		return element.firstChild;
	}
	/**
	@private
	读取取元素的下一个兄弟元素，只有在没有读取过的时候才进行读取
	@param {String} type 数据类型
	@param {SFDataElement} element 元素
	@returns {SFDataElement} 任务的下一个任务
	*/
	SFData.prototype.readElementNextSibling=function(type,element)
	{
		if(element==this.getRootElement(type)){return null;}
		if(!element.nextSibling)
		{
			var t=element.nextSibling=this.adapter["read"+type+"NextSibling"](element);
			if(t)
			{
				t.previousSibling=element;
				t.parent=element.parent;
				this.registerElement(type,element.nextSibling);
			}
		}
		return element.nextSibling;
	}
	/**
	根据指定的任务UID返回该任务
	@name SFData.prototype.getTaskByUid
	@param {String} uid 该任务的UID值
	@param {Bool} [force=false] 是否强制查询，如果为false,只在当前已经加载的数据之中查找
	@returns {SFDataTask}
	@function
	*/

	/**
	根据指定的资源UID返回该资源
	@name SFData.prototype.getResourceByUid
	@param {String} uid 该资源的UID值
	@param {Bool} [force=false] 是否强制查询，如果为false,只在当前已经加载的数据之中查找
	@returns {SFDataResource}
	@function
	*/

	/**
	根据指定的链接UID返回该链接
	@name SFData.prototype.getLinkByUid
	@param {String} uid 该链接的UID值
	@param {Bool} [force=false] 是否强制查询，如果为false,只在当前已经加载的数据之中查找
	@returns {SFDataLink}
	@function
	*/

	/**
	根据指定的资源分配记录UID返回该记录
	@name SFData.prototype.getAssignmentByUid
	@param {String} uid 该记录的UID值
	@param {Bool} [force=false] 是否强制查询，如果为false,只在当前已经加载的数据之中查找
	@returns {SFDataAssignment}
	@function
	*/

	/**
	用来实现根据UID查找元素的函数
	@private
	@param {String} type 数据类型
	@param {String} uid 该资源的UID值
	@param {Bool} [force=false] 是否强制查询，如果为false,只在当前已经加载的数据之中查找
	@returns {SFDataElement}
	*/
	SFData.prototype.getElementByUid=function(type,uid,force)
	{
		var element=this.elementUids[type][uid];
		if(element || force===false){return element;}
		if(!this.lastElement[type]){this.lastElement[type]=this.getRootElement(type);}
		while(this.lastElement[type]=this.lastElement[type].getNext())
		{
			if(this.lastElement[type].UID==uid)
			{
				return this.lastElement[type];
			}
		}
		return null;
	}
	/**
	根据大纲来查找任务
	@name SFData.prototype.getTaskByOutline
	@param {String} outline 大纲，如"1.2.1.4"
	@returns {SFDataTask}
	@function
	*/
	/**
	根据大纲来查找资源
	@name SFData.prototype.getResourceByOutline
	@param {String} outline 大纲，如"1.2.1.4"
	@returns {SFDataResource}
	@function
	*/
	/**
	@private
	根据大纲来查找元素
	@param {String} type 数据类型
	@param {String} outline 大纲，如"1.2.1.4"
	@returns {SFDataElement} 查找到的对应元素，如果没有找到，则返回null
	*/
	SFData.prototype.getElementByOutline=function(type,outline)
	{
		var element=this.getRootElement(type);
		if(!outline){return element;}
		return this.searchElementOutline(type,element,outline.split("."));
	}
	/**
	@private
	根据子大纲来查找子元素,这个函数用来通过递归完成getElementByOutline的方法
	@param {String} type 数据类型
	@param {String} outline 子大纲，如"1.4"
	@returns {SFDataElement} 查找到的对应子元素，如果没有找到，则返回null
	*/
	SFData.prototype.searchElementOutline=function(type,element,outline)
	{
		if(outline.length==0){return element}
		var child=element.getFirstChild(),index=outline.shift();
		for(var i=1;i<index;i++)
		{
			child=child.getNextSibling();
		}
		return this.searchElementOutline(type,child,outline);
	}
	/**
	比较两个任务在任务树之中的上下顺序
	@name SFData.prototype.compareTask
	@param {SFDataTask} startTask 任务1
	@param {SFDataTask} endTask 任务2
	@returns {Number} 如果任务1确实是在任务2之前，则返回1，否则返回-1
	@function
	*/
	/**
	比较两个资源在资源树之中的上下顺序
	@name SFData.prototype.compareResource
	@param {SFDataResource} startResource 资源1
	@param {SFDataResource} endResource 资源2
	@returns {Number} 如果资源1确实是在资源2之前，则返回1，否则返回-1
	@function
	*/
	/**
	@private
	比较两个元素在XML树之中的上下顺序
	@param {SFDataElement} startElement 元素1
	@param {SFDataElement} endElement 元素2
	@returns {Number} 如果元素1确实是在元素2之前，则返回1，否则返回-1
	*/
	SFData.prototype.compareElement=function(startElement,endElement)
	{
		var sArr=startElement.getOutlineNumber(this).split(".");
		var eArr=endElement.getOutlineNumber(this).split(".");
		var min=Math.min(sArr.length,eArr.length);
		for(var i=0;i<min;i++)
		{
			if(sArr[i]*1<eArr[i]*1){return 1;}
			if(sArr[i]*1>eArr[i]*1){return -1;}
		}
		if(sArr.length==eArr.length){return 0;}
		return (sArr.length<eArr.length)?1:-1;
	}
	/**
	修改任务的属性
	@name SFData.prototype.updateTask
	@param {SFDataTask} 被修改的任务
	@param {String} property 属性名称
	@param {variant} value 修改后的新值，任意类型
	@function
	*/
	/**
	修改资源的属性
	@name SFData.prototype.updateResource
	@param {SFDataResource} 被修改的资源
	@param {String} property 属性名称
	@param {variant} value 修改后的新值，任意类型
	@function
	*/
	/**
	修改链接的属性
	@name SFData.prototype.updateLink
	@param {SFDataLink} 被修改的链接
	@param {String} property 属性名称
	@param {variant} value 修改后的新值，任意类型
	@function
	*/
	/**
	修改资源分配的属性
	@name SFData.prototype.updateAssignment
	@param {SFDataAssignment} 被修改的资源分配
	@param {String} property 属性名称
	@param {variant} value 修改后的新值，任意类型
	@function
	*/
	/**
	@private
	修改元素的属性
	@param {String} type 数据类型
	@param {SFDataElement} 被修改的元素
	@param {String} property 属性名称
	@param {variant} value 修改后的新值，任意类型
	*/
	SFData.prototype.updateElement=function(type,element,property,value)
	{
		this.adapter["update"+type](element,property,value);
	}
	/**
	在指定的位置插入一个新任务,并返回新插入的任务,如果插入失败，则返回null
	@name SFData.prototype.addTask
	@param {SFDataTask} parent 新任务的父任务
	@param {SFDataTask} [pTask] 新任务的前一个兄弟任务,如果新任务是父任务的第一个子任务，则为null
	@returns {SFDataTask}
	@function
	*/
	/**
	在指定的位置插入一个新资源,并返回新插入的资源,如果插入失败，则返回null
	@name SFData.prototype.addResource
	@param {SFDataResource} parent 新资源的父资源
	@param {SFDataResource} [pResource] 新资源的前一个兄弟资源,如果新资源是父资源的第一个子资源，则为null
	@returns {SFDataResource}
	@function
	*/

	/**
	在指定的位置插入一个新元素,并返回新插入的元素,如果插入失败，则返回null
	@private
	@param {String} type 数据类型
	@param {SFDataTask} parent 新元素的父元素
	@param {SFDataTask} [pElement] 新元素的前一个兄弟元素,如果新元素是父元素的第一个子元素，则为null
	@returns {SFDataElement}
	*/
	SFData.prototype.addTreeElement=function(type,parent,pElement)
	{
		/**
		判断是否允许添加新任务
		@name SFData.prototype.canAddTask
		@param {SFDataTask} parent 新任务的父任务.
		@param {SFDataTask} pTask 新任务的前一个兄弟节点任务，如果新任务是其父任务的第一个子任务，则为null.
		@returns {Bool} 如果能添加返回true,失败返回false
		@function
		*/
		/**
		判断是否允许添加新资源
		@name SFData.prototype.canAddResource
		@param {SFDataResource} parent 新资源的父资源.
		@param {SFDataResource} pResource 新资源的前一个兄弟节点资源，如果新资源是其父资源的第一个子资源，则为null.
		@returns {Bool} 如果能添加返回true,失败返回false
		@function
		*/
		/** 
			@event
			@name SFData#beforetaskadd
			@description 在新建一个任务之前触发。
			@param {Json} returnObj 如果设置returnObj.returnValue=false,则代表拒绝在此处添加任务，此任务就不会被添加.
			@param {SFDataTask} parent 新任务的父任务.
			@param {SFDataTask} pTask 新任务的前一个兄弟节点任务，如果新任务是其父任务的第一个子任务，则为null.
		 */
		/** 
			@event
			@name SFData#beforeresourceadd
			@description 在新建一个资源之前触发。
			@param {Json} returnObj 如果设置returnObj.returnValue=false,则代表拒绝在此处添加资源，此资源就不会被添加.
			@param {SFDataResource} parent 新资源的父资源.
			@param {SFDataResource} pResource 新资源的前一个兄弟节点资源，如果新资源是其父资源的第一个子资源，则为null.
		 */
		if(!this.checkEvent("before"+type.toLowerCase()+"add",[parent,pElement])){return false;}
		if(!parent.getFirstChild())
		{
			parent.setProperty("Summary",true);
		}
		var newElement=this.adapter["add"+type](parent,pElement);
		newElement.parent=parent;
		//计算出任务之间的关系
		if(!pElement)
		{
			newElement.previousSibling=null;
			newElement.nextSibling=parent.getFirstChild();
			if(newElement.nextSibling)
			{
				newElement.nextSibling.previousSibling=newElement;
			}
			parent.firstChild=newElement;
		}
		else
		{
			newElement.previousSibling=pElement;
			newElement.nextSibling=pElement.getNextSibling();
			if(newElement.nextSibling)
			{
				newElement.nextSibling.previousSibling=newElement;
			}
			pElement.nextSibling=newElement;
		}
		this.registerElement(type,newElement);
		/** 
			@event
			@name SFData#aftertaskadd
			@description 在新建一个任务之后触发。
			@param {SFDataTask} newTask 代表刚刚添加的新任务.
		 */
		/** 
			@event
			@name SFData#afterresourceadd
			@description 在新建一个资源之后触发。
			@param {SFDataResource} newResource 代表刚刚添加的新资源.
		 */
		SFEvent.trigger(this,"after"+type.toLowerCase()+"add",[newElement]);
		return newElement;
	}
	/**
	判断是否允许删除指定的任务
	@name SFData.prototype.canDeleteTask
	@param {SFDataTask} task 需要被删除的任务
	@returns {Bool} 如果允许返回true，不允许返回false
	@function
	*/
	/**
	判断是否允许删除指定的资源
	@name SFData.prototype.canDeleteResource
	@param {SFDataResource} resource 需要被删除的资源
	@returns {Bool} 如果允许返回true，不允许返回false
	@function
	*/
	/**
	删除指定的任务,如果该任务存在子任务，则所有的子任务也会被删除
	@name SFData.prototype.deleteTask
	@param {SFDataTask} task 需要被删除的任务
	@returns {Bool} 成功返回true,失败返回false
	@function
	*/
	/**
	删除指定的资源,如果该资源存在子资源，则所有的子资源也会被删除
	@name SFData.prototype.deleteResource
	@param {SFDataResource} resource 需要被删除的资源
	@returns {Bool} 成功返回true,失败返回false
	@function
	*/

	/**
	删除指定的元素,如果该元素存在子元素，则所有的子元素也会被删除
	@private
	@param {String} type 数据类型
	@param {SFDataElement} element 需要被删除的元素
	@returns {Bool} 成功返回true,失败返回false
	*/
	SFData.prototype.deleteTreeElement=function(type,element)
	{
		/** 
			@event
			@name SFData#beforetaskdelete
			@description 在删除一个任务之前触发。
			@param {Json} returnObj 如果设置returnObj.returnValue=false,则代表拒绝删除此任务，此任务就不会被删除.
			@param {SFDataTask} task 代表即将删除的任务.
		 */
		/** 
			@event
			@name SFData#beforeresourcedelete
			@description 在删除一个资源之前触发。
			@param {Json} returnObj 如果设置returnObj.returnValue=false,则代表拒绝删除此资源，此资源就不会被删除.
			@param {SFDataResource} resource 代表即将删除的资源.
		 */
		if(!this.checkEvent("before"+type.toLowerCase()+"delete",[element])){return false;}
		var parent=element.getParent(),pt=element.getPreviousSibling(),nt=element.getNextSibling();//先记录下该值
		if(pt){pt.nextSibling=nt;}
		if(nt){nt.previousSibling=pt;}
		if(parent)
		{
			if(parent.getFirstChild()==element){parent.firstChild=nt;}
			parent.setProperty("Summary",!!parent.getFirstChild());
		}
		element.previousSibling=null;
		element.nextSibling=null;
		this.adapter["delete"+type](element);
		this.unregisterTreeElement(type,element)
		/** 
			@event
			@name SFData#aftertaskdelete
			@description 在删除一个任务之后触发，第一个参数是被删除的任务对象，后两个参数是用来代表被删除任务原来的位置
			@param {SFDataTask} task 代表已经被删除任务.
			@param {SFDataTask} parent 已删除任务的父任务.
			@param {SFDataTask} pTask 已删除任务的前一个兄弟节点任务，如果被删除的任务原来是其父任务的第一个子任务，则为null.
		 */
		/** 
			@event
			@name SFData#afterresourcedelete
			@description 在删除一个资源之后触发，第一个参数是被删除的资源对象，后两个参数是用来代表被删除资源原来的位置
			@param {SFDataResource} resource 代表已经被删除资源.
			@param {SFDataResource} parent 已删除资源的父资源.
			@param {SFDataResource} pResource 已删除资源的前一个兄弟节点资源，如果被删除的资源原来是其父资源的第一个子资源，则为null.
		 */
		SFEvent.trigger(this,"after"+type.toLowerCase()+"delete",[element,parent,pt]);
		return true;
	}
	/**
	@private
	将树形元素从数据系统中注销
	@param {String} type 数据类型
	@param {SFDataElement} element 元素
	*/
	SFData.prototype.unregisterTreeElement=function(type,element)
	{
		var child=element.firstChild;
		element.firstChild=null;
		while(child)
		{
			this.unregisterTreeElement(type,child);
			var c=child.nextSibling;
			child.nextSibling=null;
			child.previousSibling=null;
			child.parent=null;
			child=c;
		}
		this.unregisterElement(type,element);
	}
	/**
	移动一个任务
	@name SFData.prototype.moveTask
	@param {SFDataTask} task 需要被移动的任务
	@param {SFDataTask} pTask 新位置的父任务
	@param {SFDataTask} preTask 新位置的前一个兄弟节点任务，如果新位置是父任务的第一个子任务，则为null
	@returns {Bool} 成功返回true,失败返回false
	@function
	*/
	/**
	移动一个资源
	@name SFData.prototype.moveResource
	@param {SFDataResource} resource 需要被移动的资源
	@param {SFDataResource} pResource 新位置的父资源
	@param {SFDataResource} preResource 新位置的前一个兄弟节点资源，如果新位置是父资源的第一个子资源，则为null
	@returns {Bool} 成功返回true,失败返回false
	@function
	*/

	/**
	移动一个元素。升级、降级、拖动改变位置都可以使用本方法
	@private
	@param {String} type 数据类型
	@param {SFDataElement} element 需要被移动的元素
	@param {SFDataElement} pElement 新位置的父元素
	@param {SFDataElement} preElement 新位置的前一个兄弟节点元素，如果新位置是父元素的第一个子元素，则为null
	@returns {Bool} 成功返回true,失败返回false
	*/
	SFData.prototype.moveElement=function(type,element,pElement,preElement)
	{
		if(!this.canMoveElement(type,element,pElement,preElement)){return false;}
		//下面切断该任务群和原有位置的所有关联
		var parent=element.getParent(),previousSibling=element.getPreviousSibling(),nextSibling=element.getNextSibling();//先记录下该值
		if(parent.getFirstChild()==element)
		{
			parent.firstChild=nextSibling;
			if(!nextSibling){parent.setProperty("Summary",false);}
		}
		element.parent=null;
		if(previousSibling)
		{
			previousSibling.nextSibling=nextSibling;
			element.previousSibling=null;
		}
		if(nextSibling)
		{
			nextSibling.previousSibling=previousSibling;
			element.nextSibling=null;
		}
		//下面建立该任务群和新位置的所有关联
		element.parent=pElement;
		element.previousSibling=preElement;
		if(preElement)
		{
			element.nextSibling=preElement.getNextSibling();
			preElement.nextSibling=element;
		}
		else
		{
			element.nextSibling=pElement.getFirstChild();
			pElement.firstChild=element;
		}
		if(element.nextSibling){element.nextSibling.previousSibling=element;}
		//下面开始更新大纲级别
		pElement.setProperty("Summary",true);
		this.adapter["move"+type](element,parent,previousSibling);
		/** 
			@event
			@name SFData#aftertaskmove
			@description 在移动一个任务之后触发
			@param {SFDataTask} task 被移动的任务.
			@param {SFDataTask} parent 原位置的父任务.
			@param {SFDataTask} pTask 原位置的前一个兄弟节点任务，如果被移动的任务原来是其父任务的第一个子任务，则为null.
		 */
		/** 
			@event
			@name SFData#afterresourcemove
			@description 在移动一个资源之后触发
			@param {SFDataResource} resource 被移动的资源.
			@param {SFDataResource} parent 原位置的父资源.
			@param {SFDataResource} pResource 原位置的前一个兄弟节点资源，如果被移动的资源原来是其父资源的第一个子资源，则为null.
		 */
		SFEvent.trigger(this,"after"+type.toLowerCase()+"move",[element,parent,previousSibling]);
		return true;
	}
	
	/**
	检查任务是否可以移动
	@param {SFDataTask} task 代表即将被移动的任务
	@param {SFDataTask} [pTask] 移动至新位置的父任务
	@param {SFDataTask} [preTask] 移动至新位置的前一个兄弟节点任务，如果新位置是其父任务的第一个子任务，则为null
	@returns {Bool} 如果可以移动，返回true
	*/
	/**
	检查资源是否可以移动
	@param {String} type 数据类型
	@param {SFDataResource} resource 代表即将被移动的资源
	@param {SFDataResource} [pResource] 移动至新位置的父资源
	@param {SFDataResource} [preResource] 移动至新位置的前一个兄弟节点资源，如果新位置是其父资源的第一个子资源，则为null
	@returns {Bool} 如果可以移动，返回true
	*/
	
	/**
	@private
	检查元素是否可以移动
	@param {String} type 数据类型
	@param {SFDataElement} element 代表即将被移动的元素
	@param {SFDataElement} [pElement] 移动至新位置的父元素
	@param {SFDataElement} [preElement] 移动至新位置的前一个兄弟节点元素，如果新位置是其父元素的第一个子元素，则为null
	@returns {Bool} 如果可以移动，返回true
	*/
	SFData.prototype.canMoveElement=function(type,element,pElement,preElement)
	{
		if(!pElement && preElement){pElement=preElement.getParent();}
		if(!pElement){pElement=this.getRootElement(type);}
		if(preElement && preElement.getParent()!=pElement)
		{
			return false;
		}
		//检查包含关系，如果element包含parent，不允许移动
		if(element.contains(pElement))
		{
			return false;
		}
		/** 
			@event
			@name SFData#beforetaskmove
			@description 在移动一个任务之前触发。
			@param {Json} returnObj 如果设置returnObj.returnValue=false,则代表拒绝移动此任务，此任务就不会被移动.
			@param {SFDataTask} task 代表即将被移动的任务
			@param {SFDataTask} parent 移动至新位置的父任务
			@param {SFDataTask} pTask 移动至新位置的前一个兄弟节点任务，如果新位置是其父任务的第一个子任务，则为null
		 */
		/** 
			@event
			@name SFData#beforeresourcemove
			@description 在移动一个资源之前触发。
			@param {Json} returnObj 如果设置returnObj.returnValue=false,则代表拒绝移动此资源，此资源就不会被移动.
			@param {SFDataResource} resource 代表即将被移动的资源
			@param {SFDataResource} parent 移动至新位置的父资源
			@param {SFDataResource} pResource 移动至新位置的前一个兄弟节点资源，如果新位置是其父资源的第一个子资源，则为null
		 */
		//对此操作进行审核
		if(!this.checkEvent("before"+type.toLowerCase()+"move",[element,pElement,preElement])){return false;}
		return true;
	}
	window.SFData=SFData;