	/**
	这是一个甘特图功能控件，本控件用来给甘特图添加一系列系统集成的右键菜单设置
	@private
	@extends SFGanttControl
	@class
	*/
	function SFGanttDefaultMenuControl()
	{
	}
	SFGanttDefaultMenuControl.prototype=new window.SFGanttControl();
	/**
	@private
	功能控件的初始化，每个插件的实现都会重写此方法
	@param {SFGantt} gantt
	@returns {Bool} 如果初始化成功，返回true,否则返回false
	*/
	SFGanttDefaultMenuControl.prototype.initialize=function(gantt,container)
	{
		if(!gantt.addContextMenuItem){return;}
		var names=gantt.config.getConfig("SFGantt/menuText");
		/**
		@name SFGantt.ContextMenuItems
		@namespace 甘特图之中集成的右键菜单项列表，可以使用{@link SFGantt#getContextMenuItemById}来获取这些菜单项进行操作，也可以使用{@link SFGantt#removeContextMenuItem}删除对应的菜单项
		*/
		/**
		放大,顺序号551，在甘特图图表或网络图上右键单击时显示
		@name SFGantt.ContextMenuItems.ZoomIn
		@type SFMenuItem
		*/
		gantt.addContextMenuItem(
			function(ma){return ((ma.type=="chart"||ma.type=="network") && ma.gantt.zoomIn)?1:0},
			function(ma){ma.gantt.zoomIn(ma.type=="network"?SFEvent.getEventPosition(ma.event,ma.gantt.container):null);},
			names.ZoomIn,
			'icon_zoomin',
			"ZoomIn",
			551);
		/**
		缩小,顺序号556，在甘特图图表或网络图上右键单击时显示
		@name SFGantt.ContextMenuItems.ZoomOut
		@type SFMenuItem
		*/
		gantt.addContextMenuItem(
			function(ma){return ((ma.type=="chart"||ma.type=="network") && ma.gantt.zoomOut)?1:0},
			function(ma){ma.gantt.zoomOut(ma.type=="network"?SFEvent.getEventPosition(ma.event,ma.gantt.container):null);},
			names.ZoomOut,
			'icon_zoomout',
			"ZoomOut",
			556);
		/**
		转到,将图表定位到当前点击的任务的位置,顺序号601，在列表上右键单击时显示
		@name SFGantt.ContextMenuItems.FocusIntoView
		@type SFMenuItem
		*/
		gantt.addContextMenuItem(
			function(ma){return (ma.type=="list" && ma.gantt.focusIntoView && ma.gantt.getFocusElement && ma.gantt.getFocusElement() && ma.gantt.getFocusElement().Start)?1:0},
			function(ma){ma.gantt.focusIntoView();},
			names.FocusIntoView,
			"icon_taskgoto",
			"FocusIntoView",
			601);
		/**
		添加,在当前位置新建任务,顺序号651，在列表上右键单击时显示
		@name SFGantt.ContextMenuItems.AddTask
		@type SFMenuItem
		*/
		gantt.addContextMenuItem(
			/**
			是否禁止甘特图以任何方式执行添加任务操作
			@name SFConfig.configItems.SFGantt_disableAddTask
			@type Bool
			@default false
			*/
			function(ma){return (ma.type=="list" && ma.gantt.addTask && !ma.gantt.readOnly && !ma.gantt.disableAddTask)?1:0},
			function(ma){ma.gantt.addTask();},
			names.AddTask,
			null,
			"AddTask",
			651);
		/**
		删除,删除当前选中的任务,顺序号656，在列表上右键单击时显示
		@name SFGantt.ContextMenuItems.DeleteTask
		@type SFMenuItem
		*/
		gantt.addContextMenuItem(
			function(ma){return (ma.type=="list" && ma.gantt.deleteTask && !ma.gantt.readOnly && !ma.gantt.disableDeleteTask && ma.gantt.getFocusElement && ma.gantt.getFocusElement() && ma.gantt.getFocusElement().elementType=="Task")?1:0},
			function(ma){ma.gantt.deleteTask();},
			names.DeleteTask,
			null,
			'DeleteTask',
			656);
		/**
		添加链接,在当前选中的多个任务之间添加链接,顺序号701，在列表上右键单击时显示
		@name SFGantt.ContextMenuItems.AddTasksLinks
		@type SFMenuItem
		*/
		gantt.addContextMenuItem(
			function(ma){return (ma.type=="list" && ma.gantt.addTasksLinks && !ma.gantt.readOnly && !ma.gantt.disableAddLink && ma.gantt.getFocusElement && ma.gantt.getFocusElement() && ma.gantt.getFocusElement().elementType=="Task")?1:0},
			function(ma){ma.gantt.addTasksLinks();},
			names.AddTasksLinks,
			null,
			"AddTasksLinks",
			701);
		/**
		删除链接,删除当前选中的多个任务之间的链接,顺序号706，在列表上右键单击时显示
		@name SFGantt.ContextMenuItems.RemoveTasksLinks
		@type SFMenuItem
		*/
		gantt.addContextMenuItem(
			function(ma){return (ma.type=="list" && ma.gantt.removeTasksLinks && !ma.gantt.readOnly && !ma.gantt.disableDeleteLink && ma.gantt.getFocusElement && ma.gantt.getFocusElement() && ma.gantt.getFocusElement().elementType=="Task")?1:0},
			function(ma){ma.gantt.removeTasksLinks();},
			names.RemoveTasksLinks,
			null,
			'RemoveTasksLinks',
			706);
		/**
		升级,升级当前选中的多个任务,顺序号751，在列表上右键单击时显示
		@name SFGantt.ContextMenuItems.UpgradeTask
		@type SFMenuItem
		*/
		gantt.addContextMenuItem(
			function(ma){return (ma.type=="list" && ma.gantt.upgradeSelectedTasks && !ma.gantt.readOnly && !ma.gantt.disableUpdateTask && ma.gantt.getFocusElement && ma.gantt.getFocusElement() && ma.gantt.getFocusElement().elementType=="Task")?1:0},
			function(ma){ma.gantt.upgradeSelectedTasks();},
			names.UpgradeTask,
			null,
			'UpgradeTask',
			751);
		/**
		降级,降级当前选中的多个任务,顺序号756，在列表上右键单击时显示
		@name SFGantt.ContextMenuItems.DegradeTask
		@type SFMenuItem
		*/
		gantt.addContextMenuItem(
			function(ma){return (ma.type=="list" && ma.gantt.degradeSelectedTasks && !ma.gantt.readOnly && !ma.gantt.disableUpdateTask && ma.gantt.getFocusElement && ma.gantt.getFocusElement() && ma.gantt.getFocusElement().elementType=="Task")?1:0},
			function(ma){ma.gantt.degradeSelectedTasks();},
			names.DegradeTask,
			null,
			'DegradeTask',
			756);
		/**
		复制任务,顺序号771，在列表上右键单击单个任务时显示
		@name SFGantt.ContextMenuItems.CopyTask
		@type SFMenuItem
		*/
		gantt.addContextMenuItem(
			function(ma){return (ma.gantt.getFocusElement && ma.gantt.getFocusElement() && ma.gantt.copyTask)?1:0},
			function(ma){ma.gantt.copyTask();},
			names.CopyTask,
			null,
			"CopyTask",
			771);
		/**
		粘贴任务,顺序号772，在列表上右键单击单个任务时显示
		@name SFGantt.ContextMenuItems.PasteTask
		@type SFMenuItem
		*/
		gantt.addContextMenuItem(
			function(ma){return (ma.gantt.getFocusElement && ma.gantt.getFocusElement() && ma.gantt.canPasteTask && ma.gantt.canPasteTask())?1:0},
			function(ma){ma.gantt.pasteTask();},
			names.PasteTask,
			null,
			"PasteTask",
			771);
		/**
		打印,顺序号791，在任何区域右键单击时显示
		@name SFGantt.ContextMenuItems.Print
		@type SFMenuItem
		*/
		gantt.addContextMenuItem(
			function(ma){return (ma.gantt.showPrintDialog)?1:0},
			function(ma){ma.gantt.showPrintDialog();},
			names.Print,
			"icon_print",
			"Print",
			791);
		/**
		显示图表,打开右侧的图表显示,顺序号801，在分隔条上右键单击时显示(且当前图表未显示)
		@name SFGantt.ContextMenuItems.ShowChart
		@type SFMenuItem
		*/
		gantt.addContextMenuItem(
			function(ma){return (ma.type=="column" && ma.gantt.collapseChart && !ma.gantt.isChartShow())?1:0},
			function(ma){ma.gantt.collapseChart();},
			names.ShowChart,
			null,
			'ShowChart',
			801);
		/**
		隐藏图表,关闭右侧的图表显示,顺序号806，在分隔条上右键单击时显示(且当前图表已显示)
		@name SFGantt.ContextMenuItems.HideChart
		@type SFMenuItem
		*/
		gantt.addContextMenuItem(
			function(ma){return (ma.type=="column" && ma.gantt.collapseChart && ma.gantt.isChartShow())?1:0},
			function(ma){ma.gantt.collapseChart();},
			names.HideChart,
			null,
			'HideChart',
			806);
		/**
		显示列表,打开左侧的列表显示,顺序号850，在分隔条上右键单击时显示(且当前列表未显示)
		@name SFGantt.ContextMenuItems.ShowList
		@type SFMenuItem
		*/
		gantt.addContextMenuItem(
			function(ma){return (ma.type=="column" && ma.gantt.collapseList && !ma.gantt.isListShow())?1:0},
			function(ma){ma.gantt.collapseList();},
			names.ShowList,
			null,
			'ShowList',
			850);
		/**
		隐藏列表,打开左侧的列表显示,顺序号856，在分隔条上右键单击时显示(且当前列表已显示)
		@name SFGantt.ContextMenuItems.HideList
		@type SFMenuItem
		*/
		gantt.addContextMenuItem(
			function(ma){return (ma.type=="column" && ma.gantt.collapseList && ma.gantt.isListShow())?1:0},
			function(ma){ma.gantt.collapseList();},
			names.HideList,
			null,
			'HideList',
			856);
		/**
		使用帮助,打开使用帮助链接,顺序号901，在LOGO上右键单击时显示
		@name SFGantt.ContextMenuItems.Help
		@type SFMenuItem
		*/
		gantt.addContextMenuItem(
			function(ma){return 1},
			function(ma){window.open("http://www.51diaodu.cn/sfgantt/help/");},
			names.Help,
			null,
			'Help',
			901);
		/**
		关于,打开向日葵甘特图网页,顺序号951，在LOGO上右键单击时显示
		@name SFGantt.ContextMenuItems.About
		@type SFMenuItem
		*/
		gantt.addContextMenuItem(
			function(ma){return (ma.type=="logo")?1:0},
			function(ma){window.open("http://www.51diaodu.cn/sfgantt/");},
			names.About,
			null,
			'About',
			951);
		return true;
	}
	window.SFGanttDefaultMenuControl=SFGanttDefaultMenuControl;