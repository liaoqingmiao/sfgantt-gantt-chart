	/**
	这是一个甘特图功能控件，本控件实现在甘特图上显示LOGO
	@private
	@extends SFGanttControl
	@class
	*/
	function SFGanttPrintControl()
	{
	}
	SFGanttPrintControl.prototype=new window.SFGanttControl();
	/**
	功能控件的初始化，每个插件的实现都会重写此方法
	@private
	@param {SFGantt} gantt
	@returns {Bool} 如果初始化成功，返回true,否则返回false
	*/
	SFGanttPrintControl.prototype.initialize=function(gantt)
	{
		this.gantt=gantt;
		gantt.createPrintWindow=SFEvent.getCallback(this,this.createPrintWindow);
		gantt.addPrintContent=SFEvent.getCallback(this,this.addPrintContent);
		gantt.printContentWindow=SFEvent.getCallback(this,this.printContentWindow);
		gantt.showPrintDialog=SFEvent.getCallback(this,this.showPrintDialog);
		return true;
	}
	/**
	显示打印甘特图的浮动窗口
	@name SFGantt.prototype.showPrintDialog
	@private
	@function
	*/
	SFGanttPrintControl.prototype.showPrintDialog=function()
	{
		var gantt=this.gantt,contentDiv=this.div;
		if(!contentDiv)
		{
			contentDiv=this.div=document.createElement("div");
			contentDiv.style.padding="5px";
			contentDiv.style.fontSize="12px";
/*
			var div=document.createElement("div");
			div.style.margin="5px";
			div.appendChild(document.createTextNode("纸张类型: "));
			contentDiv.appendChild(div);
			var a_pageType=[
				{name:'A0',width:841,height:1189},
				{name:'A1',width:594,height:841},
				{name:'A2',width:420,height:594},
				{name:'A3',width:297,height:420},
				{name:'A4',width:210,height:297},
				{name:'A5',width:148,height:210},
				{name:'A6',width:105,height:148},
				{name:'A7',width:74,height:105},
				{name:'A8',width:52,height:74},
				{name:'A9',width:37,height:52},
				{name:'A10',width:26,height:37},
				{name:'B0',width:1000,height:1414},
				{name:'B1',width:707,height:1000},
				{name:'B2',width:500,height:707},
				{name:'B3',width:353,height:500},
				{name:'B4',width:250,height:353},
				{name:'B5',width:176,height:250},
				{name:'B6',width:125,height:176},
				{name:'B7',width:88,height:125},
				{name:'B8',width:62,height:88},
				{name:'B9',width:44,height:62},
				{name:'B10',width:31,height:44},
				{name:'C0',width:917,height:1297},
				{name:'C1',width:648,height:917},
				{name:'C2',width:458,height:648},
				{name:'C3',width:324,height:458},
				{name:'C4',width:229,height:324},
				{name:'C5',width:162,height:229},
				{name:'C6',width:114,height:162},
				{name:'C7',width:81,height:114},
				{name:'C8',width:57,height:81},
				{name:'C9',width:110,height:220},
				{name:'C10',width:81,height:162}
			];
			var s_pageType=this.s_pageType=document.createElement("select");
			for(var i=0;i<a_pageType.length;i++)
			{
				var option=document.createElement("option");
				s_pageType.appendChild(option);
				option.text=a_pageType[i].name;
				option.value=a_pageType[i].width+","+a_pageType[i].height;
			}
			div.appendChild(s_pageType);

			var div=document.createElement("div");
			div.style.margin="5px";
			div.appendChild(document.createTextNode("纸张大小: "));
			div.appendChild(document.createTextNode("宽度"));
			var t_width=this.t_width=document.createElement("input");
			t_width.type="text";
			t_width.style.width="32px";
			div.appendChild(t_width);
			div.appendChild(document.createTextNode("mm"));
			div.appendChild(document.createTextNode(" "));
			div.appendChild(document.createTextNode("高度"));
			var t_height=this.t_height=document.createElement("input");
			t_height.type="text";
			t_height.style.width="32px";
			div.appendChild(t_height);
			div.appendChild(document.createTextNode("mm"));
			contentDiv.appendChild(div);
*/
			var div=document.createElement("div");
			div.style.margin="5px";
			div.appendChild(document.createTextNode("打印方向: "));
			var cb_hor=this.cb_hor=document.createElement("input");
			cb_hor.type="checkbox";
			div.appendChild(cb_hor);
			div.appendChild(document.createTextNode("横向打印"));
			contentDiv.appendChild(div);
			
			var div=document.createElement("div");
			div.style.margin="5px";
			div.appendChild(document.createTextNode("打印内容: "));
			var cb_showList=this.cb_showList=document.createElement("input");
			cb_showList.type="checkbox";
			div.appendChild(cb_showList);
			cb_showList.checked=true;
			div.appendChild(document.createTextNode("左侧列表"));
			var cb_showMap=this.cb_showMap=document.createElement("input");
			cb_showMap.type="checkbox";
			div.appendChild(cb_showMap);
			cb_showMap.checked=true;
			div.appendChild(document.createTextNode("右侧图表"));
			contentDiv.appendChild(div);

			var div=document.createElement("div");
			div.style.margin="5px";
			div.appendChild(document.createTextNode("打印范围: "));
			var cb_all=this.cb_all=document.createElement("input");
			cb_all.type="checkbox";
			div.appendChild(cb_all);
			div.appendChild(document.createTextNode("打印整个文档"));
			contentDiv.appendChild(div);

			var div=document.createElement("div");
			div.style.margin="5px";
			div.innerHTML=" 请打开浏览器 <strong>背景打印 </strong> 选项以优化效果 ";
			contentDiv.appendChild(div);
			
			var div=document.createElement("div");
			div.style.margin="5px";
			div.align="center";
			var bt_submit=document.createElement("input");
			bt_submit.type="button";
			bt_submit.value="打印";
			div.appendChild(bt_submit);
			var bt_cancel=document.createElement("input");
			bt_cancel.type="button";
			bt_cancel.value="取消";
			div.appendChild(bt_cancel);
			contentDiv.appendChild(div);

			this.listeners=[
//				SFEvent.bind(s_pageType,"change",this,this.onPageTypeChange),
				SFEvent.bind(bt_submit,"click",this,this.onSubmit),
				SFEvent.bind(bt_cancel,"click",gantt,gantt.closeDialog)
			];
		}
		gantt.openDialog(contentDiv,{isModal:true,size:[280,120],title:'打印'});
//		this.s_pageType.selectedIndex=4;
//		this.onPageTypeChange();
	}
	/**
	在纸张类型变化时更新大小字段
	@private
	*/
