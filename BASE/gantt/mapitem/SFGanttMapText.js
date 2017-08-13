	/**
	本绘制项实现任务横条右侧文字的显示
	@private
	@extends SFGanttMapItem
	@class
	*/
	function SFGanttMapText()
	{
	}
	SFGanttMapText.prototype=new window.SFGanttMapItem();
	/**
	@private
	图表绘制项目的初始化，每个绘制项目的实现都会重写此方法
	@param {SFGanttTasksMap} control
	@returns {Bool} 如果初始化成功，返回true,否则返回false
	*/
	SFGanttMapText.prototype.initialize=function(control)
	{
		//判断在什么地方需要显示文本
		var fields=this.fields={},needText=false,fNames=["Center","Top","Bottom"],fieldStr;
		//如果不是单行显示模式，则允许在左右两侧显示字段
		if(!control.gantt.inline)
		{
			fNames=fNames.concat("Left","Right");
			if((fieldStr=control.taskBarField))
			{
				fields["Right"]=SFGanttField.getTaskField(fieldStr);
				if(!needText){needText=true;}
			}
		}
		for(var i=0;i<fNames.length;i++)
		{
			if((fieldStr=control["taskBar"+fNames[i]+"Field"]))
			{
				fields[fNames[i]]=SFGanttField.getTaskField(fieldStr);
				if(!needText){needText=true;}
			}
		}
		if(!needText){return false;}//如果一个字段都没有配置，则直接退出
		SFGlobal.setProperty(this,{control:control,name:'Text'});
		return true;
	};
	SFGanttMapText.prototype.getStyle=function(task,scale,key)
	{
		if(!task.Start || !task.Finish){return}
		var start=task.Start.valueOf(),finish=task.Finish.valueOf(),gantt=this.control.gantt;
		var left=0,width=Math.max((finish-start)/scale,1),top=Math.ceil((gantt.itemHeight-gantt.fontSize)/2),align="left",overflow="hidden";
		switch(key)
		{
			case "Left":
				width=1000;
				left=-1010;
				align="right";
				break;
			case "Right":
				width=0;
				left=(finish-start)/scale+10
				overflow="visible";
				break;
			case "Top":
				top-=Math.max(gantt.fontSize,gantt.itemHeight/4)+2;
				align="center";
				break;
			case "Bottom":
				top+=Math.max(gantt.fontSize,gantt.itemHeight/4)+2;
				align="center";
				break;
			case "Center":
				align="center";
				break;
			default:return;
		}
		return {left:left+"px",top:top+"px",width:width?(width+"px"):"auto",textAlign:align,overflow:overflow}
	}
	/**
	@private
	开始绘制指定任务
	@param {SFDataTask} task 正在绘制的任务
	@param {Json} mapObj 绘制记录对象
	@param {Number} scale 甘特图的缩放比例
	*/
	SFGanttMapText.prototype.show=function(task,mapObj,scale)
	{
		var control=this.control,gantt=control.gantt,height=gantt.getElementDrawObj(task).height,fields=this.fields,div;
		scale=scale?scale:gantt.getScale();
		for(var key in fields)
		{
			var style=this.getStyle(task,scale,key);
			if(!style){continue;}
			div=mapObj.taskDiv.ownerDocument.createElement('div')
			div.noWrap=true;
			mapObj[this.name+key]=div;
			fields[key].showBody(div,task,control);
			div.style.cssText="position:absolute;white-space:nowrap;z-index:200;cursor:default;font-weight:bolder;font-size:"+gantt.fontSize+"px;";
			SFGlobal.setProperty(div.style,style);
			mapObj.taskDiv.appendChild(div);
		}
	}
	/**
	@private
	在任务属性变化时执行的响应
	@param {SFDataTask} task 正在绘制的任务
	@param {Json} mapObj 绘制记录对象
	@param {String[]} changedFields 变化的属性数组
	*/
	SFGanttMapText.prototype.onUpdate=function(task,mapObj,changedFields)
	{
		var control=this.control,gantt=control.gantt,scale=scale?scale:gantt.getScale();
		var fields=this.fields;
		for(var key in fields)
		{
			var style=this.getStyle(task,scale,key);
			if(!style){continue;}
			var div=mapObj[this.name+key];
			if(!div)
			{
				this.show(task,mapObj);
				return;
			}
			if(SFGlobal.findInArray(changedFields,"Start") || SFGlobal.findInArray(changedFields,"Finish"))
			{
				SFGlobal.setProperty(div.style,style);
			}
			if(fields[key].checkUpdate(changedFields))
			{
				fields[key].showBody(div,task,control);
			}
		}
	}
	/**
	@private
	在地图缩放比例变化时执行的响应
	@param {SFDataTask} task 正在绘制的任务
	@param {Json} mapObj 绘制记录对象
	@param {Number} scale 甘特图的缩放比例
	*/
	SFGanttMapText.prototype.onScale=function(task,mapObj,scale)
	{
		var fields=this.fields;
		for(var key in fields)
		{
			var style=this.getStyle(task,scale,key);
			if(!style){continue;}
			var div=mapObj[this.name+key];
			if(!div){continue;}
			SFGlobal.setProperty(div.style,style);
		}
	}
	/**
	@private
	清除对该任务的绘制
	@param {SFDataTask} task 需要清除绘制的任务
	@param {Json} mapObj 绘制记录对象
	*/
	SFGanttMapText.prototype.remove=function(task,mapObj)
	{
		var fields=this.fields;
		for(var key in fields)
		{
			SFEvent.deposeNode(mapObj[this.name+key]);
			delete mapObj[this.name+key];
		}
	}
	window.SFGanttMapText=SFGanttMapText;