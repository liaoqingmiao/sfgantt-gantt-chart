<%@ Page Language="C#" AutoEventWireup="true"  Inherits="SFProject.readDataByLevel,SFProject"%>


<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>使用数据动态加载功能 -向日葵甘特开发范例-我要调度网</title>
<meta name="keywords" content="SFGantt,getXml,甘特图,向日葵甘特,gantt,Ajax,project,Javascript,API"/>
<link href="/site/default.css" rel="stylesheet" type="text/css" />
<script language="javascript" src="http://www.51diaodu.cn/sfgantt/js/gantt.js.aspx" charset="utf-8"></script>
<script language="javascript">
	var gtProject,gtMap,gtData;
	function onLoad(doc)	//doc参数是一个XML文件DOM对象
	{
		var gtConfig=new SFConfig();	//初始化一个页面上的配置对象
		gtConfig.setConfig("SFGantt/container","Div_Gantt");	//设置用来显示甘特图的层的ID
		
		//初始加载xml深度depth为2，同一个节点每次下载结点数最大长度为5，这个例子暂不提供
		//动态加载数据适配器类为SFDataXml
		gtProject=new SFDataXml("readDataByLevel.aspx?action=getRootTask");
		
		
		//下面是添加一个自定义列的例子
		

		//第一步：先设置从xml中任务任务节点中扩展一个属性，在Adapter中读取这个扩展字段
		gtProject.addTaskProperty("TASK_LATE_START","TASK_LATE_START",SFDataRender.types.Time);
		//第二步：用addTaskField函数来定义一个甘特表格列
		//参数1  甘特列表字段名称
		//参数2 100表示这个列的默认显示宽度
		//参数3 '创建时间'表示这个列的名称，将可能被显示到表格头上
		//参数4 SFGanttListField.NormalHead指定列的列表头的显示方式，这个值为默认的表示方式
		//参数5 SFGanttListField.DateBody表示列表内容的显示方式，是针对时间对象，只显示日期的显示方式
		//参数6 SFGanttField.DateInput表示列表输入框的显示方式
		//参数7 "TASK_LATE_START"表示列表输入框发生更改的时候，应修改任务的哪个属性
		//参数8 "TASK_LATE_START"表示列表的内容受任务的哪些属性影响，当这些属性中的一个发生变更的时候，将会重绘该列
		SFGanttField.addTaskField("TASK_LATE_START",100,'最早开始',SFGanttField.NormalHead,SFGanttField.DateBody,SFGanttField.DateInput,"TASK_LATE_START","TASK_LATE_START");
		
		//第三步：设置在列表中显示哪些甘特表格列

		gtConfig.setConfig("SFGantt/taskFieldNames","Name,Start,Finish,Duration,TASK_LATE_START");	//设置在列表之中显示哪些列
		
		
		
		gtData=new SFData(gtProject);	//将xml初始化为一个甘特数据对象
		
		gtMap=new SFGantt(gtConfig,gtData);	//用相应的数据对象和配置对象创建甘特对象
		
		gtMap.showMap(null,4);		//显示甘特图
		

	}
</script>
</head>
<body onload="onLoad()">
<script language="javascript" src="/site/top.js" charset="utf-8"></script>
<div id="content">
	<h3>范例:分级加载数据</h3>
	<div id="Div_Gantt" style="position:relative;width:890px;height:400px;border:solid 1px black"></div>
	<div class="bg2">
		<h3>范例:分级加载数据</h3>
        <p>本范例从后台sql server中分级加载数据，初始时加载根节点，每次点击时才从数据库中动态下载所点节点的子节点数据</p>
        <p>向日葵甘特支持还支持每次下载多级子节点。如果每层子节点仍然很多，还可以实现同层节点分批下载。</p>
        <p>您可以试用http watch工具观察每次下载的任务数据。</p>		
        <a href="SFProject/projectdb1.rar">分级访问Access数据库源码</a>
		<p><a href="../">返回范例列表</a></p>
	</div>
</div>
<script language="javascript" src="/site/bottom.js" charset="utf-8"></script>
</body>

</html>