/*
本对象主要负责维护整个甘特图显示的数据长度，
在实体被注册或显示的时候添加这个实体的高度
在实体被取消或隐藏的时候，减去这个实体的高度
在实体高度变化的时候，高度随之变化
目前此控件存在一个BUG，就是假如在甘特图初始化之前data已经读取了一些数据，则已经读取的数据的高度不会被计算进去
此控件独自管理甘特图的heightchange事件,通过此事件和其他的程序(SFGanttLayoutControl)交互,影响其滚动条的逻辑
*/
	//甘特图对象
	function SFGanttBodyHeightControl(config)
	{
	}
	SFGanttBodyHeightControl.prototype=new window.SFGanttControl();
	//创建甘特图初始化过程之中必需的层
	SFGanttBodyHeightControl.prototype.initialize=function(gantt,container)
	{
		this.listeners=[
			SFEvent.bind(this.gantt=gantt,"initialize",this,this.onGanttInit)
		];
		return true;
	}
	SFGanttBodyHeightControl.prototype.onGanttInit=function()
	{
		var gantt=this.gantt,data=gantt.getData(),el=gantt.elementType.toLowerCase();
		this.listeners=this.listeners.concat([
			SFEvent.bind(data,el+"register",this,this.onRegister),
			SFEvent.bind(data,el+"unregister",this,this.onUnRegister),
			SFEvent.bind(data,"after"+el+"change",this,this.onElementChange)
		]);
		this.setBodyHeight(0);
	}
	SFGanttBodyHeightControl.prototype.setBodyHeight=function(bodyHeight)
	{
		this.bodyHeight=bodyHeight;
		if(this.timeout){window.clearTimeout(this.timeout);}
		this.timeout=window.setTimeout(SFEvent.getCallback(this,this.triggerEvent),512);
	}
	SFGanttBodyHeightControl.prototype.triggerEvent=function()
	{
		SFEvent.trigger(this.gantt,"heightchange",[this.bodyHeight]);
		this.timeout=null;
	}
	SFGanttBodyHeightControl.prototype.onRegister=function(element)
	{
		this.setBodyHeight(this.bodyHeight+this.gantt.getElementHeight(element));
	}
	SFGanttBodyHeightControl.prototype.onUnRegister=function(element)
	{
		this.setBodyHeight(this.bodyHeight-this.gantt.getElementHeight(element));
	}
	SFGanttBodyHeightControl.prototype.onElementChange=function(element,name,value,bValue)
	{
		if(element.isHidden()){return;}
		switch(name)
		{
			case "Collapse":
				//在节点折叠状态变化的时候更新bodyHeight的值
				var gantt=this.gantt,flag=value?-1:1,bodyHeight=0;
				for(var ele=element.getFirstChild();ele;ele=ele.getNextView())
				{
					if(!element.contains(ele)){break;}
					bodyHeight+=flag*gantt.getElementHeight(ele);
				}
				this.setBodyHeight(this.bodyHeight+bodyHeight);
				break;
			case "LineHeight":
				this.setBodyHeight(this.bodyHeight+value-(bValue?bValue:this.gantt.itemHeight));
				break;
		}
	}
	window.SFGanttBodyHeightControl=SFGanttBodyHeightControl;