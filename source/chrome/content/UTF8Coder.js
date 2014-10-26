
/*
	UTF-8 Encoder / Decoder
	Original code from Web Toolkit: http://www.webtoolkit.info/javascript-utf8.html
	Modifications by Harry O.
*/

/**
*
*  UTF-8 data encode / decode
*  http://www.webtoolkit.info/
*
**/

(function()
{
	if(window.backupfox_959a5970_ada3_11e0_9f1c_0800200c9a66_UTF8Coder != undefined)
	{
		return;
	}
	
	//class
	window.backupfox_959a5970_ada3_11e0_9f1c_0800200c9a66_UTF8Coder =
	{
		// public method for url encoding
		encode : function (string) {
			string = string.replace(/\r\n/g,"\n");
			var utftext = "";
	 
			for (var n = 0; n < string.length; n++) {
	 
				var c = string.charCodeAt(n);
	 
				if (c < 128) {
					utftext += String.fromCharCode(c);
				}
				else if((c > 127) && (c < 2048)) {
					utftext += String.fromCharCode((c >> 6) | 192);
					utftext += String.fromCharCode((c & 63) | 128);
				}
				else {
					utftext += String.fromCharCode((c >> 12) | 224);
					utftext += String.fromCharCode(((c >> 6) & 63) | 128);
					utftext += String.fromCharCode((c & 63) | 128);
				}
	 
			}
	 
			return utftext;
		},
	 
		// public method for url decoding
		decode : function (utftext) {
			var string = "";
			var i = 0;
			var c = 0;
			var c1 = 0;
			var c2 = 0;
	 
			while ( i < utftext.length ) {
	 
				c = utftext.charCodeAt(i);
	 
				if (c < 128) {
					string += String.fromCharCode(c);
					i++;
				}
				else if((c > 191) && (c < 224)) {
					c2 = utftext.charCodeAt(i+1);
					string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
					i += 2;
				}
				else {
					c2 = utftext.charCodeAt(i+1);
					c3 = utftext.charCodeAt(i+2);
					string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
					i += 3;
				}
	 
			}
	 
			return string;
		}
	}
}());

