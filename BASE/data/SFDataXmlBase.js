	/**
	采用XML格式作为数据源的数据适配器对象基类，目前系统集成的几个格式都是采用XML格式，因此都是继承的此类；
	@extends SFDataAdapter
	@class
	*/
	function SFDataXmlBase()
	{}
	SFDataXmlBase.prototype=new window.SFDataAdapter();
	/**
	@private
	数据源的初始化，每个数据源的实现都会重写此方法
	*/
	SFDataXmlBase.prototype.initialize=function()
	{
		SFDataAdapter.prototype.initialize.apply(this,arguments);
	}
	/**
	@private
	返回对象的配置信息
	@returns {Json} 配置信息
	*/
	SFDataXmlBase.prototype.getConfig=function()
	{
		return this.config;
	}
	/**
	返回正在操作的XmlDocument对象
	@returns {XmlDocument}
	*/
	SFDataXmlBase.prototype.getXml=function()
	{
		return this.doc;
	}
	/**
	@private
	读取calNode节点的内容，解析为工作日历对象返回
	@params {XmlNode} calNode
	@returns {SFWorkingCalendar}
	*/
	SFDataXmlBase.prototype.readCalendar=function(calNode)
	{
		var wds=new Array(7),exceptions=[];
		var wdsNode=SFAjax.selectSingleNode(calNode,"WeekDays");
		for(var wdNode=wdsNode.firstChild;wdNode;wdNode=wdNode.nextSibling)
		{
			if(wdNode.nodeName!="WeekDay"){continue;}
			var dayType=parseInt(SFAjax.getNodeValue(SFAjax.selectSingleNode(wdNode,"DayType")));
			var dayWorking=parseInt(SFAjax.getNodeValue(SFAjax.selectSingleNode(wdNode,"DayWorking")));
			var workTime=this.getCalendarTime(SFAjax.selectSingleNode(wdNode,"WorkingTimes"));
			if(dayType)
			{
				wds[dayType-1]=workTime;
			}
			else
			{
				exceptions.push([SFGlobal.getDate(SFAjax.getNodeValue(SFAjax.selectSingleNode(wdNode,"TimePeriod/FromDate"))),SFGlobal.getDate(SFAjax.getNodeValue(SFAjax.selectSingleNode(wdNode,"TimePeriod/ToDate"))),workTime]);
			}
		}
		return new SFWorkingCalendar(SFWorkingCalendar.WT_WeekDay(wds,exceptions));
	}
	/**
	@private
	读取WorkingTimes节点内容，解析为工作时间的二维数组返回
	@params {XmlNode} wtsNode
	@returns {Number[][]}
	*/
	SFDataXmlBase.prototype.getCalendarTime=function(wtsNode)
	{
		var wts=[];
		if(!wtsNode){return wts;}
		for(var wtNode=wtsNode.firstChild;wtNode;wtNode=wtNode.nextSibling)
		{
			if(wtNode.nodeName!="WorkingTime"){continue;}
			wts.push([this.getMinutes(SFAjax.getNodeValue(SFAjax.selectSingleNode(wtNode,"FromTime"))),this.getMinutes(SFAjax.getNodeValue(SFAjax.selectSingleNode(wtNode,"ToTime")))]);
		}
		return wts;
	}
	/**
	@private
	读取XML节点之中格式为13:24:50的度分秒内容，转化为以分钟为单位的数字
	@params {String} string
	@returns {Number} 以分钟为单位的数字
	*/
	SFDataXmlBase.prototype.getMinutes=function(string)
	{
		var timeReg=new RegExp("^([0-9]+):([0-9]+):([0-9]+)$");
		var result=timeReg.exec(string);
		return parseInt(result[1],10)*60+parseInt(result[2],10)+parseInt(result[3],10)/60;
	}
	/**
	@private
	为适配器添加默认的属性支持
	*/
	SFDataXmlBase.prototype.addDefaultProperty=function()
	{
		var renderType=SFDataRender.types;
		/**
		 * 用来唯一的标识一个任务，每个任务必须有UID而且互不相同，不会改变
		 * @name SFDataTask#UID
		 * @type String
		 */
		this.addTaskProperty('UID',		0,			renderType.String);
		/**
		 * 用来代表该任务是不是有子任务，有子任务时该项必须为True
		 * @name SFDataTask#Summary
		 * @type Bool
		 */
		this.addTaskProperty('Summary',		0,			renderType.Bool2Int);

		/**
		 * 用来代表该任务是不是里程碑，目前在Start大于等于Finish的时候也会认为是里程碑
		 * @name SFDataResource#Summary
		 * @type Bool
		 */
		this.addTaskProperty('Milestone',	0,			renderType.Bool2Int);


		/**
		 * 这个字段代表任务的顺序号，实际上，因为甘特图的内容是分块加载的，考虑到性能问题，默认情况下甘特图变化的时候并不维护此字段的更新
		 * @name SFDataTask#ID
		 * @type Number
		 */
		this.addTaskProperty('ID',		0,			renderType.Int);
		/**
		 * 代表任务的大纲数字，实际上，因为甘特图的内容是分块加载的，考虑到性能问题，默认情况下甘特图变化的时候并不维护此字段的更新
		 * @name SFDataTask#OutlineNumber
		 * @type String
		 */
		this.addTaskProperty('OutlineNumber',	0,			renderType.String);
		/**
		 * 代表任务的大纲级别，实际上，因为甘特图的内容是分块加载的，考虑到性能问题，默认情况下甘特图变化的时候并不维护此字段的更新
		 * @name SFDataTask#OutlineLevel
		 * @type Number
		 */
		this.addTaskProperty('OutlineLevel',	0,			renderType.Int);
		/**
		 * 代表任务的起始时间，默认情况下甘特图会维护概要任务的起止时间和所有的子任务的起止时间一致，可以拖动甘特图上的任务条更改此属性
		 * @name SFDataTask#Start
		 * @type Date
		 */
		this.addTaskProperty('Start',		0,			renderType.Time);
		/**
		 * 代表任务的结束时间，默认情况下甘特图会维护概要任务的起止时间和所有的子任务的起止时间一致，可以拖动甘特图上的任务条更改此属性
		 * @name SFDataTask#Finish
		 * @type Date
		 */
		this.addTaskProperty('Finish',		0,			renderType.Time);
		/**
		 * 代表任务的名称，在任务甘特图列表框可以编辑更改此属性
		 * @name SFDataTask#Name
		 * @type String
		 */
		this.addTaskProperty('Name',		0,			renderType.String);
		/**
		 * 代表该任务是否只读，如果设置为true,在甘特图的操作之中将会不允许对该任务进行操作
		 * @name SFDataTask#ReadOnly
		 * @type Bool
		 */
		this.addTaskProperty('ReadOnly',	0,			renderType.Bool2Int);


		/**
		 * 0-100的数字，代表任务的完成进度，拖动甘特图上的任务条可以更改此属性
		 * @name SFDataTask#PercentComplete
		 * @type Number
		 */
		this.addTaskProperty('PercentComplete',	0,			renderType.Int);
		/**
		 * 任务的说明文字
		 * @name SFDataTask#Notes
		 * @type String
		 */
		this.addTaskProperty('Notes',		0,			renderType.String);
		/**
		 * 任务的限制类型，从0-7的整数，分别代表
			<ul>
				<li>0:	'越早越好'</li>
				<li>1:	'越晚越好'</li>
				<li>2:	'必须开始于'</li>
				<li>3:	'必须完成于'</li>
				<li>4:	'不得早于……开始'</li>
				<li>5:	'不得晚于……开始'</li>
				<li>6:	'不得早于……完成'</li>
				<li>7:	'不得晚于……完成'</li>
			</ul>
		 * @name SFDataTask#ConstraintType
		 * @type Number
		 */
		this.addTaskProperty('ConstraintType',	0,			renderType.Int);
		/**
		 * 任务的限制时间，此属性和ConstraintType属性一起使用，默认会显示在甘特图的图标列里面
		 * @name SFDataTask#ConstraintDate
		 * @type Date
		 */
		this.addTaskProperty('ConstraintDate',	0,			renderType.Time);
		/**
		 * 实际开始时间
		 * @name SFDataTask#ActualStart
		 * @type Date
		 */
		this.addTaskProperty('ActualStart',	0,			renderType.Time);
		/**
		 * 实际结束时间
		 * @name SFDataTask#ActualFinish
		 * @type Date
		 */
		this.addTaskProperty('ActualFinish',	0,			renderType.Time);
		/**
		 * 超级链接的文本，此属性默认会显示在甘特图的图标列里面
		 * @name SFDataTask#Hyperlink
		 * @type String
		 */
		this.addTaskProperty('Hyperlink',	0,			renderType.String);
		/**
		 * 超级链接的URL地址，此属性默认会显示在甘特图的图标列里面
		 * @name SFDataTask#HyperlinkAddress
		 * @type String
		 */
		this.addTaskProperty('HyperlinkAddress',0,			renderType.String);


		/**
		 * 任务的显示样式，将影响任务在图中的样式，当前系统之中默认支持如下样式：
		 * <ul>
		 * <li>TaskNormal	:默认样式</li>
		 * <li>TaskImportant	:显示为加重样式</li>
		 * <li>TaskImportant	:显示为加重样式</li>
		 * </ul>
		 * 每一种样式之中，都已经对任务的普通显示、大纲、里程碑做了专门的样式处理，因此没有必要根据任务的类型来选择样式
		 * @name SFDataTask#ClassName
		 * @type String
		 */
		this.addTaskProperty('ClassName',	0,			renderType.String);
		/**
		 * 该任务（概要任务）是否被折叠，点击概要任务名称之中的+-图标可以更改此属性
		 * @name SFDataTask#Collapse
		 * @type Bool
		 */
		this.addTaskProperty('Collapse',	0,			renderType.Bool2Int);
		/**
		 * 该任务显示行高的像素值，在任务列表中拖动任务之间的分隔条可以调整该值
		 * @name SFDataTask#LineHeight
		 * @type Number
		 */
		this.addTaskProperty('LineHeight',	0,			renderType.Int);
		/**
		 * 代表该任务是否是关键任务
		 * @name SFDataTask#Critical
		 * @type Bool
		 */
		this.addTaskProperty('Critical',	0,			renderType.Bool2Int);


		/**
		 * 跟踪甘特图的起始时间
		 * @name SFDataTask#BaselineStart
		 * @type Date
		 */
		this.addTaskProperty('BaselineStart',	'Baseline/Start',	renderType.Time);
		/**
		 * 跟踪甘特图的结束时间
		 * @name SFDataTask#BaselineFinish
		 * @type Date
		 */
		this.addTaskProperty('BaselineFinish',	'Baseline/Finish',	renderType.Time);


		/**
		 * 用来唯一的标识一个资源，每个资源必须有UID而且互不相同，不会改变
		 * @name SFDataResource#UID
		 * @type String
		 */
		this.addResourceProperty('UID',		0,			renderType.String);
		/**
		 * 用来代表该任务是不是有子资源，有子资源时该项必须为True
		 * @name SFDataResource#Summary
		 * @type Bool
		 */
		this.addResourceProperty('Summary',	0,			renderType.Bool2Int);
		/**
		 * 该资源是否被折叠，点击资源名称之中的+-图标可以更改此属性
		 * @name SFDataResource#Collapse
		 * @type Bool
		 */
		this.addResourceProperty('Collapse',	0,			renderType.Bool2Int);
		/**
		 * 该资源是否被折叠，点击资源名称之中的+-图标可以更改此属性
		 * @name SFDataResource#Name
		 * @type String
		 */
		this.addResourceProperty('Name',	0,			renderType.String);
		/**
		 * 代表资源的名称，在资源甘特图列表框可以编辑更改此属性
		 * @name SFDataResource#ID
		 * @type Number
		 */
		this.addResourceProperty('ID',		0,			renderType.Int);
		/**
		 * 这个字段代表资源的顺序号，实际上，因为甘特图的内容是分块加载的，考虑到性能问题，默认情况下甘特图变化的时候并不维护此字段的更新
		 * @name SFDataResource#OutlineNumber
		 * @type String
		 */
		this.addResourceProperty('OutlineNumber',0,			renderType.String);
		/**
		 * 代表资源的大纲数字，实际上，因为甘特图的内容是分块加载的，考虑到性能问题，默认情况下甘特图变化的时候并不维护此字段的更新
		 * @name SFDataResource#OutlineLevel
		 * @type Number
		 */
		this.addResourceProperty('OutlineLevel',0,			renderType.Int);
		/**
		 * 代表该资源是否只读，如果设置为true,在甘特图的操作之中将会不允许对该任务进行操作
		 * @name SFDataResource#ReadOnly
		 * @type Bool
		 */
		this.addResourceProperty('ReadOnly',	0,			renderType.Bool2Int);
		/**
		 * 资源的说明文字
		 * @name SFDataResource#Notes
		 * @type String
		 */
		this.addResourceProperty('Notes',	0,			renderType.String);


		/**
		 * 用来唯一的标识一个链接，每个链接必须有UID而且互不相同，不会改变
		 * @name SFDataLink#UID
		 * @type String
		 */
		this.addLinkProperty('UID',		0,			renderType.String);
		/**
		 * 该链接前置任务的UID
		 * @private
		 * @name SFDataLink#PredecessorUID
		 * @type String
		 */
		this.addLinkProperty('PredecessorUID',	0,			renderType.String);
		/**
		 * 该链接后置任务的UID
		 * @private
		 * @name SFDataLink#SuccessorUID
		 * @type String
		 */
		this.addLinkProperty('SuccessorUID',	0,			renderType.String);
		/**
		 * 链接的类型,有以下几种
			<ul>
				<li>0 : 完成-完成(FF);</li>
				<li>1 : 完成-开始(FS);</li>
				<li>2 : 开始-完成(SF);</li>
				<li>3 : 开始-开始(SS);</li>
			</ul>
		 * @name SFDataLink#Type
		 * @type Number
		 */
		this.addLinkProperty('Type',		0,			renderType.Int);


		/**
		 * 用来唯一的标识一个任务，每个任务必须有UID而且互不相同，不会改变
		 * @name SFDataAssignment#UID
		 * @type String
		 */
		this.addAssignmentProperty('UID',	0,			renderType.String);
		/**
		 * 分配任务的UID
		 * @private
		 * @name SFDataAssignment#TaskUID
		 * @type String
		 */
		this.addAssignmentProperty('TaskUID',	0,			renderType.String);
		/**
		 * 所分配资源的UID
		 * @private
		 * @name SFDataAssignment#ResourceUID
		 * @type String
		 */
		this.addAssignmentProperty('ResourceUID',0,			renderType.String);
		/**
		 * 0-1的小数，代表资源的分配比例
		 * @name SFDataAssignment#Units
		 * @type Number
		 */
		this.addAssignmentProperty('Units',	0,			renderType.Float);
	}
	/**
	为适配器添加指定的任务属性支持，添加之后甘特图会将指定的属性节点读入到数据之中，并支持修改该属性
	@param {String} proName 增加的属性名称，增加以后可以使用task.getProperty(proName)来读取这个属性，也可以使用task.setProperty(proName,value)来写入这个属性
	@param {String} tagName 属性在XML之中的节点名称
	@param {SFDataRender} type 属性的读写方式
	*/
	SFDataXmlBase.prototype.addTaskProperty=function(proName,tagName,type)
	{
		tagName=tagName?tagName:proName
		var obj={proName:proName,tagName:tagName,type:type};
		this.taskReader[tagName]=obj;
		this.taskWriter[proName]=obj;
		if(tagName.indexOf("/")>0)
		{
			var name=tagName.split("/")[0];
			if(!this.taskReader[name])
			{
				this.taskReader[name]=[];
			}
			this.taskReader[name].push(obj);
		}
	}
	/**
	为适配器添加指定的资源属性支持，添加之后甘特图会将指定的属性节点读入到数据之中，并支持修改该属性
	@param {String} proName 增加的属性名称，增加以后可以使用resource.getProperty(proName)来读取这个属性，也可以使用resource.setProperty(proName,value)来写入这个属性
	@param {String} tagName 属性在XML之中的节点名称
	@param {SFDataRender} type 属性的读写方式
	*/
	SFDataXmlBase.prototype.addResourceProperty=function(proName,tagName,type)
	{
		tagName=tagName?tagName:proName
		var obj={proName:proName,tagName:tagName,type:type};
		this.resourceReader[tagName]=obj;
		this.resourceWriter[proName]=obj;
	}
	/**
	为适配器添加指定的链接属性支持，添加之后甘特图会将指定的属性节点读入到数据之中，并支持修改该属性
	@param {String} proName 增加的属性名称，增加以后可以使用link.getProperty(proName)来读取这个属性，也可以使用link.setProperty(proName,value)来写入这个属性
	@param {String} tagName 属性在XML之中的节点名称
	@param {SFDataRender} type 属性的读写方式
	*/
	SFDataXmlBase.prototype.addLinkProperty=function(proName,tagName,type)
	{
		tagName=tagName?tagName:proName
		var obj={proName:proName,tagName:tagName,type:type};
		this.linkReader[tagName]=obj;
		this.linkWriter[proName]=obj;
	}
	/**
	为适配器添加指定的资源分配属性支持，添加之后甘特图会将指定的属性节点读入到数据之中，并支持修改该属性
	@param {String} proName 增加的属性名称，增加以后可以使用assignment.getProperty(proName)来读取这个属性，也可以使用assignment.setProperty(proName,value)来写入这个属性
	@param {String} tagName 属性在XML之中的节点名称
	@param {SFDataRender} type 属性的读写方式
	*/
	SFDataXmlBase.prototype.addAssignmentProperty=function(proName,tagName,type)
	{
		tagName=tagName?tagName:proName
		var obj={proName:proName,tagName:tagName,type:type};
		this.assignmentReader[tagName]=obj;
		this.assignmentWriter[proName]=obj;
	}
	/**
	@private
	为适配器添加扩展属性支持
	@param {XmlNode} node 扩展属性定义节点
	*/
	SFDataXmlBase.prototype.addExtendedAttributes=function(node)
	{
		if(!this.extendedAttributes){this.extendedAttributes={};}
		var FieldID,FieldName;
		for(var child=node.firstChild;child;child=child.nextSibling)
		{
			switch(child.nodeName)
			{
				case "FieldID":
				case "FieldName":
					FieldName=SFAjax.getNodeValue(child);
					break;
			}
		}
		this.extendedAttributes[FieldID]={FieldID:FieldID,FieldName:FieldName};
	}
	/**
	@private
	将一个节点作为一个任务读取并返回
	@param {XmlNode} node XML节点
	returns {SFDataTask}
	*/
	SFDataXmlBase.prototype.readTask=function(node)
	{
		if(!node){return null;}
		var task=new SFDataTask();
		task.node=node;
		var reader=this.taskReader;
		for(var child=node.firstChild;child;child=child.nextSibling)
		{
			switch(child.nodeName)
			{
				case "ExtendedAttribute":
					for(var c=child.firstChild;c;c=c.nextSibling)
					{
						var FieldID,Value;
						switch(c.nodeName)
						{
							case "FieldID":
								FieldID=SFAjax.getNodeValue(c);
								break;
							case "Value":
								Value=SFAjax.getNodeValue(c);
								break;
						}
					}
					task[FieldID]=Value;
					//task.setProperty(FieldID,Value);
					break;
				default:
					var property=reader[child.nodeName];
					if(property)
					{
						if(property.length)
						{
							for(var c=child.firstChild;c;c=c.nextSibling)
							{
								if(c.nodeName.indexOf("#")==0){continue;}
								var pro=reader[child.nodeName+"/"+c.nodeName];
								if(pro)
								{
								    task[pro.proName]=SFDataRender.read.apply(pro.type,[c]);
									//task.setProperty(pro.proName,SFDataRender.read.apply(pro.type,[c]));
								}
							}
						}
						else
						{
						    task[property.proName]=SFDataRender.read.apply(property.type,[child]);
							//task.setProperty(property.proName,SFDataRender.read.apply(property.type,[child]));
						}
					}
					break;
			}
		}
		this.taskCount++;
		if(task.OutlineNumber)
		{
			if(!task.OutlineLevel)
			{
				task.OutlineLevel=task.OutlineNumber=="0"?0:task.OutlineNumber.split(".").length;
			}
			task.OriginalLevel=task.OutlineLevel;
		}
		return task;
	}
	/**
	@private
	将一个节点作为一个资源读取并返回
	@param {XmlNode} node XML节点
	returns {SFDataResource}
	*/
	SFDataXmlBase.prototype.readResource=function(node)
	{
		if(!node){return null;}
		var resource=new SFDataResource();
		resource.node=node;
		var reader=this.resourceReader;
		for(var child=node.firstChild;child;child=child.nextSibling)
		{
			var property=reader[child.nodeName];
			if(property)
			{
				resource[property.proName]=SFDataRender.read.apply(property.type,[child]);
				//resource.setProperty(property.proName,SFDataRender.read.apply(property.type,[child]));
			}
		}
		if(resource.OutlineNumber)
		{
			if(!resource.OutlineLevel)
			{
				resource.OutlineLevel=resource.OutlineNumber=="0"?0:resource.OutlineNumber.split(".").length;
			}
			resource.OriginalLevel=resource.OutlineLevel;
		}
		return resource;
	}
	/**
	@private
	将一个节点作为一个链接读取并返回
	@param {XmlNode} node XML节点
	returns {SFDataLink}
	*/
	SFDataXmlBase.prototype.readLink=function(node)
	{
		if(!node){return null;}
		var link=new SFDataLink();
		link.node=node;
		var reader=this.linkReader;
		for(var child=node.firstChild;child;child=child.nextSibling)
		{
			var property=reader[child.nodeName];
			if(property)
			{
				link[property.proName]=SFDataRender.read.apply(property.type,[child]);
			}
		}
		return link;
	}
	/**
	@private
	将一个节点作为一个任务分配读取并返回
	@param {XmlNode} node XML节点
	returns {SFDataAssignment}
	*/
	SFDataXmlBase.prototype.readAssignment=function(node)
	{
		if(!node){return null;}
		var assignment=new SFDataAssignment();
		assignment.node=node;
		var reader=this.assignmentReader;
		for(var child=node.firstChild;child;child=child.nextSibling)
		{
			var property=reader[child.nodeName];
			if(property)
			{
				assignment[property.proName]=SFDataRender.read.apply(property.type,[child]);
			}
		}
		return assignment;
	}
	/**
	@private
	将一个节点作为指定任务的一个链接读取并返回
	@param {SFDataTask} task 任务
	@param {XmlNode} node XML节点
	returns {SFDataLink}
	*/
	SFDataXmlBase.prototype.readTaskLink=function(task,node)
	{
		if(!node){return null;}
		var link=this.readLink(node);
		link[node.nodeName=="PredecessorLink"?"SuccessorTask":"PredecessorTask"]=task;
		return link;
	}
	/**
	@private
	将一个节点作为指定任务的一个资源分配读取并返回
	@param {SFDataTask} task 任务
	@param {XmlNode} node XML节点
	returns {SFDataAssignment}
	*/
	SFDataXmlBase.prototype.readTaskAssignment=function(task,node)
	{
		if(!node){return null;}
		var assignment=this.readAssignment(node);
		assignment.task=task;
		return assignment;
	}
	/**
	@private
	将一个节点作为指定资源的一个分配读取并返回
	@param {SFDataResource} resource 资源
	@param {XmlNode} node XML节点
	returns {SFDataAssignment}
	*/
	SFDataXmlBase.prototype.readResourceAssignment=function(resource,node)
	{
		if(!node){return null;}
		var assignment=this.readAssignment(node);
		assignment.resource=resource;
		return assignment;
	}
	/**
	@private
	更新指定元素的属性和节点内容
	@param {Json} writer 读写方式集合
	@param {SFDataElement} item 元素
	@param {String} proName 属性名称
	@param {variant} value 属性的值
	*/
	SFDataXmlBase.prototype.updateItem=function(writer,item,proName,value)
	{
		var property=writer[proName];
		if(property)
		{
			var node=SFAjax.selectSingleNode(item.node,property.tagName);
			if(!node)
			{
				var names=property.tagName.split("/"),pNode=item.node;
				for(var i=0;i<names.length;i++)
				{
					if(!names[i]){continue;}
					node=SFAjax.selectSingleNode(pNode,names[i]);
					if(!node)
					{
						node=pNode.ownerDocument.createElement(names[i]);
						pNode.appendChild(node);
					}
					pNode=node;
				}
			}
			SFDataRender.write.apply(property.type,[node,value])
		}
		if(!writer[proName] && this.extendedAttributes && this.extendedAttributes[proName])//如果是扩展字段
		{
			for(var child=item.node.firstChild;child;child=child.nextSibling)
			{
				if(child.nodeName!="ExtendedAttribute"){continue;}
				var idNode=SFAjax.selectSingleNode(child,"FieldID");
				if(!idNode || SFAjax.getNodeValue(idNode)!=proName){continue;}
				var valueNode=SFAjax.selectSingleNode(child,"Value");
				if(!valueNode)
				{
					valueNode=child.ownerDocument.createElement("Value");
					child.appendChild(valueNode);
				}
				SFDataRender.write.apply(SFDataRender.types.String,[valueNode,value]);
				return;
			}
			var child=item.node.ownerDocument.createElement("ExtendedAttribute");
			var idNode=child.ownerDocument.createElement("FieldID");
			SFDataRender.write.apply(SFDataRender.types.String,[idNode,proName]);
			child.appendChild(idNode);
			var valueNode=child.ownerDocument.createElement("Value");
			SFDataRender.write.apply(SFDataRender.types.String,[valueNode,value]);
			child.appendChild(valueNode);
		}
	}
	/**
	@private
	更新指定任务的属性
	@param {SFDataTask} task
	@param {String} proName 属性名称
	@param {variant} value 属性的值
	*/
	SFDataXmlBase.prototype.updateTask=function(task,proName,value)
	{
		if(!this.saveChange){return;}
		this.updateItem(this.taskWriter,task,proName,value);
	}
	/**
	@private
	更新指定链接的属性
	@param {SFDataLink} link
	@param {String} proName 属性名称
	@param {variant} value 属性的值
	*/
	SFDataXmlBase.prototype.updateLink=function(link,proName,value)
	{
		if(!this.saveChange){return;}
		this.updateItem(this.linkWriter,link,proName,value);
	}
	/**
	@private
	更新指定资源的属性
	@param {SFDataResource} resource
	@param {String} proName 属性名称
	@param {variant} value 属性的值
	*/
	SFDataXmlBase.prototype.updateResource=function(resource,proName,value)
	{
		if(!this.saveChange){return;}
		this.updateItem(this.resourceWriter,resource,proName,value);
	}
	/**
	@private
	更新指定资源分配的属性
	@param {SFDataAssignment} assignment
	@param {String} proName 属性名称
	@param {variant} value 属性的值
	*/
	SFDataXmlBase.prototype.updateAssignment=function(assignment,proName,value)
	{
		if(!this.saveChange){return;}
		this.updateItem(this.assignmentWriter,assignment,proName,value);
	}
	window.SFDataXmlBase=SFDataXmlBase;