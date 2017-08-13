	/**
	这是一个甘特图功能控件，本控件实现在甘特图纵向滚动(列表滚动)时显示实时的提示信息
	@private
	@extends SFGanttControl
	@class
	*/
	function SFGanttListScrollNotice()
	{
	}
	SFGanttListScrollNotice.prototype=new window.SFGanttControl();
	/**
	功能控件的初始化，每个插件的实现都会重写此方法
	@private
	@param {SFGantt} gantt
	@returns {Bool} 如果初始化成功，返回true,否则返回false
	*/
	SFGanttListScrollNotice.prototype.initialize=function(gantt,container)
	{
		if(gantt.disableListScrollNotice || !gantt.getLayout){return false;}
		SFConfig.applyProperty(this,gantt.config.getConfigObj("SFGanttListScrollNotice"));
		var elementType=gantt.elementType;
		this.fields=this[elementType.toLowerCase()+"Fields"]?SFGanttField.getFields(elementType,this[elementType.toLowerCase()+"Fields"].split(",")):null;
		this.gantt=gantt;
		//分割条的任务显示层
		var div=this.div=container.ownerDocument.createElement('div');
		SFGlobal.setProperty(div.style,{position:'absolute',zIndex:400,display:'none'});
		SFGlobal.setProperty(div.style,this.divStyle);
		container.appendChild(div);
		this.listeners=[
			SFEvent.bind(gantt,"scroll",this,this.onScroll),
			SFEvent.bind(gantt,"afterresize",this,this.onResize)
		];
		this.onResize();
		return true;
	}
	/**
	在甘特图滚动条变化的时候执行的响应
	@private
	@param {Number} scrollTop 甘特图的滚动高度，即甘特图当前显示的内容顶部离整个数据顶部的高度差
	@param {Json} scrollObj 当前滚动的位置信息
	@param {SFDataElement[]} scrollObj.spanElements 当前视图的元素范围
	*/
	SFGanttListScrollNotice.prototype.onScroll=function(scrollTop,scrollObj)
	{
		if(!scrollObj || !scrollObj.spanElements[1]){return;}
		if(!this.timeout){this.timeout=window.setInterval(SFEvent.getCallback(this,this.onTime),64);}
		this.scrollObj=scrollObj;
		this.changed=true;
		this.idleTimes=0;
	}
	/**
	在甘特图滚动条变化后的延时操作
	@private
	*/
	SFGanttListScrollNotice.prototype.onTime=function()
	{
		if(!this.changed)
		{
			this.idleTimes++;
			if(this.idleTimes>16)
			{
				this.div.style.display='none';
				window.clearInterval(this.timeout);
				delete this.timeout
			}
			return;
		}
		this.changed=false;
		
		var task=this.scrollObj.spanElements[1],fieldLength=this.fields.length,doc=this.div.ownerDocument;
		if(!this.div.firstChild)
		{
			var table=doc.createElement("table");
			this.div.appendChild(table);
			table.width=160;
			table.style.fontSize="12px";
			for(var i=0;i<fieldLength;i++)
			{
				var row=table.insertRow(-1);
				var cell=row.insertCell(-1);
				cell.width=60;
				this.fields[i].showHead(cell,this);
				var cell=row.insertCell(-1);
				if(i==0){cell.width=100;}
				var div=doc.createElement("div");
				SFGlobal.setProperty(div.style,{position:"relative",overflow:"hidden",width:"100px",height:"14px"});
				cell.appendChild(div);
			}
		}
		for(var i=0;i<fieldLength;i++)
		{
			var div=this.div.firstChild.rows[i].cells[1].firstChild;
			SFEvent.deposeNode(div,true);
			this.fields[i].showBody(div,task,this);
		}
		this.div.style.display='';
	}
	/**
	在甘特图大小变化的时候执行，更新提示的显示位置
	@private
	*/
	SFGanttListScrollNotice.prototype.onResize=function()
	{
		SFGlobal.setProperty(this.div.style,{right:'30px',top:(this.gantt.headHeight+10)+'px'});
	}
	window.SFGanttListScrollNotice=SFGanttListScrollNotice;