	/**
	甘特图之中的工作日历定义类
	@param {Function} func 函数对象，这个函数接收一个time参数(类型为JavaScript的Date对象)，返回在该时段后的第一段工作时间
	@private
	@class
	*/
	function SFWorkingCalendar(func)
	{
		this.getWorkTime=func;
	}
	/**
	根据名称获取指定的工作日历对象，当前支持以下几种日历类型
	<ul>
	<li>AnyDay : 不休息周末，每天工作8小时的日历</li>
	<li>Standard : 每周六、日休息，每天工作8小时的日历</li>
	<li>AnyTime : 没有休息时间，7*24小时工作的日历</li>
	</ul>
	@param {Name} name 日历类型名称，例如"Standard"
	@returns {SFWorkingCalendar} 返回工作日历对象
	@private
	@class
	*/
	SFWorkingCalendar.getCalendar=function(name)
	{
		switch(name)
		{
			case "AnyDay":
				return new SFWorkingCalendar(SFWorkingCalendar.WT_WeekDay(
					[
						[[480,720],[780,1020]],
						[[480,720],[780,1020]],
						[[480,720],[780,1020]],
						[[480,720],[780,1020]],
						[[480,720],[780,1020]],
						[[480,720],[780,1020]],
						[[480,720],[780,1020]]
					],
						[]
					));
			case "Standard":
				return new SFWorkingCalendar(SFWorkingCalendar.WT_WeekDay(
					[
						[],
						[[480,720],[780,1020]],
						[[480,720],[780,1020]],
						[[480,720],[780,1020]],
						[[480,720],[780,1020]],
						[[480,720],[780,1020]],
						[]
					],
					[
				//		[new Date(2004,0,2),new Date(2004,0,3),[]],
				//		[new Date(2004,0,3),new Date(2004,0,4),[[480,720],[780,1020]]]
					]
					))
			case "AnyTime":
			default:
				return new SFWorkingCalendar(function(){return [Number.MIN_VALUE,Number.MIN_VALUE];});
		}
	}
	/**
	根据参数返回按星期工作的日历函数
	@param {Json} wds 日历的配置参数
	@param {Json} exceptions 日历的配置参数工作日历之中的例外函数
	@returns {Function} 返回工作日历的getWorkTime函数
	@private
	@class
	*/
	SFWorkingCalendar.WT_WeekDay=function(wds,exceptions)
	{
		return function(time)
		{
			return SFWorkingCalendar.WT_WeekDayCal(time,wds,exceptions);
		}
	}
	/**
	在按星期工作的日历之中，根据时间和日历的配置，返回下一个工作时间段
	@param {Date} time 时间
	@param {Json} wds 日历的配置参数
	@param {Json} exceptions 日历的配置参数工作日历之中的例外函数
	@returns {Array[startTime,endTime]} 返回下一个工作时间段
	@private
	@class
	*/
	SFWorkingCalendar.WT_WeekDayCal=function(time,wds,exceptions)
	{
		var stv,ds=(time.valueOf()-time.getTimezoneOffset()*60*1000)%(24*60*60*1000);
		var t=time.valueOf()-ds;
		for(var i=0;i<exceptions.length;i++)
		{
			var exception=exceptions[i];
			if(exceptions[i][0].valueOf()<=t && exceptions[i][1].valueOf()>time.valueOf())//如果在例外的范围之内
			{
				if(exception[2].length==0)//如果这段例外不工作,则直接以例外的终点开始重新计算
				{
					return SFWorkingCalendar.WT_WeekDayCal(exceptions[i][1],wds,exceptions);
				}
				//遍历例外的工作时间,如果存在下一个工作时间,则直接返回
				for(var i=0;i<exception[2].length;i++)
				{
					var wd=exception[2][i];
					if(ds<wd[1]*60*1000)
					{
						return [new Date(t+wd[0]*60*1000),new Date(t+wd[1]*60*1000)];
					}
				}
				//如果没有下一个工作时间,则说明该天的工作时间都已经过去,则以第二天的开头重新开始计算
				return SFWorkingCalendar.WT_WeekDayCal(new Date(t+24*60*60*1000),wds,exceptions);
			}
		}
		var day=time.getDay();
		for(var i=0;i<wds[day].length;i++)
		{
			var wd=wds[day][i];
			if(ds<wd[1]*60*1000)
			{
				return [new Date(t+wd[0]*60*1000),new Date(t+wd[1]*60*1000)];
			}
		}
		return SFWorkingCalendar.WT_WeekDayCal(new Date(t+24*60*60*1000),wds,exceptions);
	}
	window.SFWorkingCalendar=SFWorkingCalendar;