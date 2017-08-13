	/**
	这是一个甘特图功能控件，控件实现日历的层的显示，因为要确认显示的位置，因此，需要通过gantt.getLayout来确定显示的位置
	同时还依赖{@link SFGantt#getCalList}方法，因为需要确定显示哪些日历层次
	@private
	@extends SFGanttControl
	@class
	*/
	function SFGanttCalDiv()
	{
	}
	SFGanttCalDiv.prototype=new window.SFGanttControl();
	/**
	@private
	功能控件的初始化，每个插件的实现都会重写此方法
	@param {SFGantt} gantt
	@returns {Bool} 如果初始化成功，返回true,否则返回false
	*/
	SFGanttCalDiv.prototype.initialize=function(gantt)
	{
		if(!gantt.getLayout || !gantt.getCalList){return false;}
		var container=gantt.getLayout("mapHead"),doc=gantt.container.ownerDocument;
		if(!container){return false;}
		SFConfig.applyProperty(this,gantt.config.getConfigObj("SFGanttCalDiv"));
		var div=this.div=doc.createElement("div");
		SFEvent.setUnSelectable(div);
		SFGlobal.setProperty(this,{gantt:gantt,div:div,container:container,cals:{}});
		SFGlobal.setProperty(div.style,{position:'absolute',padding:'0px',margin:'0px'});
		for(var i=0;i<this.calNum;i++)
		{
			var calDiv=doc.createElement("div");
			SFGlobal.setProperty(calDiv.style,{position:'absolute',padding:'0px',margin:'0px',left:'0px'});
			div.appendChild(calDiv);
		}
		container.appendChild(div);
		this.listeners=[
			SFEvent.bind(gantt,"initialize",this,this.onResize),
			SFEvent.bind(gantt,"layoutchange",this,this.onResize),
			SFEvent.bind(gantt,"afterscalechange",this,this.showCal),
			SFEvent.bind(gantt,"move",this,this.showCal)
		];
		this.onResize();
		return true;
	}
	/**
	@private
	在甘特图初始化或大小发生变化时进行响应，重绘日历层
	*/
	SFGanttCalDiv.prototype.onResize=function()
	{
		var gantt=this.gantt,div=this.div,container=div.parentNode,size=this.size,s=[container.offsetWidth,container.offsetHeight];
		if(!size || size[1]!=s[1])
		{
			var calNum=this.calNum,height=s[1];
			for(var i=0;i<calNum;i++)
			{
				SFGlobal.setProperty(div.childNodes[i].style,{top:Math.floor(height*i/calNum)+'px',height:Math.floor(height/calNum)+'px'});
			}
		}
		this.size=s;
		this.showCal();
	}
	/**
	@private
	显示日历层
	*/
	SFGanttCalDiv.prototype.showCal=function()
	{
		var gantt=this.gantt,startTime=gantt.getStartTime(),scale=gantt.getScale(),calList=gantt.getCalList();
		if(!startTime || !scale || !calList){return;}
		startTime=startTime.valueOf();
		this.moveTo(scale,startTime);
		var cals=this.gantt.getCalList(),childNodes=this.div.childNodes;
		for(var i=0;i<this.calNum;i++)
		{
			this.showCalItem(scale,startTime,cals[i],childNodes[this.calNum-i-1],i);
		}
	}
	/**
	@private
	显示日历层之中的一行
	@param {Number} scale 地图当前的缩放倍数
	@param {Date} startTime 显示的开始时间
	@param {Json} cal 当前的日历对象
	@param {HtmlElement} calDiv 用来显示这一行日历的层
	@param {Number} index 当前的层数索引
	*/
	SFGanttCalDiv.prototype.showCalItem=function(scale,startTime,cal,calDiv,index)
	{
		var drawObj=this.cals[index];
		if(!drawObj || drawObj.cal!=cal)
		{
			this.clearItem(index);
			this.cals[index]=drawObj={start:startTime,cal:cal,scale:scale};
			calDiv.style.left=(startTime-this.drawStart)/scale+"px";
		}
		else if(drawObj.scale!=scale)//如果缩放等级已经变化,则设置所有大小
		{
			for(var child=calDiv.firstChild;child;child=child.nextSibling)
			{
				SFGlobal.setProperty(child.style,{
					left:(child.sTime-drawObj.start)/scale+"px",
					width:(child.eTime-child.sTime)/scale+"px"
				});
			}
			calDiv.style.left=(drawObj.start-this.drawStart)/scale+"px";
			drawObj.scale=scale
		}
		var endTime=startTime+this.container.offsetWidth*scale;//需要显示的结束时间
		var osTime=calDiv.firstChild?calDiv.firstChild.sTime:Number.MAX_VALUE;
		var oeTime=calDiv.lastChild?calDiv.lastChild.eTime:Number.MIN_VALUE;
		if(startTime>(calDiv.firstChild?calDiv.firstChild.eTime:Number.MAX_VALUE))//说明左边可能有多余的内容，删除
		{
			while(calDiv.firstChild && calDiv.firstChild.eTime<startTime)
			{
				SFEvent.deposeNode(calDiv.firstChild);
			}
			osTime=calDiv.firstChild?calDiv.firstChild.sTime:Number.MAX_VALUE
		}
		if((calDiv.lastChild?calDiv.lastChild.sTime:Number.MIN_VALUE)>endTime)//说明右边可能有多余的内容，删除
		{
			while(calDiv.lastChild && calDiv.lastChild.sTime>endTime)
			{
				SFEvent.deposeNode(calDiv.lastChild);
			}
			oeTime=calDiv.lastChild?calDiv.lastChild.eTime:Number.MIN_VALUE
		}
		if(startTime<osTime)//说明左侧需要添加内容
		{
			this.addTimeSpans(startTime,Math.min(osTime,endTime),drawObj,calDiv,-1);
			osTime=calDiv.firstChild?calDiv.firstChild.sTime:Number.MAX_VALUE;
			oeTime=calDiv.lastChild?calDiv.lastChild.eTime:Number.MIN_VALUE;
		}
		if(oeTime<endTime)//说明左侧需要添加内容
		{
			this.addTimeSpans(Math.max(oeTime,startTime),endTime,drawObj,calDiv,1);
		}
	}
	/**
	@private
	添加指定范围内的日历层
	@param {Date} startTime 显示的开始时间
	@param {Date} endTime 显示的结束时间
	@param {Json} drawObj 当前的绘制对象
	@param {HtmlElement} calDiv 用来显示这一行日历的层
	@param {Number[]} position 显示的位置
	*/
	SFGanttCalDiv.prototype.addTimeSpans=function(startTime,endTime,drawObj,calDiv,position)
	{
		var cal=drawObj.cal;
		var sTime=parseInt(cal.getFloorTime(new Date(startTime)).valueOf());//需要显示的单位起始时间
		var lastAdd=null;
		while(sTime<endTime)
		{
			var eTime=parseInt(cal.getNextTime(new Date(sTime)).valueOf());
			var div=calDiv.ownerDocument.createElement("div");
			SFGlobal.setProperty(div,{sTime:sTime,eTime:eTime});
			var height=Math.floor(this.size[1]/this.calNum)-1;
			SFGlobal.setProperty(div.style,{position:'absolute',left:(sTime-drawObj.start)/drawObj.scale+'px',top:'0px',width:(eTime-sTime)/drawObj.scale+'px',height:height,fontSize:Math.floor(height*0.8)+'px',padding:'0px',lineHeight:height+'px',borderRight:'solid 1px '+this.gantt.borderColor,borderBottom:'solid 1px '+this.gantt.borderColor,textAlign:'center'});
			div.innerHTML=cal.showHead(new Date(sTime));
			if(position==-1)
			{
				if(lastAdd==null)
				{
					calDiv.insertBefore(div,calDiv.firstChild);
				}
				else if(lastAdd.nextSibling==null)
				{
					calDiv.appendChild(div);
				}
				else
				{
					calDiv.insertBefore(div,lastAdd.nextSibling);
				}
			}
			else
			{
				calDiv.appendChild(div);
			}
			lastAdd=div;
			sTime=eTime;
		}
	}
	/**
	@private
	清空所有的日历显示
	*/
	SFGanttCalDiv.prototype.clear=function()
	{
		for(var i=0;i<this.calNum;i++)
		{
			this.clearItem(i);
		}
	}
	/**
	@private
	清除日历显示之中的一个层级
	@param {Number} i 层级编号
	*/
	SFGanttCalDiv.prototype.clearItem=function(i)
	{
		SFEvent.deposeNode(this.div.childNodes[this.calNum-i-1],true);
		delete this.cals[i];
	}
	/**
	@private
	缩放和移动日历到指定的位置
	@param {Number} scale 当前甘特图的缩放比例
	@param {Date} startTime 左侧的起始时间
	*/
	SFGanttCalDiv.prototype.moveTo=function(scale,startTime)
	{
		if(!this.drawStart){this.drawStart=startTime;}
		var point=parseInt((this.drawStart-startTime)/scale);
		if(Math.abs(point)>10000)
		{
			this.drawStart=startTime;
			var calNum=this.calNum;
			for(var i=0;i<calNum;i++)
			{
				if(!this.cals[i]){continue;}
				var p=parseInt((this.cals[i].start-this.drawStart)/scale);
				if(Math.abs(p)>10000)
				{
					this.cals[i].start=this.drawStart;
					for(var child=this.div.childNodes[i].firstChild;child;child=child.nextSibling)
					{
						child.style.left=parseInt(child.style.left+point)+"px";
					}
					p=0;
				}
				this.div.childNodes[i].style.left=p+"px";
			}
			point=0;
		}
		this.div.style.left=point+'px';
	}
	window.SFGanttCalDiv=SFGanttCalDiv;