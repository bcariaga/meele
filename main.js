const {app, BrowserWindow} = require('electron');
const Memcached = require('memcached');

var server = process.env.SERVER || '127.0.0.1:11211';
var memcached = new Memcached(server);

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

function createWindow () {
	// Create the browser window.
	//
	win = new BrowserWindow(
		{
			titleBarStyle: 'hiddenInset',
			frame: false,
			width: 1280, height: 720,
			minWidth: 600, minHeight :600 
		}
	);
	win.setMenu(null);
	// and load the index.html of the app.
	// win.loadFile('index.html');
	win.loadFile('main.html');
	win.webContents.openDevTools({mode: 'detach'});
	memcached.set('foo', 'bar', 10, function (err) { if (err)console.log(err) });
	win.on('closed', () => {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		win = null
	});
	win.webContents.on('did-finish-load', () => {
		
		memcached.slabs(function(err, stats){
			if (err)console.error(err);
			
	
			let slabsIds = Object.keys(stats[0]);
			for (let slabId in slabsIds) {
				let slabIdInt = parseInt(slabId);
				if ( slabIdInt !== NaN){
					memcached.cachedump(server, slabIdInt, 0, function(err, cachedump){
						if (err)
							console.log(err);
						else if(cachedump){
							
							// var stored = {key : cachedump.key}
							memcached.get(cachedump.key, function(err, data){
								if (err) {
									console.log(err);
								} else {
									win.webContents.send("memcached", {
										key : cachedump.key,
										data : data
									});
								}
							});
						}
					});
				} 
	
	
			}
		});
	})


}
  
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)
  
// Quit when all windows are closed.
app.on('window-all-closed', () => {
	// On macOS it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin') {
		app.quit()
	}
});
  
app.on('activate', () => {
	// On macOS it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (win === null) {
		createWindow()
	}
});
  
  // In this file you can include the rest of your app's specific main process
  // code. You can also put them in separate files and require them here.