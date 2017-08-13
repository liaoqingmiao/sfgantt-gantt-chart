	window._SFGantt_config={
		SFGlobal:{
			weekStrs:['SUN','MON','TUS','WEN','THU','FRI','SAT']
		},
		SFData:{
			autoCalculateTime:true,
			ignoreReadOnly:false,
			initComponents:'SFDataCalculateTimeComponent,SFDataReadOnlyComponent',
			//这里指定那些字段不受只读属性的影响
			taskReadonlyIgnoreProperty:'Collapse,LineHeight,Selected,Summary',
			resourceReadonlyIgnoreProperty:'Collapse,LineHeight,Selected',
			linkReadonlyIgnoreProperty:'LineHeight,Selected',
			assignmentReadonlyIgnoreProperty:'LineHeight,Selected'
		},
		SFDataProject:{
			saveChange:false
		},
		SFDataXml:{
			saveChange:true
		},
		SFGantt:{
			imgPath:'../../../BASE/gantt/img/',
			listWidth:200,
			imgType:'.gif',
			headHeight:36,
			footHeight:17,
			spaceWidth:8,
			idCellWidth:36,
			idCellBgColor:'#F4F4F4',
			listFocusColor:'#DDDDDD',
			itemHeight:24,
			fontSize:12,
			bodyBgColor:'#FFFFFF',
			headBgColor:'#F4F4F4',
			borderColor:'#CDCDCD',
			columnBarColor:'#F4F4F4',
			bottomBgColor:'#F4F4F4',
			viewEnlargeHeight:32,
			viewBufferHeight:512,
			taskFieldNames:'StatusIcon,Name,Start,Finish',
			taskIdFieldNames:'Empty',
			resourceFieldNames:'StatusIcon,Name',
			resourceIdFieldNames:'Empty',
			isTracking:false,
			menuText:{
				ZoomIn:			'Zoom in',
				ZoomOut:		'Zoom out',
				FocusIntoView:		'Focus',
				AddTask:		'Add task',
				DeleteTask:		'Delete task',
				AddTasksLinks:		'Add link',
				RemoveTasksLinks:	'Remove link',
				UpgradeTask:		'Upgrade task',
				DegradeTask:		'Degrade task',
				Print:			'Print',
				CopyTask:		'Copy Task',
				PasteTask:		'Paste Task',
				ShowChart:		'Show Chart',
				HideChart:		'Hide Chart',
				ShowList:		'Show list',
				HideList:		'Hide list',
				Help:			'Help',
				About:			'About SFGantt'
			},
			showScroller:true,
			disableMapDrag:true,
			noticeDelete:'Do you want to delete the selected tasks? Note: All the subtasks will be deleted! ',
			noticeReadonly:'one or more read-only tasks Selected , your operation can not be completed!',
			taskStyle:{
				TaskNormal:{
					barStyle:{border:"solid 1px #0000FF",bgImage:"grid_1",bgColor:"#0000FF"},
					summaryBarStyle:{backgroundColor:'#000000',border:'solid 1px #000000'},
					percentBarStyle:{backgroundColor:'#000000'},
					trackBarStyle:{border:"solid 1px #000000",bgImage:"grid_1",bgColor:"#000000"},
					milestoneImage:'task_head_3',
					summaryImage:'task_head_2',
					milestoneTrackImage:'task_head_3_hollow',
					listStyle:{backgroundColor:'#FFFFFF'},
					listSelectedStyle:{backgroundColor:'#DDDDDD'},
					networkStyle:{border:"solid 2px #0000FF",color:'#000000'},
					networkLineStyle:{borderBottom:'solid 1px #0000FF'}
				},
				TaskImportant:{
					barStyle:{border:"solid 1px #FF0000",bgImage:"grid_2",bgColor:"#FF0000"},
					summaryBarStyle:{backgroundColor:'#000000',border:'solid 1px #000000'},
					percentBarStyle:{backgroundColor:'#000000'},
					trackBarStyle:{border:"solid 1px #000000",bgImage:"grid_1",bgColor:"#000000"},
					milestoneImage:'task_head_3',
					summaryImage:'task_head_2',
					milestoneTrackImage:'task_head_3_hollow',
					listStyle:{backgroundColor:'#FF0000'},
					listSelectedStyle:{backgroundColor:'#FFFFFF'},
					networkStyle:{border:"solid 2px #FF0000",color:'#000000'},
					networkLineStyle:{borderBottom:'solid 1px #FF0000'}
				},
				TaskUnimportant:{
					barStyle:{border:"solid 1px #cccccc",bgImage:"grid_2",bgColor:"#cccccc"},
					summaryBarStyle:{backgroundColor:'#999999',border:'solid 1px #999999'},
					percentBarStyle:{backgroundColor:'#999999'},
					trackBarStyle:{border:"solid 1px #999999",bgImage:"grid_1",bgColor:"#999999"},
					milestoneImage:'task_head_3',
					summaryImage:'task_head_2',
					milestoneTrackImage:'task_head_3_hollow',
					listStyle:{backgroundColor:'#cccccc'},
					listSelectedStyle:{backgroundColor:'#FFFFFF'},
					networkStyle:{border:"solid 2px #cccccc",color:'#999999'},
					networkLineStyle:{borderBottom:'solid 1px #cccccc'}
				}
			},
			resourceStyle:{
				ResourceNormal:{
					barStyle:{border:"solid 1px #0000FF",bgImage:"grid_1",bgColor:"#0000FF"},
					summaryBarStyle:{backgroundColor:'#000000',border:'solid 1px #000000'},
					percentBarStyle:{backgroundColor:'#000000'},
					trackBarStyle:{border:"solid 1px #000000",bgImage:"grid_1",bgColor:"#000000"},
					milestoneImage:'task_head_3',
					summaryImage:'task_head_2',
					milestoneTrackImage:'task_head_3_hollow',
					listStyle:{backgroundColor:'#FFFFFF'},
					listSelectedStyle:{backgroundColor:'#DDDDDD'}
				},
				ResourceImportant:{
					barStyle:{border:"solid 1px #FF0000",bgImage:"grid_2",bgColor:"#FF0000"},
					summaryBarStyle:{backgroundColor:'#000000',border:'solid 1px #000000'},
					percentBarStyle:{backgroundColor:'#000000'},
					milestoneImage:'task_head_3',
					summaryImage:'task_head_2',
					listStyle:{backgroundColor:'red'},
					listSelectedStyle:{backgroundColor:'red'}
				}
			},
			linkStyle:{
				BlueNormal:{
					color:'#0000FF',
					lineStyle:{borderStyle:'solid'}
				},
				BlueDashed:{
					color:'#0000FF',
					lineStyle:{borderStyle:'dashed'}
				},
				RedNormal:{
					color:'#FF0000',
					lineStyle:{borderStyle:'solid'}
				},
				RedDashed:{
					color:'#FF0000',
					lineStyle:{borderStyle:'dashed'}
				},
				BlackNormal:{
					color:'#000000',
					lineStyle:{borderStyle:'solid'}
				},
				BlackDashed:{
					color:'#000000',
					lineStyle:{borderStyle:'dashed'}
				}
			}
		},
		SFGanttTasksMap:{
			tooltipTitle:{summary:'Summary',milestone:'Milestone',task:'Task',progress:'Progress',tracking:'Baseline',link:'Link'},
			taskStyle:'TaskNormal',
			taskBarField:'name',
			taskNoticeFields:'name,Start,Finish,Duration',
			taskProgressNoticeFields:'name,ActualStart,ActualFinish,ActualDuration,PercentComplete',
			taskTrackingNoticeFields:'name,BaselineStart,BaselineFinish',
			linkAddNoticeFields:'Type,FromTask,ToTask',
			taskHeight:12,
			trackBaselineTopScale:0.5,
			trackBaselineHeightScale:0.5,
			trackNormalTopScale:0,
			trackNormalHeightScale:0.5
		},
		SFGanttResourceMap:{
			tooltipTitle:{summary:'Summary',milestone:'Milestone',task:'Task',progress:'Progress',tracking:'Baseline',link:'Link'},
			taskStyle:'TaskNormal',
			taskBarField:'name',
			taskNoticeFields:'name,Start,Finish,Duration',
			taskProgressNoticeFields:'name,ActualStart,ActualFinish,ActualDuration,PercentComplete',
			taskTrackingNoticeFields:'name,BaselineStart,BaselineFinish',
			linkAddNoticeFields:'Type,FromTask,ToTask',
			taskHeight:12,
			resourceHeight:12,
			trackBaselineTopScale:0.5,
			trackBaselineHeightScale:0.5,
			trackNormalTopScale:0,
			trackNormalHeightScale:0.5
		},
		SFGanttElementList:{
			elementStyle:'TaskNormal',
			editEvent:'click'
		},
		SFGanttLinksMap:{
			tooltipTitle:{link:'Link'},
			linkNoticeFields:'Type,FromTask,ToTask',
			linkStyle:'BlueNormal'
		},
		SFGanttClipboardControl:{
			taskClipboardIgnoreProperty:"UID,Summary,ID,OutlineNumber,OutlineLevel,ReadOnly"
		},
		SFGanttNetworkControl:{
			linkStyle:'BlueNormal',
			linkFocusStyle:'RedNormal',
			taskStyle:'TaskNormal',
			taskFields:'name,Start,Finish,Resource',
			taskNoticeFields:'name,UID,Duration,Resource,Notes',
			width:300,
			height:100,
			nodeWidth:200,
			nodeHeight:78,
			dir:'x',
			type:'Finish',
			combineLine:false,
			maxTimes:64
		},
		SFGanttCalDiv:{
			calNum:2
		},
		SFMenu:{
			tableStyle:{border:'solid 1px #A4A4A4',backgroundColor:'#FFFFFF'}
		},
		SFTooltip:{
			divStyle:{fontSize:'12px',backgroundColor:'#FFFFE1',border:'solid 1px #000000'}
		},
		SFGanttTimeSegmentation:{
			calIndex:1,
			lineStyle:{borderLeft:'dotted 1px #808080'}
		},
		SFGanttTimeScrollNotice:{
			divStyle:{fontSize:'13px',backgroundColor:'#FFFFE1',padding:'3px',border:'inset 1px #000000'},
			dateFormat:'MM/dd/yyyy'
		},
		SFGanttTimeLine:{
			lineStyle:{width:'1px',borderStyle:'solid',borderColor:'red',borderLeftWidth:'1px',borderRightWidth:'1px',backgroundColor:'#FFFFFF'},
			tooltipFormat:'MM/dd/yyyy'
		},
		SFGanttListScrollNotice:{
			divStyle:{backgroundColor:'#FFFFE1',padding:'0px',border:'inset 1px #000000',fontSize:'12px'},
			taskFields:'UID,name',
			resourceFields:'UID,name'
		},
		SFGanttField:{
			fieldTexts:{
				UID:'UID',
				ID:'ID',
				TaskName:'Name',
				ResourceName:'Name',
				OutlineNumber:'OutlineNumber',
				StatusIcon:'StatusIcon',
				Duration:'Duration',
				Start:'Start',
				Finish:'Finish',
				Notes:'Notes',
				ClassName:'ClassName',
				Critical:'Critical',
				Selected:'Selected',
				Resource:'Resource',
				PercentComplete:'PercentComplete',
				ActualStart:'ActualStart',
				ActualFinish:'ActualFinish',
				ActualDuration:'ActualDuration',
				BaselineStart:'BaselineStart',
				BaselineFinish:'BaselineFinish',
				ConstraintType:'ConstraintType',
				ConstraintDate:'ConstraintType',
				LinkType:'Type',
				FromTask:'FromTask',
				ToTask:'ToTask'
			},
			linkTypes:['Finish-Finish(FF)','Finish-Start(FS)','Start-Finish(SF)','Start-Start(SS)'],
			constraintTypes:['As Soon As Possible(ASAP) ','As Late As Possible (ALAP) ','Must Start On (MSO) ','Must Finish On (MFO) ','Start No Earlier Than (SNET) ','Start No Later Than (SNLT) ','Finish No Earlier Than (FNET) ','Finish No Later Than (FNLT) '],
			boolTypes:['N','Y'],
			dateShowFormat:'MM/dd/yyyy',
			dateInputFormat:'MM/dd/yyyy HH:mm:ss',
			noticeWrongFormat:'Incorrect format',
			durationFormat:'%0 Working days',
			tooltipConstraint:"This task has Constraint: \"%0\",Date :%1.",
			tooltipPercentComplete:"This task completed in %0 ."
		},
		SFGanttCalendarItem:{
			formats:{
				Minute15:	'mm',
				Hour:		'd/M HH',
				Hour2:		'HH',
				Hour6:		'HH',
				Dat:		'd/M(ddd)',
				Dat1:		'd',
				Day:		'ddd',
				Day3:		'd',
				Day7:		'd',
				Week:		'd/M/YYYY',
				Month:		'M/yy',
				Month1:		'M',
				Quarter:	'yyyy \\Qq',
				Quarter1:	'\\Qq',
				Quarter2:	'\\Hhhh',
				Year:		'yyyy',
				Year1:		'yyyy',
				Year5:		'yyyy',
				Year10:		'yyyy'
			}
		}
	}
	function addToConfig(obj,json,cover)
	{
		if(!json){return;}
		for (var key in json)
		{
			switch (typeof(json[key]))
			{
				case "function":
					break;
				case "object":
					if(!obj[key])
					{
						obj[key]=json[key];
						continue;
					}
					addToConfig(obj[key],json[key],cover);
					break;
				default:
					if(cover!=false || !obj[key])
					{
						obj[key]=json[key];
					}
					break;
			
			}
		}
	}
	function getConfigByString(obj)
	{
		switch(typeof(obj))
		{
			case "string":
				return "'"+obj.replace(new RegExp("\\\\","gi"),"\\\\")+"'";
			case "object":
				var values=[],isArray=typeof(obj.length)=="number";
				for(var item in obj)
				{
					var str=getConfigByString(obj[item])
					values.push(isArray?str:item+":"+str);
				}
				return (isArray?"[":"{")+values.join(",")+(isArray?"]":"}");
		}
		return obj.toString();
	}