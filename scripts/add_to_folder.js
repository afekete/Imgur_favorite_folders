$(document).ready(function() {
	var htmlURL = chrome.extension.getURL("dropdown.html");
	$.get(htmlURL, function (data) {
		$("#right-content").append(data)
	})

	chrome.storage.sync.get(null, function (data){
		var title = $("#image-title").text()
		var membership = $('#member')
		for(var key in data) {
			if(data.hasOwnProperty(key)) {
				$("#folders").prepend('<option value="'+key+'">'+key+'</option>')
				var items = data[key]
				for(var i=0; i<items.length; i++) {
					if(items[i]['title'] === title){
						membership.append(document.createTextNode(key));
						membership.append("<br/>")
						break;
					}
				}
			}
		}
	})
})


$("#right-content").on("click", "#add-img", function (e) {
	e.preventDefault();
	var curr_url = window.location.href
	var thumb_url = $(".selected div .image-thumb img").attr("data-src")
	var title = $("#image-title").text()

	if(!thumb_url)
		console.log("Not added. Thumbnail url not available.")
		return

	var folder_name = $("#folders").val()
	if(folder_name == 'dump')
		chrome.storage.sync.get(null, function (data) { console.info(data) });
	else {
		chrome.storage.sync.get(folder_name, function (data){
			var obj = {}
			if(jQuery.isEmptyObject(data)){
				obj[folder_name] = [{'url': curr_url.slice(16), 'thumb': thumb_url, 'title': title}]
				chrome.storage.sync.set(obj, function() {
					console.log(curr_url.slice(16)+" added to "+folder_name)
				})
			}
			else{
				data[folder_name].push({'url': curr_url.slice(16), 'thumb': thumb_url, 'title': title})
				obj[folder_name] = data[folder_name]
				chrome.storage.sync.set(obj, function() {
					console.log(curr_url.slice(16)+" added to "+folder_name)
				})
			}
		})
	}
})

$("#right-content").on("click", "#rem-img", function (e) {
	e.preventDefault;
	var folder_name = $("#folders").val()
	var title = $("#image-title").text()
	chrome.storage.sync.get(folder_name, function (data){
		var items = data[folder_name]
		for(var i=0; i<items.length; i++) {
			if(items[i]['title'] == title)
				items.splice(i, 1)
		}
		var obj = {}
		obj[folder_name] = items
		chrome.storage.sync.set(obj, function() {
			console.log("image removed from "+folder_name)
		})
	})
})

$("#right-content").on("click", "#add-fol", function (e) {
	e.preventDefault;
	var new_folder_name = window.prompt("Enter a new folder name", "New folder")
	var obj = {}
	obj[new_folder_name] = []
	chrome.storage.sync.set(obj, function() {
		console.log("folder '"+new_folder_name+"' added")
		$("#folders").prepend('<option value="'+new_folder_name+'">'+new_folder_name+'</option>')
	})
})

$("#right-content").on("click", "#del-fol", function (e) {
	e.preventDefault;
	var folder_name = $("#folders").val()
	chrome.storage.sync.remove(folder_name, function() {
		console.log(folder_name+" deleted")
	})
})

$("#right-content").on("click", "#rename", function (e) {
	e.preventDefault;
	var folder_name = $("#folders").val()
	var new_folder_name = window.prompt("Enter a new folder name", "New name")
	chrome.storage.sync.get(folder_name, function (data){
		var items = data[folder_name]
		var obj = {}
		obj[new_folder_name] = items
		chrome.storage.sync.set(obj, function() {
			chrome.storage.sync.remove(folder_name, function() {
				$("#folders option[value='"+folder_name+"']").text(new_folder_name)
				$("#folders option[value='"+folder_name+"']").attr("value", new_folder_name)
				console.log("folder name changed to "+new_folder_name)
			})
		})
	})
})

$("#right-content").on("click", "#clear", function (e) {
	e.preventDefault;
	chrome.storage.sync.clear()
})