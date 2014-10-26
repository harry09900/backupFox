
/*
	BackupFox
	Copyright © 2011 Harry O.
	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.
	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
	GNU General Public License for more details.
*/

/*
	Dependencies:
	 - Overlay XUL
	 - UTF-8 Coder
*/

(function()
{
	if (window.backupfox_959a5970_ada3_11e0_9f1c_0800200c9a66_overlay != undefined)
	{
		return;
	}
	
	//class
	window.backupfox_959a5970_ada3_11e0_9f1c_0800200c9a66_overlay = function()
	{
	};
	
	//pointer to class
	var bf = window.backupfox_959a5970_ada3_11e0_9f1c_0800200c9a66_overlay;
	
	//static data members
	//-
	bf.components = Components;
	bf.UTF8Coder = window.backupfox_959a5970_ada3_11e0_9f1c_0800200c9a66_UTF8Coder;
	//-
	bf.initialized = false;
	bf.strings = null;
	//-
	bf.preferencesService = null;
	bf.jsonService = null;
	//-
	bf.bookmarksBackupTimer = null;
	bf.historyBackupTimer = null;
	//-
	bf.isBookmarksBackupRunning = null;
	bf.isHistoryBackupRunning = null;
	//-
	bf.bookmarksService = null;
	bf.bookmarksEventObserver = null;
	bf.historyService = null;
	bf.historyEventObserver = null;
	
	//imports
	//bf.components.utils.import("resource://gre/modules/FileUtils.jsm");
	//bf.components.utils.import("resource://gre/modules/NetUtil.jsm");
	//bf.components.utils.import("resource://gre/modules/PlacesUtils.jsm");
	
	//static function
	bf.GetFileFromPath = function(filePath)
	{
		bf.components.utils.import("resource://gre/modules/FileUtils.jsm");
		
		var file = bf.components.classes["@mozilla.org/file/local;1"].createInstance(bf.components.interfaces.nsILocalFile);
		file.initWithPath(filePath);
		
		try
		{
			file.create(NORMAL_FILE_TYPE, 0600);
		}
		catch(ex)
		{
			//do nothing
		}
		
		return file;
	}
	
	//static function
	bf.AsyncWriteStringToFile = function(string, file, callback, encoding)
	{
		bf.components.utils.import("resource://gre/modules/FileUtils.jsm");
		bf.components.utils.import("resource://gre/modules/NetUtil.jsm");
		
		if(callback == undefined)
		{
			callback = function() { };
		}
		
		if(encoding == undefined)
		{
			encoding = "utf-8"
		}
		
		var ostream = FileUtils.openSafeFileOutputStream(file);
		var converter = bf.components.classes["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(bf.components.interfaces.nsIScriptableUnicodeConverter);
		converter.charset = encoding;
		var istream = converter.convertToInputStream(string);
		
		NetUtil.asyncCopy(istream, ostream, function(status)
		{
			bf.components.utils.import("resource://gre/modules/FileUtils.jsm");
			
			bf.components.utils.import("resource://gre/modules/FileUtils.jsm");
			FileUtils.closeSafeFileOutputStream(ostream);
			callback(status);
		});
	}
	
	//static function
	bf.DoBookmarksBackup = function(callback)
	{
		bf.components.utils.import("resource://gre/modules/PlacesUtils.jsm");
		
		//set default callback
		if(callback == undefined)
		{
			callback = function(status, errorId, errorException) { };
		}
		
		//if not enabled, stop now
		if( ! bf.preferencesService.getBoolPref("extensions.backupfox_959a5970_ada3_11e0_9f1c_0800200c9a66.bBookmarksEnabled") )
		{
			//callback error and end
			callback("error", "notEnabled", null);
			return;
		}
		
		//if running, stop now
		if( bf.isBookmarksBackupRunning )
		{
			//callback error and end
			callback("error", "alreadyRunning", null);
			return;
		}
		
		//set to 'is running'
		bf.isBookmarksBackupRunning = true;
		
		try
		{
			//get file path in utf-8
			var filePath = bf.UTF8Coder.decode(bf.preferencesService.getCharPref("extensions.backupfox_959a5970_ada3_11e0_9f1c_0800200c9a66.bBookmarksFilePath"));
			
			//open file for over-writing
			var file = bf.GetFileFromPath(filePath);
			
			//write bookmarks in JSON format
			PlacesUtils.backupBookmarksToFile(file);
		}
		catch(ex)
		{
			//set to 'is not running'
			bf.isBookmarksBackupRunning = false;
			
			//callback error and end
			callback("error", "exception", ex);
			return;
		}
		
		//set to 'is not running'
		bf.isBookmarksBackupRunning = false;

		//callback success
		callback("success", null, null);
	};
	
	//static function
	bf.DoHistoryBackup = function(callback)
	{
		//set default callback
		if(callback == undefined)
		{
			callback = function(status, errorId, errorException) { };
		}
		
		//if not enabled, stop now
		if( ! bf.preferencesService.getBoolPref("extensions.backupfox_959a5970_ada3_11e0_9f1c_0800200c9a66.bHistoryEnabled") )
		{
			//callback error and end
			callback("error", "notEnabled", null);
			return;
		}
		
		//if running, stop now
		if( bf.isHistoryBackupRunning )
		{
			//callback error and end
			callback("error", "alreadyRunning", null);
			return;
		}
		
		//set to 'is running'
		bf.isHistoryBackupRunning = true;
		
		try
		{
			//object to store history
			var resObj =
			{
				time: Date.now(),
				items: []
			};
			
			//create query
			var query = bf.historyService.getNewQuery();
			var options = bf.historyService.getNewQueryOptions();
			
			//set results item limit
			options.maxResults = bf.preferencesService.getIntPref("extensions.backupfox_959a5970_ada3_11e0_9f1c_0800200c9a66.bHistoryItemLimit");
			
			//get results
			var result = bf.historyService.executeQuery(query, options);
			
			// iterate over the results
			result.root.containerOpen = true;
			var count = result.root.childCount;
			for (var i = 0; i < count; i++)
			{
				var node = result.root.getChild(i);
				resObj.items.push(
				{
					title: node.title,
					uri: node.uri,
					accessCount: node.accessCount,
					time: node.time,
					icon: node.icon
				});
			}
			result.root.containerOpen = false;
			
			//encode to json string
			var resObjEncoded = bf.jsonService.encode(resObj);
			
			//get file path in utf-8
			var filePath = bf.UTF8Coder.decode(bf.preferencesService.getCharPref("extensions.backupfox_959a5970_ada3_11e0_9f1c_0800200c9a66.bHistoryFilePath"));
			
			//open file for over-writing
			var file = bf.GetFileFromPath(filePath);
			
			//write to file
			bf.AsyncWriteStringToFile(resObjEncoded, file, function(fIOstatus)
			{
				//set to 'is not running'
				bf.isHistoryBackupRunning = false;
				
				//test status
				if ( bf.components.isSuccessCode(fIOstatus) )
				{
					//callback success
					callback("success", null, null);
				}
				else
				{
					//callback error
					callback("error", "fileIO", null);
				}
			});
		}
		catch(ex)
		{
			//set to 'is not running'
			bf.isHistoryBackupRunning = false;
			
			//callback error
			callback("error", "exception", ex);
		}
	};
	
	//static function
	bf.ClearTimer = function(timer)
	{
		//clear timer
		timer[0].cancel();
		timer[0] = null;
	};
	
	//static function
	bf.StopAndClearTimer = function(timer)
	{
		//if a timer is running then clear it
		if(timer[0] != null)
		{
			//clear timer
			bf.ClearTimer(timer);
		}
	};
	
	//static function
	bf.BeginTimedBackup = function(timer, periodSec, funct)
	{
		//get timer period from settings
		var timerPeriodMs = periodSec * 1000;
		
		//stop and clear timer
		bf.StopAndClearTimer(timer);
		
		//set new timer
		timer[0] = bf.components.classes["@mozilla.org/timer;1"].createInstance(bf.components.interfaces.nsITimer);
		timer[0].initWithCallback(
		{
			notify: function(timerb)
			{
				//clear timer on fire
				bf.ClearTimer(timer);
				
				//call the function
				funct();
			}
		}, timerPeriodMs, bf.components.interfaces.nsITimer.TYPE_ONE_SHOT);
	};
	
	//static function
	bf.MenuBookmarksBackup = function()
	{
		//if not enabled, end now
		if( ! bf.preferencesService.getBoolPref("extensions.backupfox_959a5970_ada3_11e0_9f1c_0800200c9a66.bBookmarksEnabled") )
		{
			alert(bf.strings.getString("bookmarksMenuItem.notEnabledMessage"));
			return;
		}
		
		//do the backup
		bf.DoBookmarksBackup(function(status, errorId, errorException)
		{
			if(status == "success")
			{
				alert(bf.strings.getString("bookmarksMenuItem.successMessage"));
			}
			else
			{
				alert(bf.strings.getString("bookmarksMenuItem.errorMessage"));
				if(errorException != null)
				{
					//log exception to console
					bf.components.utils.reportError(errorException);
				}
			}
		});
	};
	
	//static function
	bf.MenuHistoryBackup = function()
	{
		//if not enabled, end now
		if( ! bf.preferencesService.getBoolPref("extensions.backupfox_959a5970_ada3_11e0_9f1c_0800200c9a66.bHistoryEnabled") )
		{
			alert(bf.strings.getString("historyMenuItem.notEnabledMessage"));
			return;
		}
		
		//do the backup
		bf.DoHistoryBackup(function(status, errorId, errorException)
		{
			if(status == "success")
			{
				alert(bf.strings.getString("historyMenuItem.successMessage"));
			}
			else
			{
				alert(bf.strings.getString("historyMenuItem.errorMessage"));
				if(errorException != null)
				{
					//log exception to console
					bf.components.utils.reportError(errorException);
				}
			}
		});
	};
	
	//static function
	bf.OnLoad = function()
	{
		//init strings
		bf.strings = document.getElementById("backupfox_959a5970_ada3_11e0_9f1c_0800200c9a66-strings");
		
		//init preferences
		bf.preferencesService = bf.components.classes["@mozilla.org/preferences-service;1"].getService(bf.components.interfaces.nsIPrefService);
		
		//init json service
		bf.jsonService = bf.components.classes["@mozilla.org/dom/json;1"].createInstance(bf.components.interfaces.nsIJSON);
		
		//init the backup timers
		bf.bookmarksBackupTimer = [null];
		bf.historyBackupTimer = [null];
		
		//init the 'is backup running' booleans
		bf.isBookmarksBackupRunning = false;
		bf.isHistoryBackupRunning = false;
		
		//init bookmarks service
		bf.bookmarksService = Cc["@mozilla.org/browser/nav-bookmarks-service;1"].getService(Ci.nsINavBookmarksService);
		
		//init bookmarks observer
		bf.bookmarksEventObserver =
		{
			onBeginUpdateBatch: function() { },
			onEndUpdateBatch: function() { this._inBatch = false; },
			onItemAdded: function(id, folder, index) { },
			onBeforeItemRemoved: function() { },
			onItemRemoved: function(id, folder, index) { },
			onItemChanged: function(id, property, isAnnotationProperty, value)
			{
				//begin timed backup
				bf.BeginTimedBackup(
					bf.bookmarksBackupTimer,
					bf.preferencesService.getIntPref("extensions.backupfox_959a5970_ada3_11e0_9f1c_0800200c9a66.bBookmarksDelaySec"),
					function()
					{
						bf.DoBookmarksBackup(function(status, errorId, errorException)
						{
							if(errorException != null)
							{
								//log exception to console
								bf.components.utils.reportError(errorException);
							}
						})
					});
			},
			onItemVisited: function(id, visitID, time) { },
			onItemMoved: function(id, oldParent, oldIndex, newParent, newIndex) { },
			QueryInterface: function(iid) { if (iid.equals(Ci.nsINavBookmarkObserver) || iid.equals(Ci.nsISupports)) { return this; } throw Cr.NS_ERROR_NO_INTERFACE; }
		};
		
		//register the observer with the bookmarks service
		//Note: Normally you un-register the observer when finished with it. bmsvc.removeObserver(bf.bookmarksEventObserver);
		bf.bookmarksService.addObserver(bf.bookmarksEventObserver, false);
		
		//init history service
		bf.historyService = bf.components.classes["@mozilla.org/browser/nav-history-service;1"].getService(bf.components.interfaces.nsINavHistoryService);
		
		//init history observer
		bf.historyEventObserver =
		{
			onBeginUpdateBatch: function() { },
			onEndUpdateBatch: function() { },
			onVisit: function(aURI, aVisitID, aTime, aSessionID, aReferringID, aTransitionType)
			{
				//begin timed backup
				bf.BeginTimedBackup(
					bf.historyBackupTimer,
					bf.preferencesService.getIntPref("extensions.backupfox_959a5970_ada3_11e0_9f1c_0800200c9a66.bHistoryDelaySec"),
					function()
					{
						bf.DoHistoryBackup(function(status, errorId, errorException)
						{
							if(errorException != null)
							{
								//log exception to console
								bf.components.utils.reportError(errorException);
							}
						})
					});
			},
			onTitleChanged: function(aURI, aPageTitle) { },
			onDeleteURI: function(aURI) { },
			onClearHistory: function() { },
			onPageChanged: function(aURI, aWhat, aValue) { },
			onPageExpired: function(aURI, aVisitTime, aWholeEntry) { },
			QueryInterface: function(iid) { if (iid.equals(bf.components.interfaces.nsINavHistoryObserver) || iid.equals(bf.components.interfaces.nsISupports)) { return this; } throw Cr.NS_ERROR_NO_INTERFACE; }
		};
		
		//register the observer with history service
		//Note: Normally you un-register the observer when finished with it.
		bf.historyService.addObserver(bf.historyEventObserver, false);
		
		//show preferences on first run
		if( bf.preferencesService.getBoolPref("extensions.backupfox_959a5970_ada3_11e0_9f1c_0800200c9a66.isFirstRun") )
		{
			bf.preferencesService.setBoolPref("extensions.backupfox_959a5970_ada3_11e0_9f1c_0800200c9a66.isFirstRun", false);
			window.open("chrome://backupfox/content/options.xul", "", "chrome");
		}
		
		//set object to initialized
		bf.initialized = true;
	};
	
	//static function
	bf.OnUnLoad = function()
	{
		//clear all timers
		bf.StopAndClearTimer(bf.bookmarksBackupTimer);
		bf.StopAndClearTimer(bf.historyBackupTimer);
		
		//do one last back-up and ignore result
		bf.DoBookmarksBackup();
		bf.DoHistoryBackup();
	};
	
	//hook event handlers
	window.addEventListener("load", bf.OnLoad, false);
	window.addEventListener("unload", bf.OnUnLoad, false);
	
})();

