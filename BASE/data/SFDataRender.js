	/**
	用来代表XML节点的读写方式的对象，每个读写方式定义了如何从XML之中读取和写入指定的属性值，通常不需要直接操作此对象，因为在{@link SFDataRender.types}之中已经定义了一些常用的读写方式
	@param {Function} readFunc 从XML之中读取的节点内容成为元素属性的函数
	@param {Function} writeFunc 将元素属性写入到XML节点内容的函数
	@class
	*/
	function SFDataRender(readFunc,writeFunc)
	{
		this.read=readFunc;
		this.write=writeFunc;
	}
	/**
	用来调用读取的函数
	@private
	@param {XmlNode} node Xml节点
	returns {variant} 从节点之中读取出来的属性值，任意类型
	*/
	SFDataRender.read=function(node)
	{
		return this.read.apply(this,[node]);
	}
	/**
	用来调用写入的函数
	@private
	@param {XmlNode} node Xml节点
	@param {variant} value 从来写入的属性值
	*/
	SFDataRender.write=function(node,value)
	{
		return this.write.apply(this,[node,value]);
	}
	/**
	初始化系统集成的读写方式
	@private
	*/
	SFDataRender.init=function()
	{
		/**
		@name SFDataRender.types
		@namespace 所有系统预定义的读写方法，可使用  {@link SFDataRender.getType}方法来获得这些对象
		*/

		SFDataRender.types={
			/**
			将XML节点内容之中的0和1解析为Bool类型(false和true)进行操作的方式
			@name SFDataRender.types.Bool2Int
			@type SFDataRender
			*/
			Bool2Int:	new SFDataRender(SFDataRender.Bool2IntRead,	SFDataRender.Bool2IntWrite),
			/**
			将XML节点内容之中解析为整数进行操作的方式
			@name SFDataRender.types.Int
			@type SFDataRender
			*/
			Int:		new SFDataRender(SFDataRender.IntRead,		SFDataRender.IntWrite),
			/**
			将XML节点内容之中解析为浮点数进行操作的方式
			@name SFDataRender.types.Float
			@type SFDataRender
			*/
			Float:		new SFDataRender(SFDataRender.FloatRead,	SFDataRender.FloatWrite),
			/**
			将XML节点内容之中解析为字符串进行操作的方式
			@name SFDataRender.types.String
			@type SFDataRender
			*/
			String:		new SFDataRender(SFDataRender.StringRead,	SFDataRender.StringWrite),
			/**
			将XML节点内容之中解析为JavaScript Date对象进行操作的方式
			该类型的节点内容包含一个标准的时间字符串，格式应该为“2004-01-01T08:00:00”，读取之后为一个时间对象DataTime
			@name SFDataRender.types.Time
			@type SFDataRender
			*/
			Time:		new SFDataRender(SFDataRender.TimeRead,		SFDataRender.TimeWrite)
		};
	}
	/**
	根据读写方式名称获得指定的对象
	@param {String} name 读写方式名称，参数必须是{@link SFDataRender}的一个域名称，例如"Bool2Int"
	@returns {SFDataRender}
	*/
	SFDataRender.getType=function(name)
	{
		return SFDataRender.types[name];
	}
	/**
	将XML节点内容解析为日期时间对象
	@private
	@param {XmlNode} node xml节点
	@returns {Date}
	*/
	SFDataRender.TimeRead=function(node)
	{
		return SFGlobal.getDate(SFAjax.getNodeValue(node));
	}
	/**
	将日期时间对象写入到XML节点之中
	@private
	@param {XmlNode} node xml节点
	@param {Date} value 要写入的值
	*/
	SFDataRender.TimeWrite=function(node,value)
	{
		SFAjax.setNodeValue(node,SFGlobal.getDateString(value,"s"));
	}
	/**
	将XML节点内容解析为字符串
	@private
	@param {XmlNode} node xml节点
	@returns {String}
	*/
	SFDataRender.StringRead=function(node)
	{
		return SFAjax.getNodeValue(node);
	}
	/**
	将字符串写入到XML节点之中
	@private
	@param {XmlNode} node xml节点
	@param {String} value 要写入的值
	*/
	SFDataRender.StringWrite=function(node,value)
	{
		SFAjax.setNodeValue(node,value);
	}
	/**
	将XML节点内容解析为整数
	@private
	@param {XmlNode} node xml节点
	@returns {Number}
	*/
	SFDataRender.IntRead=function(node)
	{
		return parseInt(SFAjax.getNodeValue(node));
	}
	/**
	将整数写入到XML节点之中
	@private
	@param {XmlNode} node xml节点
	@param {Number} value 要写入的值
	*/
	SFDataRender.IntWrite=function(node,value)
	{
		SFAjax.setNodeValue(node,parseInt(value));
	}
	/**
	将XML节点内容解析为布尔值
	@private
	@param {XmlNode} node xml节点
	@returns {Bool}
	*/
	SFDataRender.Bool2IntRead=function(node)
	{
		return parseInt(SFAjax.getNodeValue(node))>0?true:false;
	}
	/**
	将布尔值写入到XML节点之中
	@private
	@param {XmlNode} node xml节点
	@param {Bool} value 要写入的值
	*/
	SFDataRender.Bool2IntWrite=function(node,value)
	{
		SFAjax.setNodeValue(node,value?1:0);
	}
	/**
	将XML节点内容解析为浮点数
	@private
	@param {XmlNode} node xml节点
	@returns {Number}
	*/
	SFDataRender.FloatRead=function(node)
	{
		return parseFloat(SFAjax.getNodeValue(node));
	}
	/**
	将浮点数写入到XML节点之中
	@private
	@param {XmlNode} node xml节点
	@param {Number} value 要写入的值
	*/
	SFDataRender.FloatWrite=function(node,value)
	{
		SFAjax.setNodeValue(node,parseFloat(value));
	}
	if(!window._obscure){SFDataRender.init();}
	window.SFDataRender=SFDataRender;