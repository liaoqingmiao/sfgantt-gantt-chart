	/**
	这是一个甘特图功能控件，此控件代表对被选中的任务可执行的一系列操作，控件依赖选择控件SFGanttElementSelectControl
	@private
	@extends SFGanttControl
	@class
	*/
	function SFGanttSelectTaskOperateControl()
	{
	}
	SFGanttSelectTaskOperateControl.prototype=new window.SFGanttControl();
	/**
	@private
	功能控件的初始化，每个插件的实现都会重写此方法
	@param {SFGantt} gantt
	@returns {Bool} 如果初始化成功，返回true,否则返回false
	*/
	SFGanttSelectTaskOperateControl.prototype.initialize=function(gantt,container)
	{
		if(!gantt.getSelectedElements){return false;}
		this.gantt=gantt;
		SFGlobal.setProperty(gantt,{
			addTask:SFEvent.getCallback(this,this.addTask),
			deleteTask:SFEvent.getCallback(this,this.deleteTask),
			upgradeSelectedTasks:SFEvent.getCallback(this,this.upgradeSelectedTasks),
			degradeSelectedTasks:SFEvent.getCallback(this,this.degradeSelectedTasks),
			upgradeTask:SFEvent.getCallback(this,this.upgradeTask),
			degradeTask:SFEvent.getCallback(this,this.degradeTask),
			addTasksLinks:SFEvent.getCallback(this,this.addTasksLinks),
			removeTasksLinks:SFEvent.getCallback(this,this.removeTasksLinks),
			focusIntoView:SFEvent.getCallback(this,this.focusIntoView)
		});
		return true;
	}
	/**
	添加任务，假如当前选中了一个任务，则在该任务处添加任务，否则，在所有任务的最后添加任务
	@name SFGantt.prototype.addTask
	@function
	*/
	SFGanttSelectTaskOperateControl.prototype.addTask=function()
	{
		var gantt=this.gantt,data=gantt.data,selectedTasks=gantt.getSelectedElements();
		var parent,pTask=null,beforeTask=selectedTasks[0]?selectedTasks[selectedTasks.length-1]:null;
		if(beforeTask)
		{
			if(!beforeTask.getPreviousSibling())
			{
				parent=beforeTask.getParent();
			}
			else
			{
				pTask=beforeTask.getPreviousSibling().getLastDescendant(true);
				parent=pTask.getParent();
			}
		}
		else
		{
			if(!data.getRootTask().getFirstChild())
			{
				parent=data.getRootTask();
			}
			else
			{
				pTask=data.getRootTask().getLastChild().getLastDescendant(true);
				parent=pTask.getParent();
			}
		}
		var newTask=data.addTask(parent,pTask);
		if(newTask)
		{
		    gantt.setSelectedElement(newTask);
		}
	}
	/**
	检查当前选中的任务之中是否存在只读任务，如果存在，则弹出提示
	@private
	@returns {Bool} 如果不存在返回true，否则返回false
	*/
	SFGanttSelectTaskOperateControl.prototype.checkReadOnly=function()
	{
		var selectedTasks=this.gantt.getSelectedElements();
		var len=selectedTasks.length;
		for(var i=0;i<len;i++)
		{
			if(selectedTasks[i].ReadOnly)
			{
				var notice=this.gantt.config.getConfig("SFGantt/noticeReadonly");
				if(notice){alert(notice);}
				return false;
			}
		}
		return true;
	}
	/**
	对当前选中的一个或多个任务进行删除。
	@name SFGantt.prototype.deleteTask
	@function
	*/
	SFGanttSelectTaskOperateControl.prototype.deleteTask=function()
	{
		if(!this.checkReadOnly()){return false;}
		var selectedTasks=this.gantt.getSelectedElements();
		var len=selectedTasks.length;
		if(!selectedTasks[0]){return;}
		if(len==0){return;}
		var notice=this.gantt.config.getConfig("SFGantt/noticeDelete");
		if(notice && !window.confirm(notice)){return}
		for(var i=selectedTasks.length-1;i>=0;i--)
		{
			var task=selectedTasks[i];
			if(!task){continue;}
			this.gantt.data.deleteTask(task);
		}
	}
	/**
	对当前选中的任务进行解析，剔除被其他选中的任务包含的任务，返回剔除后的数组
	@private
	@returns {SFDataTasks[]}
	*/
	SFGanttSelectTaskOperateControl.prototype.getTopSelectedTasks=function()
	{
		var tasks=[],selectedTasks=this.gantt.getSelectedElements();
		for(var i=0;i<selectedTasks.length;i++)
		{
			var j;
			for(var j=tasks.length-1;j>=0;j--)
			{
				if(selectedTasks[i].contains(tasks[j]))
				{
					tasks[j]=selectedTasks[i];
					break;
				}
				else if(tasks[j].contains(selectedTasks[i]))
				{
					break;
				}
			}
			if(j<0)
			{
				tasks.push(selectedTasks[i]);
			}
		}
		return tasks;
	}
	/**
	对当前选中的一个或多个任务进行升级
	@name SFGantt.prototype.upgradeSelectedTasks
	@function
	*/
	SFGanttSelectTaskOperateControl.prototype.upgradeSelectedTasks=function()
	{
		if(!this.checkReadOnly()){return false;}
		var tasks=this.getTopSelectedTasks();
		for(var i=0;i<tasks.length;i++)
		{
			this.upgradeTask(tasks[i]);
		}
	}
	/**
	对当前选中的一个或多个任务进行降级
	@name SFGantt.prototype.degradeSelectedTasks
	@function
	*/
	SFGanttSelectTaskOperateControl.prototype.degradeSelectedTasks=function()
	{
		if(!this.checkReadOnly()){return false;}
		var tasks=this.getTopSelectedTasks();
		for(var i=0;i<tasks.length;i++)
		{
			this.degradeTask(tasks[i]);
		}
	}
	/**
	对指定任务进行升级，升级之后该任务的大纲级别减一
	@name SFGantt.prototype.upgradeTask
	@function
	@param {SFDataTask} task
	@returns {Bool} 如果成功返回true,否则返回false
	*/
	SFGanttSelectTaskOperateControl.prototype.upgradeTask=function(task)
	{
		var data=this.gantt.data,parent=task.getParent();
		if(!parent || parent==data.getRootTask()){return false;}
		var nTask=task.getNextSibling(),result=true;
		if(!data.moveTask(task,parent.getParent(),parent)){return false;}
		while (nTask)
		{
			var nnTask=nTask.getNextSibling()
			if(!data.moveTask(nTask,task,task.getLastChild())){return false;}
			nTask=nnTask
		}
		return true;
	}
	/**
	对该任务进行降级，升级之后该任务的大纲级别加一
	@name SFGantt.prototype.degradeTask
	@function
	@param {SFDataTask} task
	@returns {Bool} 如果成功返回true,否则返回false
	*/
	SFGanttSelectTaskOperateControl.prototype.degradeTask=function(task)
	{
		var pTask=task.getPreviousSibling();
		if(!pTask){return false;}
		return this.gantt.data.moveTask(task,pTask,pTask.getLastChild())
	}
	/**
	对当前选中任务按照选择的先后顺序建立链接关系，链接类型为”完成-开始“
	@name SFGantt.prototype.addTasksLinks
	@function
	@returns {Bool} 如果成功返回true,否则返回false
	*/
	SFGanttSelectTaskOperateControl.prototype.addTasksLinks=function()
	{
		var selectedTasks=this.gantt.getSelectedElements();
		if(selectedTasks.length<2){return false;}
		for(var i=1;i<selectedTasks.length;i++)
		{
			selectedTasks[i].addPredecessorLink(selectedTasks[i-1],1);
		}
		return true;
	}
	/**
	取消当前选中任务之间的所有链接关系
	@name SFGantt.prototype.removeTasksLinks
	@function
	@returns {Bool} 如果成功返回true,否则返回false
	*/
	SFGanttSelectTaskOperateControl.prototype.removeTasksLinks=function()
	{
		var gantt=this.gantt,data=gantt.data,selectedTasks=gantt.getSelectedElements();
		if(selectedTasks.length<2){return false;}
		for(var i=0;i<selectedTasks.length;i++)
		{
			for(var j=0;j<selectedTasks.length;j++)
			{
				if(i==j){continue;}
				var links=selectedTasks[i].getPredecessorLinks();
				for(var k=links.length-1;k>=0;k--)
				{
					if(links[k].PredecessorTask==selectedTasks[j])
					{
						data.deleteLink(links[k]);
						break;
					}
				}
			}
		}
		return true;
	}
	/**
	转到,将图表定位到当前点击的任务的位置,移动甘特图的时间轴，使当前选中的焦点任务刚好能显示出来
	@name SFGantt.prototype.focusIntoView
	@function
	*/
	SFGanttSelectTaskOperateControl.prototype.focusIntoView=function()
	{
		var gantt=this.gantt,task=gantt.getFocusElement();
		if(!task || !task.Start || !gantt.moveTo){return;}
		if(gantt.getViewIndex(task)<0){gantt.scrollToElement(task,50);}
		gantt.moveTo(task.Start);
		gantt.move(-10);
	}
	/**
	@private
	在功能控件被移除时执行的方法
	*/
	SFGanttSelectTaskOperateControl.prototype.remove=function()
	{
		var gantt=this.gantt;
		delete gantt.addTask
		delete gantt.deleteTask
		delete gantt.upgradeSelectedTasks
		delete gantt.degradeSelectedTasks
		delete gantt.upgradeTask
		delete gantt.degradeTask
		delete gantt.addTasksLinks
		delete gantt.removeTasksLinks
		delete gantt.focusIntoView
		SFGanttControl.prototype.remove.apply(this,arguments);
	}
	window.SFGanttSelectTaskOperateControl=SFGanttSelectTaskOperateControl;