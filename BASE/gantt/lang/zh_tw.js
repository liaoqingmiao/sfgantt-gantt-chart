	addToConfig(window._SFGantt_config,{
		SFGantt:{
			menuText:{
				ZoomIn:			'圖表放大',
				ZoomOut:		'圖表縮小',
				FocusIntoView:		'轉到任務',
				AddTask:		'新建任務',
				DeleteTask:		'刪除任務',
				AddTasksLinks:		'連結任務',
				RemoveTasksLinks:	'取消連結',
				UpgradeTask:		'升級',
				DegradeTask:		'降級',
				Print:			'列印',
				CopyTask:		'複製任務',
				PasteTask:		'粘貼任務',
				ShowChart:		'顯示圖表',
				HideChart:		'隱藏圖表',
				ShowList:		'顯示列表',
				HideList:		'隱藏列表',
				Help:			'使用幫助',
				About:			'關於向日葵甘特'
			},
			noticeDelete:'確認要刪除任務嗎？注意：概要任務的子任務也會被刪除！',
			noticeReadonly:'選中了一個或多個唯讀的任務，操作不能完成！'
		},
		SFGanttTasksMap:{
			tooltipTitle:{summary:'摘要',milestone:'里程碑',task:'任務',progress:'進度',tracking:'比較基準',link:'連結'}
		},
		SFGanttLinksMap:{
			tooltipTitle:{link:'任務連結'}
		},
		SFGanttTimeScrollNotice:{
			dateFormat:'yyyy年MM月dd日'
		},
		SFGanttTimeLine:{
			tooltipFormat:'yyyy年MM月dd日'
		},
		SFGanttField:{
			fieldTexts:{
				UID:'標識號',
				ID:'索引',
				TaskName:'任務名稱',
				ResourceName:'資源名稱',
				OutlineNumber:'大綱',
				StatusIcon:'狀態',
				Duration:'工期',
				Start:'開始時間',
				Finish:'完成時間',
				Notes:'備註',
				ClassName:'樣式',
				Critical:'關鍵',
				Selected:'選中',
				Resource:'資源名稱',
				PercentComplete:'完成百分比',
				ActualStart:'實際開始時間',
				ActualFinish:'完成至此時間',
				ActualDuration:'實際工期',
				BaselineStart:'比較基準開始時間',
				BaselineFinish:'比較基準結束時間',
				ConstraintType:'約束類型',
				ConstraintDate:'約束時間',
				LinkType:'連結類型',
				FromTask:'從',
				ToTask:'到',
				PredecessorTask:'前置任務',
				SuccessorTask:'後置任務'
			},
			linkTypes:['完成-完成(FF)','完成-開始(FS)','開始-完成(SF)','開始-開始(SS)'],
			constraintTypes:['越早越好','越晚越好','必須開始於','必須完成於','不得早於...開始','不得晚於...開始','不得早於...完成','不得晚於...完成'],
			boolTypes:['否','是'],
			dateShowFormat:'yyyy年MM月dd日',
			dateInputFormat:'yyyy-MM-dd HH:mm:ss',
			noticeWrongFormat:'格式不正確',
			noticeEmptyTaskField:'任務域%0不存在!',
			noticeEmptyLinkField:'連結域%0不存在!',
			durationFormat:'%0個工作日',
			tooltipConstraint:"此任務有限制條件: \"%0\"，日期:%1",
			tooltipPercentComplete:"此任務在 %0 完成"
		},
		SFGlobal:{
			weekStrs:['日','一','二','三','四','五','六']
		},
		SFGanttCalendarItem:{
			formats:{
				Minute15:	'mm',
				Hour:		'M-d HH',
				Hour2:		'HH',
				Hour6:		'HH',
				Dat:		'M月d日（ddd）',
				Dat1:		'd',
				Day:		'ddd',
				Day3:		'd',
				Day7:		'd',
				Week:		'yyyy年M月d日',
				Month:		'yy年M月',
				Month1:		'M',
				Quarter:	'yyyy年第q季度',
				Quarter1:	'\\Qq',
				Quarter2:	'\\Hhhh',
				Year:		'yyyy年',
				Year1:		'yyyy',
				Year5:		'yyyy',
				Year10:		'yyyy'
			}
		}
	})