/*
	SFGanttPrintControl.prototype.onPageTypeChange=function()
	{
		var select=this.s_pageType;
		var size=select.options[select.selectedIndex].value.split(",");
		this.t_width.value=size[0];
		this.t_height.value=size[1];
	}
*/
	/**
	在打印开始时
	@private
	*/
	SFGanttPrintControl.prototype.onSubmit=function()
	{
//		var width=parseInt(this.t_width.value),height=parseInt(this.t_height.value);
		var width=210,height=297;
		var isHor=this.cb_hor.checked,isAll=this.cb_all.checked;
		var showList=this.cb_showList.checked,showMap=this.cb_showMap.checked;
		if(!showList && !showMap){return;}
		//计算像素值
		width-=20+20;
		height-=20+20;
		var dpi=window.chrome?96:96,inch=25.4;
		var gantt=this.gantt,win=gantt.createPrintWindow(),size=isHor?[height/inch*dpi,width/inch*dpi]:[width/inch*dpi,height/inch*dpi],padding=4;
		size=[Math.floor(size[0]),Math.floor(size[1])];
		var lastElement=gantt.getData().getRootElement(gantt.elementType).getLastDescendant(true);
		var maxHeight=gantt.getElementViewTop(lastElement)+gantt.getElementHeight(lastElement),currentHeight=isAll?0:gantt.getLayout("bodyScroll").scrollTop,nextHeight=0;
		var listWidth,mapWidth,currentTime,nextTime,maxTime=gantt.getData().getRootTask().Finish;
		for(var i=0;;i++)
		{
			if(currentHeight>=maxHeight || (!isAll && i>0)){break;}
			nextHeight=Math.min(currentHeight+size[1]-gantt.headHeight-padding,maxHeight);
			currentTime=isAll?gantt.getData().getRootTask().Start:gantt.getStartTime();
			for(var j=0;;j++)
			{
				if(j==0)
				{
					listWidth=(!showList)?0:((!showMap)?size[0]:gantt.listWidth);
					mapWidth=size[0]-listWidth-10-gantt.idCellWidth;
				}
				else
				{
					listWidth=0;
					mapWidth=size[0]-gantt.idCellWidth;
				}
				nextTime=new Date(currentTime.valueOf()+mapWidth*gantt.getScale());
				this._addPrintContent(win,[size[0],Math.min(size[1],nextHeight-currentHeight+gantt.headHeight+padding)],isHor,[listWidth,mapWidth,showList,showMap],currentTime,currentHeight);
				currentTime=nextTime;
				if(currentTime>=maxTime || !showMap || !isAll){break;}
			}
			currentHeight=nextHeight;
		}
	}
	/**
	创建一个用来打印甘特图的窗口，一个窗口之中可以打印多个甘特图
	@name SFGantt.prototype.createPrintWindow
	@private
	@function
	*/
	SFGanttPrintControl.prototype.createPrintWindow=function()
	{
		if(this._win){this.deposePrintWindow(this._win);delete this._win;}
		var iframe=document.createElement("iframe");
		SFGlobal.setProperty(iframe.style,{position:'absolute',width:'1px',height:'1px',left:'-2px',top:'-2px',visibility:'hidden'});
		this.gantt.getContainer().appendChild(iframe);
		var win = iframe.contentWindow;
		win.location="about:blank";
		var doc=win.document;
		var html = "<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.01 Transitional//EN\">\n";
		html += "<html>";
		html += "<head><meta http-equiv=\"Content-Type\" content=\"text/html; charset=gb2312\">\n<title>SFGantt</title></head>";
		html += "<body style=\"padding:0px;margin:0px;\" bgcolor=\"#FFFFFF\"></body></html>";
		doc.writeln(html);
		doc.close();
		win.gantts=[];
		if(!document.all){this._win=win;}
		while(doc.body.firstChild){doc.body.removeChild(doc.body.firstChild);}
		return win;
	}
	/**
	销毁打印内容窗口
	@name SFGantt.prototype.deposePrintWindow
	@private
	@function
	*/
	SFGanttPrintControl.prototype.deposePrintWindow=function(win)
	{
		var g;
		while(g=win.gantts.pop()){g.depose();}
		SFEvent.deposeNode(win.frameElement);
	}
	/**
	生成一个甘特图的打印内容
	@name SFGantt.prototype.addPrintContent
	@param {Window} win 打印内容生成的目标窗口
	@param {Number[]} size 打印范围的大小
	@param {Bool} isHor 是否是横向打印
	@param {Number[]} widths 栏目的宽度分布
	@param {Date} startTime 开始时间
	@param {Number} startHeight 打印视图的起始位置
	@private
	@function
	*/
	SFGanttPrintControl.prototype._addPrintContent=function()
	{
		if(!this.printList)
		{
			this.printList=[];
			this.printTimeout=setInterval(SFEvent.getCallback(this,function(){
				var argu=this.printList.shift();
				this.addPrintContent.apply(this,argu);
				this.gantt.openDialog('<div style="font-size:15px;margin:10px;">还剩余 '+this.printList.length+' 张</div>',{isModal:true,size:[200,32],title:'正在生成打印内容'});
				if(!this.printList[0])
				{
					clearInterval(this.printTimeout);
					delete this.printTimeout;
					delete this.printList;
					argu[0].frameElement.style.visibility="";
					this.printContentWindow(argu[0]);
					this.gantt.closeDialog();
				}
			}),32);
		}
		this.printList.push(arguments);
	}
	/**
	生成一个甘特图的打印内容
	@name SFGantt.prototype.addPrintContent
	@param {Window} win 打印内容生成的目标窗口
	@param {Number[]} size 打印范围的大小
	@param {Bool} isHor 是否是横向打印
	@param {Number[]} widths 栏目的宽度分布
	@param {Date} startTime 开始时间
	@param {Number} startHeight 打印视图的起始位置
	@private
	@function
	*/
	SFGanttPrintControl.prototype.addPrintContent=function(win,size,isHor,widths,startTime,startHeight)
	{
		var doc=win.document,body=doc.body,gantt=this.gantt,div=doc.createElement("div");
		if(body.firstChild){div.style.pageBreakBefore="always";}
		body.appendChild(div);
		var container=div;
		if(isHor)
		{
			body.style.textAlign="right";
			SFGlobal.setElementSize(div,[size[1],size[0]]);
			container=doc.createElement("div");
			SFGlobal.setElementSize(container,size);
			div.appendChild(container);
		}
		else
		{
			SFGlobal.setElementSize(div,size);
		}
		container.style.border="solid 1px #000000";
		var gtConfig=new SFConfig(),listWidth=widths[0],fieldWidth;
		SFConfig.addConfig(gtConfig,gantt.config,true);
		gtConfig.setConfig("SFGantt/container",container);	//设置用来显示甘特图的层的ID
		gtConfig.setConfig("SFGantt/readOnly",true);
		gtConfig.setConfig("SFGantt/footHeight",0);
		/**
		打印甘特图时左侧主体列表之中的各个列名称,用逗号分隔，如果没有指定，则使用普通列表，参照SFGanttField 类的getTaskField方法的参数
		@name SFConfig.configItems.taskPrintFieldNames
		@type String
		*/
		if(widths[2])
		{//如果需要打印左侧列表
			var elementType=gantt.elementType.toLowerCase(),printFieldNames=gtConfig.getConfig("SFGantt/"+elementType+"PrintFieldNames")
			if(printFieldNames)
			{
				gtConfig.setConfig("SFGantt/"+gantt.elementType.toLowerCase()+"FieldNames",printFieldNames);
			}
			//计算打印的列宽
			var pFieldList=gantt.getFieldsList?gantt.getFieldsList():null,
				pFieldWidth=gantt.getFieldsWidth?gantt.getFieldsWidth():null,
				fieldList=SFGanttField.getTaskFields(gtConfig.getConfig("SFGantt/"+gantt.elementType.toLowerCase()+"FieldNames").split(",")),
				fieldWidth=[],
				totalWidth=3;
			for(var i=0;i<fieldList.length;i++)
			{
				var wid=fieldList[i].width;
				if(pFieldList)
				{
					for(var j=pFieldList.length-1;j>=0;j--)
					{
						if(pFieldList[j]==fieldList[i])
						{
							wid=pFieldWidth[j];
							break;
						}
					}
				}
				fieldWidth.push(wid);
				totalWidth+=wid+1;
			}
			if(widths[3]){listWidth=Math.min(listWidth,totalWidth);}//如果同时也显示图表，则根据列宽自动缩小列表区宽度
		}
		gtConfig.setConfig("SFGantt/listWidth",listWidth);
		gtConfig.setConfig("SFGantt/disableTooltip",true);
		gtConfig.setConfig("SFGantt/disableChangeEvent",true);
		gtConfig.setConfig("SFGantt/disableHelpLink",true);
		gtConfig.setConfig("SFGantt/disableTimeScrollNotice",true);
		gtConfig.setConfig("SFGantt/disableDragResize",true);
		gtConfig.setConfig("SFGantt/disableCursor",true);
		gtConfig.setConfig("SFGantt/disableContextMenu",true);
		gtConfig.setConfig("SFGantt/disableScroll",true);
		gtConfig.setConfig("SFGantt/disableSelect",true);
		gtConfig.setConfig("SFGantt/scrollTop",startHeight);
		gtConfig.setConfig("SFGantt/forPrint",true);
		var g=new SFGantt(gtConfig,gantt.data);
		g.showMap(startTime,gantt.getZoom());
		if(fieldWidth && g.setFieldsWidth)
		{
			g.setFieldsWidth(fieldWidth);
		}
		win.gantts.push(g);
		if(isHor)
		{
			SFGlobal.setRotate(container,90);
			if(!container.style.filter){
			container.style.top=(size[0]-size[1])/2+"px";
			container.style.left=-(size[0]-size[1])/2+"px";}
		}
	}
	/**
	打印信息浮窗的内容
	@name SFGantt.prototype.printContentWindow
	@param {Window} win 打印内容生成的目标窗口
	@private
	@function
	*/
	SFGanttPrintControl.prototype.printContentWindow=function(win)
	{
		window.setTimeout(SFEvent.getCallback(this,function()
		{
			win.focus();
			if(win.document.execCommand && document.all)
			{
				win.document.execCommand( 'print', false, null ) ;
			}
			else
			{
				win.print();
			}
			if(document.all){this.deposePrintWindow(win);}
		}),0);
	}
	/**
	@private
	在功能控件被移除时执行的方法
	*/
	SFGanttPrintControl.prototype.remove=function()
	{
		delete this.a_pageType;
		delete this.t_width;
		delete this.t_height;
		var gantt=this.gantt;
		delete gantt.createPrintWindow;
		delete gantt.addPrintContent;
		SFGanttControl.prototype.remove.apply(this,arguments);
	}
	window.SFGanttPrintControl=SFGanttPrintControl;